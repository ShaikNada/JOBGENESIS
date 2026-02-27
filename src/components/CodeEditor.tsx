import Editor, { type OnMount } from '@monaco-editor/react';
import {
  Play, Send, Loader2, Terminal, CheckCircle2, XCircle,
  ChevronUp, ChevronDown, Settings, Keyboard, Zap, Lightbulb
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { analyzeComplexity, getHint } from '../lib/api/ai';
import { getSocket } from '../socket';

const LANGUAGES: Record<string, { name: string; icon: string }> = {
  javascript: { name: "JavaScript", icon: "JS" },
  python: { name: "Python", icon: "PY" },
  java: { name: "Java", icon: "☕" },
  cpp: { name: "C++", icon: "C++" }
};

export interface TestResult {
  case: string;
  input?: string;
  expected?: string;
  actual?: string;
  status: "Passed" | "Failed";
}

export interface EvaluationResult {
  passed: boolean;
  passCount?: number;
  totalTests?: number;
  consoleOutput?: string[];
  results?: TestResult[];
  feedback?: string;
}

interface Props {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onRun: (
    mode: 'run' | 'submit' | 'custom',
    customInput?: string
  ) => Promise<EvaluationResult | null>;
  isRunning: boolean;
  problemDescription?: string; // Added for hint context
  missionId?: string; // for real-time collaboration
}

export const CodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  onRun,
  isRunning,
  problemDescription = "",
  missionId
}: Props) => {

  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'ai'>('output');
  const [fontSize, setFontSize] = useState(14);
  const [testData, setTestData] = useState<EvaluationResult | null>(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ type: 'complexity' | 'hint', content: any } | null>(null);

  const editorRef = useRef<any>(null);
  // connection state kept for future use
  const lastSender = useRef<string | null>(null);

  // debounce helper
  const codeUpdateTimeout = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // sync setup when missionId changes
  useEffect(() => {
    if (!missionId) return;
    const socket = getSocket();

    socket.emit('join_mission', { missionId });

    const onCodeUpdate = ({ code: incoming, sender }: { code: string; sender: string }) => {
      // ignore updates from self
      if (sender === socket.id) return;
      lastSender.current = sender;
      setCode(incoming);
    };

    socket.on('code_update', onCodeUpdate);

    // connection events could be handled here if needed

    return () => {
      socket.off('code_update', onCodeUpdate);
    };
  }, [missionId, setCode]);

  const handleAction = async (mode: 'run' | 'submit' | 'custom') => {
    if (!isTerminalOpen) setIsTerminalOpen(true);

    const effectiveMode =
      mode === 'run' && activeTab === 'input' ? 'custom' : mode;

    const inputToSend = undefined; // custom input tab removed

    setActiveTab('output');
    setTestData(null);
    setAiFeedback(null);

    const result = await onRun(effectiveMode, inputToSend);
    if (result) setTestData(result);
  };

  const handleComplexityAnalysis = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setIsTerminalOpen(true);
    setActiveTab('ai');
    try {
      const result = await analyzeComplexity(code, language);
      setAiFeedback({ type: 'complexity', content: result });
    } catch (e) {
      setAiFeedback({ type: 'complexity', content: { explanation: "Failed to analyze code." } });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetHint = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setIsTerminalOpen(true);
    setActiveTab('ai');
    try {
      const result = await getHint(code, language, problemDescription);
      setAiFeedback({ type: 'hint', content: result });
    } catch (e) {
      setAiFeedback({ type: 'hint', content: { hint: "Could not generate hint." } });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ✅ NORMALIZED, SAFE RESULTS ARRAY
  const safeResults: TestResult[] =
    Array.isArray(testData?.results) ? testData!.results : [];

  return (
    <div className="h-full flex flex-col bg-dark-950 relative border-r border-dark-800 overflow-hidden">

      {/* TOP TOOLBAR */}
      <div className="h-12 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-dark-800 hover:bg-dark-700 px-3 py-1.5 rounded border border-dark-700">
              <span className="text-neon-red font-bold">
                {LANGUAGES[language].icon}
              </span>
              {LANGUAGES[language].name}
              <ChevronDown size={12} className="text-gray-500" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-dark-900 border border-dark-700 rounded-lg shadow-xl hidden group-hover:block z-50">
              {Object.keys(LANGUAGES).map((key) => (
                <button
                  key={key}
                  onClick={() => setLanguage(key)}
                  className="w-full px-4 py-3 text-xs text-left hover:bg-dark-800"
                >
                  {LANGUAGES[key].name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-dark-700"></div>

          <div className="flex items-center gap-2 text-gray-500">
            <Settings size={12} />
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
              className="w-16 accent-neon-red"
            />
          </div>
        </div>

        <div className="flex gap-2">

          {/* AI TOOLS */}
          <button
            onClick={handleComplexityAnalysis}
            disabled={isAnalyzing || isRunning}
            className="flex items-center gap-1 text-xs text-yellow-400 hover:bg-dark-800 px-3 py-1.5 rounded"
            title="Analyze Complexity"
          >
            <Zap size={14} /> Analyze
          </button>

          <button
            onClick={handleGetHint}
            disabled={isAnalyzing || isRunning}
            className="flex items-center gap-1 text-xs text-blue-400 hover:bg-dark-800 px-3 py-1.5 rounded"
            title="Get Hint"
          >
            <Lightbulb size={14} /> Hint
          </button>

          <div className="h-4 w-px bg-dark-700 mx-2"></div>

          <button
            onClick={() => handleAction('run')}
            disabled={isRunning}
            className="bg-dark-800 px-4 py-1.5 rounded"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run
          </button>
          <button
            onClick={() => handleAction('submit')}
            disabled={isRunning}
            className="bg-green-600 px-4 py-1.5 rounded text-white"
          >
            {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Submit
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(v) => {
            const val = v || "";
            setCode(val);
            if (missionId) {
              clearTimeout(codeUpdateTimeout.current);
              codeUpdateTimeout.current = setTimeout(() => {
                const socket = getSocket();
                socket.emit('code_update', { missionId, code: val });
              }, 250);
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize,
            fontFamily: "'JetBrains Mono', monospace",
            automaticLayout: true
          }}
        />
      </div>

      {/* TERMINAL */}
      <div className={clsx(
        "absolute bottom-0 w-full bg-dark-900 border-t border-dark-700 transition-all flex flex-col",
        isTerminalOpen ? "h-[200px]" : "h-9"
      )}>

        <div className="h-9 flex items-center px-2 border-b border-dark-800 justify-between shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className="text-xs font-mono flex items-center gap-2"
            >
              <Terminal size={12} /> CONSOLE
              {isTerminalOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>

            {isTerminalOpen && (
              <>
                <button
                  onClick={() => setActiveTab('output')}
                  className={clsx("text-xs px-2 border-b-2 transition-colors", activeTab === 'output' ? "border-neon-red text-white" : "border-transparent text-gray-500")}
                >
                  Output
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={clsx("text-xs px-2 border-b-2 transition-colors", activeTab === 'ai' ? "border-yellow-500 text-yellow-500" : "border-transparent text-gray-500")}
                >
                  AI Coach
                </button>
              </>
            )}
          </div>
        </div>

        {isTerminalOpen && (
          <div className="p-4 overflow-y-auto flex-1 h-full pb-10 min-h-0">

            {isRunning || isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-neon-red">
                <Loader2 className="animate-spin" />
                <span className="mt-2 text-xs text-gray-400">{isAnalyzing ? "Analyzing..." : "Running..."}</span>
              </div>
            ) : (
              <>
                {activeTab === 'ai' && (
                  <div className="text-sm font-mono text-gray-300">
                    {aiFeedback ? (
                      aiFeedback.type === 'complexity' ? (
                        <div className="space-y-2">
                          <h3 className="text-yellow-400 font-bold">Complexity Analysis</h3>
                          <p>⏱️ <span className="text-white">Time:</span> {aiFeedback.content.timeComplexity}</p>
                          <p>💾 <span className="text-white">Space:</span> {aiFeedback.content.spaceComplexity}</p>
                          <p className="text-gray-400 italic mt-2 border-l-2 border-dark-700 pl-3">
                            "{aiFeedback.content.explanation}"
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="text-blue-400 font-bold">💡 Hint</h3>
                          <p className="text-gray-300">
                            {aiFeedback.content.hint}
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="text-center text-gray-500 mt-8">
                        <Zap className="mx-auto mb-2 opacity-50" />
                        <p>Select "Analyze" or "Hint" from the toolbar.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'output' && (
                  <>
                    {testData ? (
                      <>
                        {safeResults.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {safeResults.map((res, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={clsx(
                                  "p-3 rounded border",
                                  res.status === "Passed"
                                    ? "border-green-500 text-green-400"
                                    : "border-red-500 text-red-400"
                                )}
                              >
                                {res.status === "Passed"
                                  ? <CheckCircle2 size={14} />
                                  : <XCircle size={14} />}
                                Case {i + 1}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs mt-4">
                            {testData.feedback || "No test cases executed."}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 mt-8">
                        <Keyboard className="mb-2 opacity-50" />
                        Run code to see results
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

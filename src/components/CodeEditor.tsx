import Editor, { type OnMount } from '@monaco-editor/react';
import {
  Play, Send, Loader2, Terminal, CheckCircle2, XCircle,
  ChevronUp, ChevronDown, Settings, Keyboard
} from 'lucide-react';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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
}

export const CodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  onRun,
  isRunning
}: Props) => {

  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');
  const [customInput, setCustomInput] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [testData, setTestData] = useState<EvaluationResult | null>(null);

  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleAction = async (mode: 'run' | 'submit' | 'custom') => {
    if (!isTerminalOpen) setIsTerminalOpen(true);

    const effectiveMode =
      mode === 'run' && activeTab === 'input' ? 'custom' : mode;

    const inputToSend =
      effectiveMode === 'custom' ? customInput : undefined;

    setActiveTab('output');
    setTestData(null);

    const result = await onRun(effectiveMode, inputToSend);
    if (result) setTestData(result);
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
          onChange={(v) => setCode(v || "")}
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
        "absolute bottom-0 w-full bg-dark-900 border-t border-dark-700 transition-all",
        isTerminalOpen ? "h-[200px]" : "h-9"
      )}>

        <div className="h-9 flex items-center px-2 border-b border-dark-800">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="text-xs font-mono"
          >
            <Terminal size={12} /> CONSOLE
            {isTerminalOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>

        {isTerminalOpen && (
          <div className="p-4 overflow-y-auto h-full">

            {isRunning && (
              <div className="flex flex-col items-center text-neon-red">
                <Loader2 className="animate-spin" />
                Running...
              </div>
            )}

            {!isRunning && testData && (
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
            )}

            {!isRunning && !testData && (
              <div className="flex flex-col items-center text-gray-500">
                <Keyboard />
                Run code to see results
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

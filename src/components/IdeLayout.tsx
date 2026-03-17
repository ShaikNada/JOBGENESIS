import { useEffect, useState, useRef } from 'react';
import { generateCodingChallenge, evaluateCode } from '../lib/gemini';
import { getSocket } from '../socket';
import { ProblemPanel } from './ProblemPanel';
import { CodeEditor, type EvaluationResult } from './CodeEditor';
import { AssistantPanel } from './AssistantPanel';
import { SentinelCam } from './SentinelCam';
import { ResultsModal } from './ResultsModal';
import { useTimer } from '../hooks/useTimer';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Cpu, Zap, Timer, AlertTriangle } from 'lucide-react';

interface Props {
  role: string;
  company: string;
  experienceLevel: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  bountyId?: string;
  roomId?: string; // For Co-Op mode
  candidateId?: string;
  onComplete: (score: number, finalCode: string) => void;
}

export const IdeLayout = ({ role, company, experienceLevel, difficulty = 'normal', bountyId, roomId, candidateId, onComplete }: Props) => {
  const [score, setScore] = useState(100);

  const handleProctorStrike = (reason: string) => { 
      setScore(prev => Math.max(0, prev - 10)); 
      toast.error(`⚠️ ${reason} (-10 PTS)`); 
      
      if (candidateId) {
        getSocket().emit('candidate_telemetry', { id: candidateId, risk: 'High' });
        getSocket().emit('candidate_log', { 
          log: `> [ENGINE] Proctor Strike on Candidate ${candidateId}: ${reason}` 
        });
      }
  };

  useEffect(() => {
    if (candidateId) {
      getSocket().emit('candidate_telemetry', { id: candidateId, score });
    }
  }, [score, candidateId]);

  const { warnings: _warnings, disqualified } = useAntiCheat(handleProctorStrike); 
  const { timeLeft, startTimer, stopTimer, formatTime } = useTimer(45);
  const mounted = useRef(false);
  const [stage, setStage] = useState(1);
  const TOTAL_STAGES = bountyId ? 1 : 3; // Bounties are 1-shot fixes

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<any>(null);

  const [language, setLanguage] = useState("javascript");
  const [codeSnippets, setCodeSnippets] = useState<Record<string, string>>({
    javascript: "", python: "", java: "", cpp: ""
  });

  const [isRunning, setIsRunning] = useState(false);

  // Monitor Anti-Cheat Disqualifications
  useEffect(() => {
    if (disqualified) {
      stopTimer();
      toast.error("MISSION TERMINATED: Integrity Breach Limit Reached", { id: "dq", duration: 8000 });
      // Heavily penalize the final score
      setTimeout(() => {
        onComplete(Math.max(0, score - 50), codeSnippets[language] || "// DISQUALIFIED");
      }, 3000);
    }
  }, [disqualified]);

  useEffect(() => {
    const init = async () => {
      if (mounted.current) return;
      mounted.current = true;
      setLoading(true);
      setShowSuccessModal(false);
      setShowFailureModal(false);

      // FIX: Added '_v2' to force refresh of cached data so new backend logic runs
      try {
        let data;
        if (bountyId) {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/problems/${bountyId}`);
            if (res.ok) {
                data = await res.json();
            } else {
                toast.error("Bounty not found or corrupted.");
            }
        } else {
            data = await generateCodingChallenge(role, company, stage, experienceLevel, difficulty);
        }

        if (data) {
          setProblem(data);
          const s = data.starterCode;
          if (typeof s === 'object' && s !== null) {
            setCodeSnippets({
              javascript: s.javascript || "",
              python: s.python || "",
              java: s.java || "",
              cpp: s.cpp || ""
            });
          } else {
            // Fallback for legacy string data
            setCodeSnippets({
              javascript: typeof s === 'string' ? s : "",
              python: "",
              java: "",
              cpp: ""
            });
          }
          setLanguage("javascript");
        }
      } catch (error) {
        toast.error("AI Busy (429). Wait 1 min.");
      }
      setLoading(false);
      startTimer();


      setLoading(false);
      startTimer();
    };
    init();
    return () => { mounted.current = false; };
  }, [role, company, stage, experienceLevel]);

  const handleLanguageChange = (newLang: string) => setLanguage(newLang);
  const handleCodeChange = (newCode: string) => setCodeSnippets(prev => ({ ...prev, [language]: newCode }));
  // handleHintUsed logic integrated into AssistantPanel or tracked via state if needed

  const handleRunCode = async (mode: 'run' | 'submit' | 'custom', customInput?: string) => {
    if (!problem) return null;

    const currentCode = codeSnippets[language] || "";

    if (mode === 'custom' && !customInput?.trim()) {
      toast.error("Enter input data first!");
      return null;
    }
    if (currentCode.trim().length < 15) {
      toast.error("Code is too short!");
      return null;
    }

    setIsRunning(true);

    try {
      const result = await evaluateCode(currentCode, problem.description, language, mode, customInput, problem._id || problem.id);
      setIsRunning(false);

      setLastResult(result);

      if (mode === 'custom') {
        toast.success("Debug Run Complete");
      }
      else if (mode === 'run') {
        if (result.passed) toast.success("Checks Passed!");
        else toast.error("Checks Failed");
      }
      else if (mode === 'submit') {
        if (result.passed) {
          stopTimer();
          toast.success("ALL TEST CASES PASSED!");
          setShowSuccessModal(true);
        } else {
          setScore(prev => Math.max(0, prev - 5));
          setShowFailureModal(true);
        }
      }
      return result;

    } catch (e) {
      setIsRunning(false);
      toast.error("Execution Error");
      return null;
    }
  };

  const handleNextLevel = () => {
    setShowSuccessModal(false);
    mounted.current = false;
    if (stage < TOTAL_STAGES) {
      setStage(prev => prev + 1);
      startTimer();
    } else {
      if (onComplete) {
        onComplete(score, codeSnippets[language] || "");
      } else {
        setShowResults(true);
      }
    }
  };

  const getRoundTitle = () => stage === 1 ? "Round 1: DSA Warm-up" : stage === 2 ? "Round 2: Algorithmic Logic" : `Round 3: ${role} Practical`;

  return (
    <div className="h-screen w-full bg-dark-950 text-white overflow-hidden flex flex-col relative">
      <div className="h-14 border-b border-neon-red/30 bg-dark-900 flex items-center justify-between px-6 z-10 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-neon-red font-black tracking-widest uppercase flex items-center gap-2"><Cpu size={16} /> JobGenesis OS</span>
          <span className="text-xs text-white font-mono opacity-80">{role} @ {company}</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          <div className="flex items-center gap-2 font-mono text-xl font-bold text-white"><Timer size={18} className="text-neon-red" />{formatTime()}</div>
          <div className="flex items-center gap-2 font-mono text-xl font-bold text-white"><Zap size={18} className="text-neon-red" />{score} PTS</div>
        </div>
        <div className="flex items-center gap-3"><div className="bg-neon-red/10 px-4 py-1 border border-neon-red text-neon-red text-[10px] font-bold">{getRoundTitle()}</div></div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-12 relative">
        <div className="col-span-3 h-full border-r border-dark-800 bg-dark-950 flex flex-col relative">
          <div className="flex-1 overflow-hidden relative"><ProblemPanel loading={loading} problem={problem} /></div>
          <div className="absolute bottom-0 left-0 w-64 h-48 opacity-0 pointer-events-none -z-50 overflow-hidden"><SentinelCam onStrike={handleProctorStrike} /></div>
        </div>

        <div className="col-span-6 h-full flex flex-col relative overflow-hidden bg-dark-950">
          <CodeEditor
            key={stage}
            code={codeSnippets[language] || ""}
            setCode={handleCodeChange}
            language={language}
            setLanguage={handleLanguageChange}
            onRun={handleRunCode}
            isRunning={isRunning}
            missionId={roomId || problem?._id || problem?.id}
          />
        </div>

        <div className="col-span-3 h-full border-l border-dark-800 overflow-hidden bg-dark-950">
          <AssistantPanel currentCode={codeSnippets[language]} problemContext={problem?.description || ""} />
        </div>

        {showSuccessModal && (
          <div className="absolute inset-0 z-50 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
            <div className="bg-dark-900 p-8 rounded-2xl border border-neon-red/50 shadow-[0_0_50px_rgba(34,197,94,0.2)] max-w-md text-center">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white mb-2">Code Accepted!</h2>
              <div className="text-green-400 font-mono text-lg mb-6">10/10 Test Cases Passed</div>
              <button onClick={handleNextLevel} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl">Continue to Next Round</button>
            </div>
          </div>
        )}

        {showFailureModal && lastResult && (
          <div className="absolute inset-0 z-50 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
            <div className="bg-dark-900 p-8 rounded-2xl border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-md text-center">
              <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Submission Rejected</h2>
              <div className="text-red-400 font-mono text-xl mb-2 font-bold">
                {lastResult.passCount}/{lastResult.totalTests} Test Cases Passed
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowFailureModal(false)} className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-lg border border-dark-600">Review Code</button>
              </div>
            </div>
          </div>
        )}

        {showResults && <ResultsModal score={score} totalTime={(45 * 60) - timeLeft} role={role} company={company} skillTags={[role, ...(problem?.tags || [])]} onRestart={() => window.location.reload()} />}
      </div>
    </div>
  );
};
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ArrowRight, CheckCircle2, XCircle, Timer, Award, Terminal, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SentinelCam } from './SentinelCam';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { getSocket } from '../socket';
import { fetchTechnicalExam } from '../lib/api/ai';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface TechnicalExamProps {
    role: string;
    company: string;
    levelMenu?: string;
    focus?: string;
    level?: string;
    difficulty?: 'easy' | 'normal' | 'hard';
    candidateId?: string;
    onFinish: (score: number) => void;
}

export const TechnicalExam = ({ role, company, level, focus, difficulty = 'normal', candidateId, onFinish }: TechnicalExamProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [examScore, setExamScore] = useState(0);
    const [integrityScore, setIntegrityScore] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Refs to avoid stale closures in timers
    const currentIndexRef = useRef(0);
    const questionsRef = useRef<Question[]>([]);
    const showExplanationRef = useRef(false);
    const isFinishedRef = useRef(false);
    const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep refs in sync
    useEffect(() => { currentIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
    useEffect(() => { questionsRef.current = questions; }, [questions]);
    useEffect(() => { showExplanationRef.current = showExplanation; }, [showExplanation]);
    useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);

    const handleProctorStrike = useCallback((reason: string) => {
        setIntegrityScore(prev => Math.max(0, prev - 5));
        toast.error(`⚠️ Warning: ${reason} (-5 integrity)`, { duration: 2000 });
        
        if (candidateId) {
            getSocket().emit('candidate_telemetry', { id: candidateId, risk: 'Medium' });
            getSocket().emit('candidate_log', { 
                log: `> [PROCTOR] Strike on Candidate ${candidateId}: ${reason}` 
            });
        }
    }, [candidateId]);

    const { disqualified } = useAntiCheat(handleProctorStrike);

    useEffect(() => {
        if (disqualified) {
            toast.error("Assessment terminated: Too many integrity warnings.", { duration: 5000 });
            setTimeout(() => {
                onFinish(0);
            }, 2000);
        }
    }, [disqualified, onFinish]);

    // Fetch questions
    useEffect(() => {
        let cancelled = false;
        const fetchQuestions = async () => {
            try {
                const data = await fetchTechnicalExam({ role, company, level, focus, difficulty });
                if (!cancelled) {
                    setQuestions(data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch questions", err);
                if (!cancelled) {
                    toast.error("Could not load assessment questions. Please try again.");
                    setIsLoading(false);
                }
            }
        };
        fetchQuestions();
        return () => { cancelled = true; };
    }, [role, company, level, focus, difficulty]);

    // Advance to next question (stable callback using refs)
    const advanceToNext = useCallback(() => {
        // Clear any pending auto-advance
        if (autoAdvanceRef.current) {
            clearTimeout(autoAdvanceRef.current);
            autoAdvanceRef.current = null;
        }

        if (currentIndexRef.current < questionsRef.current.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setTimeLeft(30);
        } else {
            setIsFinished(true);
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (isLoading || isFinished || showExplanation) return;
        if (questions.length === 0) return;

        if (timeLeft <= 0) {
            // Time ran out — auto-submit with no answer selected
            toast('⏱ Time\'s up! Moving to next question.', { icon: '⏰', duration: 1500 });
            setShowExplanation(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isLoading, isFinished, showExplanation, questions.length]);

    // Auto-advance after explanation is shown (3 seconds)
    useEffect(() => {
        if (!showExplanation || isFinished) return;

        autoAdvanceRef.current = setTimeout(() => {
            advanceToNext();
        }, 3000);

        return () => {
            if (autoAdvanceRef.current) {
                clearTimeout(autoAdvanceRef.current);
                autoAdvanceRef.current = null;
            }
        };
    }, [showExplanation, isFinished, advanceToNext]);

    const handleOptionSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
            setExamScore(prev => prev + 1);
            toast.success("✓ Correct!", { duration: 1500 });
        } else {
            toast.error("✗ Incorrect", { duration: 1500 });
        }

        setShowExplanation(true);
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-dark-950 flex flex-col items-center justify-center text-white font-mono p-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse"></div>
                    <Loader2 size={64} className="animate-spin text-blue-400 relative z-10" />
                </div>
                <h2 className="mt-8 text-2xl font-bold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Loading Assessment Questions...
                </h2>
                <p className="mt-2 text-gray-500 text-sm">Generating questions for {role} at {company}</p>
                <div className="mt-4 w-64 h-1 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="h-screen bg-dark-950 flex flex-col items-center justify-center text-white font-mono p-6 text-center">
                <Terminal size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Failed to Load Questions</h2>
                <p className="text-gray-500 mb-6">The AI could not generate questions. Please go back and try again.</p>
                <button
                    onClick={() => onFinish(0)}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                >
                    Go Back to Dashboard
                </button>
            </div>
        );
    }

    if (isFinished) {
        const percentage = (examScore / questions.length) * 100;
        const finalScore = Math.floor(percentage * (integrityScore / 100));

        return (
            <div className="h-screen bg-dark-950 flex flex-col items-center justify-center text-white font-mono p-6 text-center overflow-y-auto">
                <div className="max-w-md w-full bg-dark-900 border border-dark-700 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 my-auto">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        <Award size={40} className="text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Assessment Complete</h2>
                    <p className="text-dark-400 mb-8 font-bold">Role: {role}</p>

                    <div className="mb-8">
                        <div className="text-6xl font-bold text-white mb-2">{examScore}/{questions.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-dark-500 font-bold mb-4 flex items-center justify-center gap-2">
                            <ShieldAlert size={12} className={integrityScore < 100 ? 'text-red-500' : 'text-green-500'} />
                            Integrity: {integrityScore}%
                        </div>
                        <div className="text-xs uppercase tracking-widest text-dark-500 font-bold">Final Score</div>
                        <div className="mt-4 w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${percentage >= 70 ? 'bg-green-500 shadow-[0_0_10px_#10b981]' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => onFinish(finalScore)}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
                    >
                        Continue to Coding Challenge <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="h-screen bg-dark-950 flex flex-col items-center text-white font-mono p-6 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 py-8">
                {/* Header Info */}
                <div className="flex justify-between items-end mb-8 bg-dark-900/50 p-4 rounded-xl border border-dark-800 backdrop-blur-sm">
                    <div>
                        <div className="text-[10px] uppercase text-dark-500 font-bold mb-1 tracking-wider">Online Assessment</div>
                        <div className="text-xl font-bold text-white">{role} — {company}</div>
                        <div className="text-[10px] text-blue-400 font-bold tracking-widest mt-1 opacity-70">LEVEL: {(level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 font-bold text-2xl mb-1">
                            <Timer size={20} className={timeLeft <= 10 ? 'animate-pulse text-red-500' : 'text-blue-400'} />
                            <span className={timeLeft <= 10 ? 'text-red-500' : 'text-white'}>00:{timeLeft.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="text-[10px] uppercase text-dark-500 font-bold tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-dark-800 rounded-full mb-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Section */}
                <div className="bg-dark-900 border border-dark-700 p-8 rounded-2xl relative overflow-hidden group">
                    <Terminal className="absolute -right-4 -bottom-4 text-dark-800 w-32 h-32 rotate-12 opacity-20 group-hover:opacity-30 transition-opacity" />

                    <h3 className="text-2xl font-bold leading-tight mb-8 relative z-10">
                        <span className="text-blue-400 mr-4 font-bold">Q{currentQuestionIndex + 1}.</span>
                        {currentQuestion.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 relative z-10">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                disabled={showExplanation}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${selectedOption === idx
                                    ? 'bg-blue-500/10 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-dark-800 border-dark-700 hover:border-dark-600 text-dark-300'
                                    } ${showExplanation && idx === currentQuestion.correctAnswer
                                        ? 'border-green-500 bg-green-500/10 text-white'
                                        : showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer
                                            ? 'border-red-500 bg-red-500/10 text-white'
                                            : ''
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${selectedOption === idx ? 'bg-blue-500 border-blue-500 text-black' : 'border-dark-600'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="font-bold">{option}</span>
                                {showExplanation && idx === currentQuestion.correctAnswer && <CheckCircle2 size={18} className="ml-auto text-green-500" />}
                                {showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle size={18} className="ml-auto text-red-500" />}
                            </button>
                        ))}
                    </div>

                    {!showExplanation ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedOption === null}
                            className="mt-8 w-full py-4 bg-blue-500 disabled:opacity-30 disabled:hover:scale-100 text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:scale-[1.01]"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <div className="mt-8 animate-in slide-in-from-top-2">
                            <div className="p-4 bg-dark-950 border-l-4 border-blue-500 rounded-r-xl mb-6">
                                <p className="text-dark-300 text-sm leading-relaxed">
                                    <span className="text-blue-400 font-bold uppercase mr-2">Explanation:</span>
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                            <button
                                onClick={advanceToNext}
                                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                            >
                                {currentQuestionIndex < questions.length - 1 ? "Next Question (auto in 3s)" : "Finish Assessment"} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-between text-[10px] text-dark-600 font-bold uppercase tracking-wider">
                    <span>JobGenesis Assessment</span>
                    <span className={integrityScore < 100 ? 'text-red-500 font-bold' : ''}>
                        Integrity: {integrityScore}% {integrityScore < 100 ? '⚠️' : '✓'}
                    </span>
                    <span>Proctored Session</span>
                </div>
                <div className="absolute opacity-0 pointer-events-none -z-50"><SentinelCam onStrike={handleProctorStrike} /></div>
            </div>
        </div>
    );
};

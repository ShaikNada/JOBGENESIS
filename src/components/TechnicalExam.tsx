import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, CheckCircle2, XCircle, Timer, Award, Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface TechnicalExamProps {
    role: string;
    company: string;
    level: string;
    focus?: string;
    onFinish: (score: number) => void;
}

import { fetchTechnicalExam } from '../lib/api/ai';

export const TechnicalExam = ({ role, company, level, focus, onFinish }: TechnicalExamProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await fetchTechnicalExam({ role, company, level, focus });
                setQuestions(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch questions", err);
                toast.error("Critical System Error: Questions could not be retrieved.");
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [role, company, level, focus]);

    useEffect(() => {
        if (isLoading || isFinished || showExplanation) return;

        if (timeLeft === 0) {
            handleNext();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isLoading, isFinished, showExplanation]);

    const handleOptionSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
            toast.success("Access Granted: Response Verified");
        } else {
            toast.error("Access Denied: Response Mismatch");
        }

        setShowExplanation(true);
    };

    const [autoAdvanceTimeout, setAutoAdvanceTimeout] = useState<any>(null);

    useEffect(() => {
        if (!showExplanation || isFinished) return;

        const timeout = setTimeout(() => {
            handleNext();
        }, 5000); // 5 seconds to read explanation

        setAutoAdvanceTimeout(timeout);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [showExplanation, isFinished]);

    const handleNext = () => {
        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            setAutoAdvanceTimeout(null);
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setTimeLeft(30);
        } else {
            setIsFinished(true);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-dark-950 flex flex-col items-center justify-center text-white font-mono p-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-neon-blue/20 blur-3xl animate-pulse"></div>
                    <Loader2 size={64} className="animate-spin text-neon-blue relative z-10" />
                </div>
                <h2 className="mt-8 text-2xl font-black tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500">
                    Initializing assessment protocols...
                </h2>
                <div className="mt-4 w-64 h-1 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-blue animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
            </div>
        );
    }

    if (isFinished) {
        const percentage = (score / questions.length) * 100;
        return (
            <div className="h-screen bg-dark-950 flex flex-col items-center justify-center text-white font-mono p-6 text-center overflow-y-auto">
                <div className="max-w-md w-full bg-dark-900 border border-dark-700 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 my-auto">
                    <div className="w-20 h-20 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-blue/30">
                        <Award size={40} className="text-neon-blue" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Assessment Complete</h2>
                    <p className="text-dark-400 mb-8 font-bold">Role: {role}</p>

                    <div className="mb-8">
                        <div className="text-6xl font-black text-white mb-2">{score}/{questions.length}</div>
                        <div className="text-xs uppercase tracking-widest text-dark-500 font-bold">Qualification Score</div>
                        <div className="mt-4 w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${percentage >= 70 ? 'bg-green-500 shadow-[0_0_10px_#10b981]' : percentage >= 40 ? 'bg-yellow-500' : 'bg-neon-red shadow-[0_0_10px_#ff003c]'}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => onFinish(score)}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neon-blue hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
                    >
                        Proceed to Simulation <ArrowRight className="group-hover:translate-x-1 transition-transform" />
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
                        <div className="text-[10px] uppercase text-dark-500 font-bold mb-1 tracking-[0.2em]">Current Sector</div>
                        <div className="text-xl font-black text-white uppercase">{role} Assessment</div>
                        <div className="text-[10px] text-neon-blue font-bold tracking-widest mt-1 opacity-70">SECTOR: {company.toUpperCase()} // LEVEL: {level.toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-neon-red font-black text-2xl mb-1">
                            <Timer size={20} className={timeLeft <= 10 ? 'animate-pulse' : ''} />
                            <span className={timeLeft <= 10 ? 'text-neon-red' : 'text-white'}>00:{timeLeft.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="text-[10px] uppercase text-dark-500 font-bold tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-dark-800 rounded-full mb-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-neon-blue to-purple-500 transition-all duration-500"
                        style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Section */}
                <div className="bg-dark-900 border border-dark-700 p-8 rounded-2xl relative overflow-hidden group">
                    {/* Decorative Terminal Icon */}
                    <Terminal className="absolute -right-4 -bottom-4 text-dark-800 w-32 h-32 rotate-12 opacity-20 group-hover:opacity-30 transition-opacity" />

                    <h3 className="text-2xl font-bold leading-tight mb-8 relative z-10">
                        <span className="text-neon-blue mr-4 font-black">Q{currentQuestionIndex + 1}.</span>
                        {currentQuestion.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 relative z-10">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                disabled={showExplanation}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${selectedOption === idx
                                    ? 'bg-neon-blue/10 border-neon-blue text-white shadow-[0_0_15px_rgba(0,183,255,0.2)]'
                                    : 'bg-dark-800 border-dark-700 hover:border-dark-600 text-dark-300'
                                    } ${showExplanation && idx === currentQuestion.correctAnswer
                                        ? 'border-green-500 bg-green-500/10 text-white'
                                        : showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer
                                            ? 'border-neon-red bg-neon-red/10 text-white'
                                            : ''
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${selectedOption === idx ? 'bg-neon-blue border-neon-blue text-black' : 'border-dark-600'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="font-bold">{option}</span>
                                {showExplanation && idx === currentQuestion.correctAnswer && <CheckCircle2 size={18} className="ml-auto text-green-500" />}
                                {showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle size={18} className="ml-auto text-neon-red" />}
                            </button>
                        ))}
                    </div>

                    {!showExplanation ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedOption === null}
                            className="mt-8 w-full py-4 bg-neon-blue disabled:opacity-30 disabled:hover:scale-100 text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,183,255,0.4)] transition-all transform hover:scale-[1.01]"
                        >
                            Submit Analysis
                        </button>
                    ) : (
                        <div className="mt-8 animate-in slide-in-from-top-2">
                            <div className="p-4 bg-dark-950 border-l-4 border-neon-blue rounded-r-xl mb-6">
                                <p className="text-dark-300 text-sm leading-relaxed italic">
                                    <span className="text-neon-blue font-bold uppercase mr-2">[LOG]:</span>
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neon-blue hover:text-white transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                            >
                                {currentQuestionIndex < questions.length - 1 ? "Next Protocol (Auto in 5s)" : "Complete Assessment"} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer decorations */}
                <div className="mt-6 flex justify-between text-[10px] text-dark-600 font-bold uppercase tracking-[0.3em]">
                    <span>Secure Host: 127.0.0.1</span>
                    <span>Status: Assessment In Progress</span>
                    <span>Encrypted Link: ACTIVE</span>
                </div>
            </div>
        </div>
    );
};

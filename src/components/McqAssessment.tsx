import { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface McqAssessmentProps {
    role: string;
    company: string;
    experienceLevel: string;
    onComplete: (score: number) => void;
}

interface Question {
    id: number;
    question: string;
    options: string[];
}

export function McqAssessment({ role, company, experienceLevel, onComplete }: McqAssessmentProps) {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);

    // Quiz View State
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/assessment/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ role, company, experienceLevel })
                });

                if (!res.ok) throw new Error("Failed to generate assessment");

                const data = await res.json();
                setQuestions(data.questions);
                setAssessmentId(data.assessmentId);
                setLoading(false);

            } catch (error) {
                console.error(error);
                toast.error("Failed to load candidate assessment.");
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [role, company, experienceLevel]);

    const handleSelectOption = (questionId: number, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIdx > 0) {
            setCurrentIdx(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/assessment/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ assessmentId, answers })
            });

            if (!res.ok) throw new Error("Failed to grade assessment.");

            const data = await res.json();
            toast.success(`Assessment Complete: Scored ${data.score}%`);

            // Brief pause to show loading state before transitioning to IDE
            setTimeout(() => {
                onComplete(data.score);
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error("Error submitting assessment.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/90 relative overflow-hidden text-center z-50">
                <BrainCircuit className="w-20 h-20 text-blue-500 mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-white mb-2">Generating Technical Screen...</h2>
                <p className="text-blue-400 font-mono tracking-widest uppercase">Targeting {role} requirements at {company}</p>
            </div>
        );
    }

    if (!questions.length) {
        return <div className="p-8 text-center text-red-500 z-50 absolute">Error loading assessment. Please try again.</div>;
    }

    const currentQuestion = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const progress = Math.round(((currentIdx + 1) / questions.length) * 100);

    return (
        <div className="w-full h-full flex flex-col p-8 bg-dark-950 relative overflow-hidden z-20">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">

                {/* Header Track */}
                <div className="flex items-center justify-between mb-8 border-b border-dark-800 pb-4">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-yellow-500" />
                        <span className="font-bold text-white uppercase tracking-wider">Phase 1: MCQ Assessment</span>
                    </div>
                    <div className="font-mono text-slate-400">
                        {currentIdx + 1} / {questions.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-dark-800 mb-12 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-light text-slate-200 mb-8 leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-4 mb-12">
                        {currentQuestion.options.map((opt, idx) => {
                            const isSelected = answers[currentQuestion.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(currentQuestion.id, idx)}
                                    className={`w-full text-left p-6 rounded-xl border transition-all flex items-center gap-4 ${isSelected
                                        ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                        : 'bg-dark-900 border-dark-700 hover:border-dark-500 hover:bg-dark-800'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-400 bg-blue-500/20 text-blue-400' : 'border-slate-600'
                                        }`}>
                                        {isSelected && <div className="w-3 h-3 bg-blue-400 rounded-full"></div>}
                                    </div>
                                    <span className={`${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between items-center mt-auto pt-6 border-t border-dark-800">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIdx === 0}
                        className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        Previous
                    </button>

                    {!isLast ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(answers).length < questions.length}
                            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Submit & Begin Code Challenge
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

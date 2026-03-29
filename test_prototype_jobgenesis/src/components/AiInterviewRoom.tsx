import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, MicOff, Send, Loader2, Bot, AlertTriangle, CheckCircle, BarChart3, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { StressHeartbeat } from './StressHeartbeat';

interface InterviewRoomProps {
    code: string;
    problemTitle: string;
    problemDescription: string;
    targetRole: string;
    company: string;
    difficulty?: 'easy' | 'normal' | 'hard';
    problemId?: string;
    jobId?: string;
    onComplete: (result: any) => void;
}

export function AiInterviewRoom({ code, problemTitle, problemDescription, targetRole, company, difficulty = 'normal', problemId, jobId, onComplete }: InterviewRoomProps) {
    const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useSpeechRecognition();
    const [question, setQuestion] = useState<string | null>(null);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
    const [finalReport, setFinalReport] = useState<any>(null);
    const [turnIndex, setTurnIndex] = useState(1);

    // Stress Protocol State
    const isStressMode = difficulty === 'hard' || targetRole.includes('Staff') || targetRole.includes('Principal');
    const [stressLevel, setStressLevel] = useState(0); 
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (isStressMode) {
            const interval = setInterval(() => {
                setStressLevel(prev => Math.min(1, prev + 0.05));
            }, 5000);
            
            const glitchInterval = setInterval(() => {
                if (Math.random() < 0.2 + (stressLevel * 0.5)) {
                    setIsGlitching(true);
                    setTimeout(() => setIsGlitching(false), 150);
                }
            }, 2000);

            return () => {
                clearInterval(interval);
                clearInterval(glitchInterval);
            };
        }
    }, [isStressMode, stressLevel]);

    // Initial Fetch
    useEffect(() => {
        const startInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/interview/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ code, problemTitle, problemDescription, targetRole, company, difficulty, isStressMode, problemId, jobId })
                });

                if (!res.ok) throw new Error("Failed to start interview");

                const data = await res.json();
                setInterviewId(data.interviewId);
                setQuestion(data.question);
                setLoadingQuestion(false);

                speakQuestion(data.question);
            } catch (error) {
                console.error(error);
                toast.error("Interviewer AI connection failed.");
                setLoadingQuestion(false);
            }
        };

        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        startInterview();

        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    }, []);

    const speakQuestion = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('Male')) || voices[0];
            if (voice) utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSubmitAudio = async () => {
        if (!transcript.trim()) {
            toast.error("Please provide an audio response.");
            return;
        }

        setIsSubmitting(true);
        if (isRecording) stopRecording();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/interview/submit-turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ interviewId, transcript, question, turnIndex, isStressMode })
            });

            if (!res.ok) throw new Error("Submission failed");

            const data = await res.json();
            
            // Speak feedback FIRST
            speakQuestion(data.feedback);

            if (data.status === 'completed') {
                setTimeout(() => {
                    setStatus('completed');
                    setFinalReport(data.finalReport);
                    setIsSubmitting(false);
                }, 2000);
            } else {
                setQuestion(data.question);
                setTurnIndex(prev => prev + 1);
                resetTranscript();
                setIsSubmitting(false);
                // Speak next question after a short delay
                setTimeout(() => speakQuestion(data.question), 3000);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to process response.");
            setIsSubmitting(false);
        }
    };

    if (status === 'completed' && finalReport) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden"
            >
                <div className="z-10 w-full max-w-2xl bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 backdrop-blur-xl shadow-2xl relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center border-8 border-black shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <CheckCircle className="text-black w-12 h-12" />
                    </div>

                    <div className="text-center mt-8 space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Interview Complete</h2>
                        <p className="text-slate-400 font-mono text-sm tracking-tight">{finalReport.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-12">
                        <div className="flex flex-col items-center bg-black/40 p-4 rounded-xl border border-slate-800">
                             <BarChart3 className="text-purple-400 w-5 h-5 mb-2" />
                             <span className="text-2xl font-black text-white">{finalReport.overallScore}%</span>
                             <span className="text-[10px] text-slate-500 uppercase font-black">Overall</span>
                        </div>
                        <div className="flex flex-col items-center bg-black/40 p-4 rounded-xl border border-slate-800">
                             <MessageSquare className="text-blue-400 w-5 h-5 mb-2" />
                             <span className="text-2xl font-black text-white">{finalReport.avgCommunication}/10</span>
                             <span className="text-[10px] text-slate-500 uppercase font-black">Comm.</span>
                        </div>
                        <div className="flex flex-col items-center bg-black/40 p-4 rounded-xl border border-slate-800">
                             <Bot className="text-emerald-400 w-5 h-5 mb-2" />
                             <span className="text-2xl font-black text-white">{finalReport.avgTechnical}/10</span>
                             <span className="text-[10px] text-slate-500 uppercase font-black">Tech.</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => onComplete(finalReport)}
                        className="w-full mt-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-1000 ${isStressMode ? 'bg-[#050000]' : 'bg-black/90'}`}>
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] ${isStressMode ? 'opacity-20' : 'opacity-100'}`}></div>

            <AnimatePresence>
                {isStressMode && (
                    <>
                        <motion.div 
                            className="absolute inset-0 pointer-events-none z-0"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ background: `radial-gradient(circle, transparent 50%, rgba(255,0,0,${0.1 + (stressLevel * 0.4)}) 100%)` }}
                        />
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    </>
                )}
            </AnimatePresence>

            <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
                {isStressMode && (
                    <div className="w-full flex justify-between items-center px-4 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col">
                               <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">Neural_Stress_Index</span>
                               <div className="w-32 h-1 bg-red-900/30 rounded-full mt-1 overflow-hidden">
                                   <motion.div 
                                        className="h-full bg-red-500 shadow-[0_0_10px_#ef4444]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stressLevel * 100}%` }}
                                   />
                               </div>
                           </div>
                        </div>
                        <StressHeartbeat stressLevel={stressLevel} />
                        <div className="text-right">
                             <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] block">Interrogator_Status</span>
                             <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center justify-end gap-2">
                                 SKEPTICAL <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                             </span>
                        </div>
                    </div>
                )}

                <div className="relative">
                    <motion.div 
                        animate={isStressMode ? { 
                            y: [0, -4, 0],
                            filter: isGlitching ? ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'] : 'none'
                        } : { y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${isStressMode ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'border-purple-500/50'} ${loadingQuestion ? 'animate-pulse' : ''}`}
                    >
                        <Bot className={`w-16 h-16 ${isStressMode ? 'text-red-500' : 'text-purple-400'}`} />
                    </motion.div>
                </div>

                <div className={`w-full bg-white/5 border p-8 rounded-xl backdrop-blur-sm text-center min-h-[160px] flex items-center justify-center transition-all ${isStressMode ? 'border-red-900 shadow-[0_0_40px_rgba(220,38,38,0.1)]' : 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
                    {loadingQuestion ? (
                        <div className={`flex items-center space-x-3 ${isStressMode ? 'text-red-500' : 'text-purple-300'}`}>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xl tracking-widest uppercase font-black">{isStressMode ? 'Hunting for Logic Breaches...' : 'Analyzing Code Architecture...'}</span>
                        </div>
                    ) : (
                        <motion.p 
                            key={question}
                            className="text-2xl font-light leading-relaxed text-slate-200"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            "{question}"
                        </motion.p>
                    )}
                </div>

                {!loadingQuestion && (
                    <div className="w-full flex justify-between gap-6 h-64">
                        <div className="flex-1 bg-black border border-slate-700 p-6 rounded-xl font-mono text-sm text-green-400 relative overflow-y-auto w-full text-left">
                            <div className="absolute top-2 right-4 text-xs text-slate-500">LIVE TRANSCRIPT ({turnIndex}/3)</div>
                            {transcript ? (
                                <p className="mt-4">{transcript}</p>
                            ) : (
                                <p className="mt-4 opacity-50 italic">Hold the microphone to speak...</p>
                            )}
                        </div>

                        <div className={`w-1/3 flex flex-col items-center justify-center gap-6 bg-white/5 border rounded-xl p-6 ${isStressMode ? 'border-red-900/50' : 'border-slate-800'}`}>
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                disabled={isSubmitting}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                                    ? (isStressMode ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.8)] scale-110' : 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-110')
                                    : (isStressMode ? 'bg-red-950/20 hover:bg-red-900/30 border border-red-900' : 'bg-slate-800 hover:bg-slate-700 border border-slate-600')
                                    }`}
                            >
                                {isRecording ? <Mic className="w-10 h-10 text-white animate-pulse" /> : <MicOff className={`w-10 h-10 ${isStressMode ? 'text-red-500/50' : 'text-slate-400'}`} />}
                            </button>

                            <p className={`text-sm uppercase tracking-wider font-bold ${isStressMode ? 'text-red-500' : 'text-slate-400'}`}>{isRecording ? (isStressMode ? "RECORDING..." : "Recording...") : (isStressMode ? "HOLD TO SPEAK" : "Hold to Speak")}</p>

                            <button
                                onClick={handleSubmitAudio}
                                disabled={isSubmitting || !transcript}
                                className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 ${isStressMode 
                                    ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white' 
                                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white'}`}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {turnIndex >= 3 ? "Submit Final Answer" : "Next Question"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

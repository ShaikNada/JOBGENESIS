import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, MicOff, Send, Loader2, Bot, AlertTriangle } from 'lucide-react';
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
    onComplete: (result: any) => void;
}

export function AiInterviewRoom({ code, problemTitle, problemDescription, targetRole, company, difficulty = 'normal', onComplete }: InterviewRoomProps) {
    const { isRecording, transcript, startRecording, stopRecording } = useSpeechRecognition();
    const [question, setQuestion] = useState<string | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stress Protocol State
    const isStressMode = difficulty === 'hard' || targetRole.includes('Staff') || targetRole.includes('Principal');
    const [stressLevel, setStressLevel] = useState(0); 
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (isStressMode) {
            const interval = setInterval(() => {
                setStressLevel(prev => Math.min(1, prev + 0.05));
            }, 5000); // Increase stress every 5 seconds
            
            // Random glitching effect
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

    // Web Audio API Heartbeat Drone
    useEffect(() => {
        if (!isStressMode) return;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(40, audioCtx.currentTime); // Low bass frequency
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();

        // Modulate volume slightly based on stressLevel
        const modFreq = 1 + (stressLevel * 4);
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = modFreq;
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();

        return () => {
            oscillator.stop();
            lfo.stop();
            audioCtx.close();
        };
    }, [isStressMode, stressLevel]);

    useEffect(() => {
        // Fetch the initial question specifically targeting their code
        const startInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/interview/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ code, problemTitle, problemDescription, targetRole, company, difficulty, isStressMode })
                });

                if (!res.ok) throw new Error("Failed to generate question");

                const data = await res.json();
                setQuestion(data.question);
                setLoadingQuestion(false);

                // Read the question aloud using Browser TTS
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(data.question);
                    // Give it a techy voice if possible
                    const voices = window.speechSynthesis.getVoices();
                    const voice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('Google UK English Male')) || voices[0];
                    if (voice) utterance.voice = voice;
                    window.speechSynthesis.speak(utterance);
                }

            } catch (error) {
                console.error(error);
                toast.error("Failed to connect to the Interviewer AI.");
                setLoadingQuestion(false);
            }
        };

        // stop any previous speech
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        startInterview();

        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    }, [code, problemTitle, problemDescription, targetRole]);

    const handleSubmitAudio = async () => {
        if (!transcript.trim()) {
            toast.error("Please provide an audio response first.");
            return;
        }

        setIsSubmitting(true);
        if (isRecording) stopRecording();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/interview/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code, targetRole, question, transcript, isStressMode })
            });

            if (!res.ok) throw new Error("Evaluation failed");

            const data = await res.json();

            if ('speechSynthesis' in window) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.feedback));
            }

            // Wait a moment so they can hear the feedback before transitioning
            setTimeout(() => {
                onComplete({
                    question,
                    transcript,
                    interviewFeedback: data.feedback,
                    communicationScore: data.communicationScore,
                    technicalAccuracyScore: data.technicalAccuracyScore
                });
            }, 3000);

        } catch (error) {
            console.error(error);
            toast.error("Failed to evaluate response.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-1000 ${isStressMode ? 'bg-[#050000]' : 'bg-black/90'}`}>
            {/* Cyberpunk Grid Background */}
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] ${isStressMode ? 'opacity-20' : 'opacity-100'}`}></div>

            {/* Stress Overlays */}
            <AnimatePresence>
                {isStressMode && (
                    <>
                        {/* Red Vignette */}
                        <motion.div 
                            className="absolute inset-0 pointer-events-none z-0"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ background: `radial-gradient(circle, transparent 50%, rgba(255,0,0,${0.1 + (stressLevel * 0.4)}) 100%)` }}
                        />
                        {/* Static/Noise overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    </>
                )}
            </AnimatePresence>

            <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
                {/* Header Stats for Stress Mode */}
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

                {/* AI Avatar */}
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
                    {/* Glowing ring effect */}
                    <div className={`absolute inset-0 rounded-full border-2 blur-md animate-ping ${isStressMode ? 'border-red-500/20' : 'border-fuchsia-500/30'}`}></div>
                </div>

                {/* AI Dialogue Box */}
                <div className={`w-full bg-white/5 border p-8 rounded-xl backdrop-blur-sm text-center min-h-[160px] flex items-center justify-center transition-all ${isStressMode ? 'border-red-900 shadow-[0_0_40px_rgba(220,38,38,0.1)]' : 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
                    {loadingQuestion ? (
                        <div className={`flex items-center space-x-3 ${isStressMode ? 'text-red-500' : 'text-purple-300'}`}>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xl tracking-widest uppercase font-black">{isStressMode ? 'Hunting for Logic Breaches...' : 'Analyzing Code Architecture...'}</span>
                        </div>
                    ) : (
                        <motion.p 
                            className="text-2xl font-light leading-relaxed text-slate-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            "{question}"
                        </motion.p>
                    )}
                </div>

                {/* Audio Recording UI */}
                {!loadingQuestion && (
                    <div className="w-full flex justify-between gap-6 h-64">
                        {/* Transcript Box */}
                        <div className="flex-1 bg-black border border-slate-700 p-6 rounded-xl font-mono text-sm text-green-400 relative overflow-y-auto w-full text-left">
                            <div className="absolute top-2 right-4 text-xs text-slate-500">LIVE TRANSCRIPT</div>
                            {transcript ? (
                                <p className="mt-4">{transcript}</p>
                            ) : (
                                <p className="mt-4 opacity-50 italic">Hold the microphone to speak...</p>
                            )}
                        </div>

                        {/* Controls */}
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

                            <p className={`text-sm uppercase tracking-wider font-bold ${isStressMode ? 'text-red-500' : 'text-slate-400'}`}>{isRecording ? (isStressMode ? "RECORDING..." : "Recording...") : (isStressMode ? "HOLD SENSOR" : "Hold to Speak")}</p>

                            <button
                                onClick={handleSubmitAudio}
                                disabled={isSubmitting || !transcript}
                                className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 ${isStressMode 
                                    ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white' 
                                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white'}`}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                Submit Answer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

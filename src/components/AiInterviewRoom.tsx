import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, MicOff, Send, Loader2, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InterviewRoomProps {
    code: string;
    problemTitle: string;
    problemDescription: string;
    targetRole: string;
    company: string;
    onComplete: (result: any) => void;
}

export function AiInterviewRoom({ code, problemTitle, problemDescription, targetRole, company, onComplete }: InterviewRoomProps) {
    const { isRecording, transcript, startRecording, stopRecording } = useSpeechRecognition();
    const [question, setQuestion] = useState<string | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch the initial question specifically targeting their code
        const startInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('${import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}`}/api/interview/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ code, problemTitle, problemDescription, targetRole, company })
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
            const res = await fetch('${import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}`}/api/interview/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code, targetRole, question, transcript })
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
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/90 relative overflow-hidden">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
                {/* AI Avatar */}
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 border-purple-500/50 flex items-center justify-center ${loadingQuestion ? 'animate-pulse' : 'animate-bounce'}`}>
                        <Bot className="w-16 h-16 text-purple-400" />
                    </div>
                    {/* Glowing ring effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/30 blur-md animate-ping"></div>
                </div>

                {/* AI Dialogue Box */}
                <div className="w-full bg-white/5 border border-purple-500/30 p-8 rounded-xl backdrop-blur-sm text-center min-h-[160px] flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    {loadingQuestion ? (
                        <div className="flex items-center space-x-3 text-purple-300">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xl tracking-widest uppercase">Analyzing Code Architecture...</span>
                        </div>
                    ) : (
                        <p className="text-2xl font-light leading-relaxed text-slate-200">"{question}"</p>
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
                        <div className="w-1/3 flex flex-col items-center justify-center gap-6 bg-white/5 border border-slate-800 rounded-xl p-6">
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                disabled={isSubmitting}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                                    ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-110'
                                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'
                                    }`}
                            >
                                {isRecording ? <Mic className="w-10 h-10 text-white animate-pulse" /> : <MicOff className="w-10 h-10 text-slate-400" />}
                            </button>

                            <p className="text-sm text-slate-400 uppercase tracking-wider">{isRecording ? "Recording..." : "Hold to Speak"}</p>

                            <button
                                onClick={handleSubmitAudio}
                                disabled={isSubmitting || !transcript}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
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

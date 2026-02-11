import { useState, useRef } from 'react';
import { UploadCloud, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ResumeUploadProps {
    onAnalyzeComplete: (data: any) => void;
}

export const ResumeUpload = ({ onAnalyzeComplete }: ResumeUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = async (file: File) => {
        if (!file) return;

        // If it's a text file, we can read it and show it in the textarea
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            setResumeText(text);
            toast.success("Identity profile loaded from TXT.");
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
            // For PDF/DOCX, we'll store the file and let handleAnalyze send it
            // Or better, we can just trigger handleAnalyze immediately with the file
            setResumeText(`[FILE: ${file.name}] Detected. Click Analyze to proceed.`);
            (window as any)._pendingFile = file; // Simple way to store the file for the analyze button
            toast.success(`${file.name} queued for bio-calibration.`);
        } else {
            toast.error("Unsupported file type. Please use PDF, DOCX, or TXT.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleAnalyze = async () => {
        const pendingFile = (window as any)._pendingFile;

        if (!resumeText.trim() && !pendingFile) {
            toast.error("No profile data detected. Please upload or paste resume.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            let res;

            if (pendingFile) {
                // MULTIPART UPLOAD
                const formData = new FormData();
                formData.append('resume', pendingFile);

                res = await fetch('http://localhost:4000/api/ai/upload-resume', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            } else {
                // TEXT ANALYSIS
                res = await fetch('http://localhost:4000/api/ai/analyze-resume', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ resumeText })
                });
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Analysis engine failure");
            }

            const data = await res.json();
            setIsAnalyzing(false);
            (window as any)._pendingFile = null;
            toast.success("Analysis Complete! Review your profile.");
            onAnalyzeComplete(data);
        } catch (err: any) {
            setIsAnalyzing(false);
            console.error(err);
            toast.error(err.message || "Simulation Calibration Failed.");

            // Critical Fallback to allow progress if API fails
            onAnalyzeComplete({
                skills: ['React', 'TypeScript', 'Node.js', 'Engineering'],
                experienceLevel: 'Mid',
                summary: 'Standard technical profile generated via fallback protocols.',
                suggestedRoles: ['Frontend Developer', 'Software Engineer']
            });
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 text-white font-mono">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.pdf,.docx"
            />
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500">RESUME CALIBRATION</h2>
                    <p className="text-dark-400">Sync your bio-data to the JobGenesis simulation engine.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all bg-dark-900/50 ${isDragging ? 'border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-dark-700 hover:border-dark-500'}`}
                    >
                        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4 text-neon-blue shadow-lg">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="font-bold mb-2">Drag & Drop</h3>
                        <p className="text-xs text-dark-500 mb-6 uppercase tracking-wider">PDF, DOCX, or TXT</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs font-black border border-dark-600 transition-all hover:border-neon-blue text-dark-300 hover:text-white"
                        >
                            BROWSE FILES
                        </button>
                    </div>

                    {/* Text Area */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-dark-400 uppercase">Or Paste Text</label>
                            <span className="text-[10px] text-dark-600 bg-dark-900 px-2 py-0.5 rounded">AUTO-DETECT</span>
                        </div>
                        <textarea
                            className="flex-1 bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-sm focus:outline-none focus:border-neon-blue transition-colors resize-none placeholder:text-dark-600"
                            placeholder="Paste resume content here..."
                            rows={8}
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !resumeText}
                        className="w-full md:w-auto px-12 py-4 bg-neon-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="animate-spin" /> ANALYZING BIOMETRICS...</>
                        ) : (
                            <><FileText /> ANALYZE PROFILE <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

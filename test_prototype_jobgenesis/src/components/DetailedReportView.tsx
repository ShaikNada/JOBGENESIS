import { useEffect, useState } from 'react';
import { Trophy, Code2, BrainCircuit, Activity, Clock, Zap, Target, BookOpen } from 'lucide-react';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

interface ReportProps {
    score: number;
    mcqScore: number;
    totalTime: number;
    role: string;
    company: string;
    skillTags: string[];
    interviewData: {
        question: string;
        transcript: string;
        interviewFeedback: string;
        communicationScore: number;
        technicalAccuracyScore: number;
    };
    onRestart: () => void;
    missionId?: string;
    telemetry?: any;
}

export function DetailedReportView({ score, mcqScore, totalTime, role, company, skillTags, interviewData, onRestart, missionId, telemetry }: ReportProps) {
    const [mlData, setMlData] = useState<any>(null);

    useEffect(() => {
        const analyzeAndSave = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // 1. Fetch ML Metrics first (Domain #74)
                const pseudoResume = skillTags.join(", ");
                const mlRes = await fetch(`${API_URL}/api/skill-gap/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        resumeText: pseudoResume || "software engineer",
                        jobDescriptionText: role + " at " + company,
                        targetRole: role
                    })
                });

                let finalMlData = null;
                if (mlRes.ok) {
                    finalMlData = await mlRes.json();
                    setMlData(finalMlData);
                }

                // 2. Save the complete mission result including Employability Index
                const res = await fetch(`${API_URL}/api/jobs/save-result`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        missionId,
                        role,
                        company,
                        score,
                        telemetry,
                        timeSpent: totalTime,
                        codeSubmitted: "// User Code Submitted",
                        skillTags,
                        employabilityIndex: finalMlData?.employabilityIndex || score, // Fallback to score if ML fails
                        rank: score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C'
                    })
                });

                if (!res.ok) console.warn("Failed to persist final mission results.");

            } catch (error) {
                console.error("End-to-End Save Protocol Failed:", error);
            }
        };

        analyzeAndSave();
    }, [score, totalTime, role, company, skillTags]);

    return (
        <div className="w-full h-full bg-dark-950 overflow-y-auto p-8 relative">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-purple-900/40 to-dark-900 border border-purple-500/30 p-8 rounded-2xl flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <Trophy className="text-yellow-400 w-10 h-10" />
                            Gauntlet Completed
                        </h1>
                        <p className="text-purple-300 font-mono text-lg">Target: {role} @ {company}</p>
                    </div>
                    <button onClick={onRestart} className="relative px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">Return to Dashboard</span>
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Code Execution & Interview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-6">
                        {/* Coding Stats */}
                        <div className="bg-dark-900 border border-dark-700 p-6 rounded-xl">
                            <div className="flex items-center gap-3 text-neon-red mb-6 border-b border-dark-700 pb-4">
                                <Code2 className="w-6 h-6" />
                                <h2 className="text-xl font-bold font-mono uppercase tracking-widest text-white">Execution Metrics</h2>
                            </div>
                            <div className="space-y-4 font-mono">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 flex items-center gap-2"><Zap size={16} /> Total Score</span>
                                    <span className="text-green-400 font-bold text-lg">{score} PTS</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 flex items-center gap-2"><Activity size={16} /> MCQ Score</span>
                                    <span className="text-blue-400 font-bold text-lg">{mcqScore}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 flex items-center gap-2"><Clock size={16} /> Time Taken</span>
                                    <span className="text-blue-400 font-bold text-lg">{Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 flex items-center gap-2"><Activity size={16} /> Verified Skills</span>
                                    <span className="text-purple-400 font-bold text-lg">{skillTags.length} Matches</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Interview Grade */}
                        <div className="bg-dark-900 border border-fuchsia-500/30 p-6 rounded-xl shadow-[0_0_30px_rgba(217,70,239,0.05)]">
                            <div className="flex items-center gap-3 text-fuchsia-400 mb-6 border-b border-dark-700 pb-4">
                                <BrainCircuit className="w-6 h-6" />
                                <h2 className="text-xl font-bold font-mono uppercase tracking-widest text-white">AI Interview Grade</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-dark-950 p-4 border border-dark-800 rounded-lg text-center">
                                    <div className="text-3xl font-black text-white">{interviewData.communicationScore}<span className="text-sm text-slate-500">/10</span></div>
                                    <div className="text-xs text-slate-400 mt-1 uppercase font-mono">Communication</div>
                                </div>
                                <div className="bg-dark-950 p-4 border border-dark-800 rounded-lg text-center">
                                    <div className="text-3xl font-black text-white">{interviewData.technicalAccuracyScore}<span className="text-sm text-slate-500">/10</span></div>
                                    <div className="text-xs text-slate-400 mt-1 uppercase font-mono">Tech Accuracy</div>
                                </div>
                            </div>

                            <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-4 rounded-lg">
                                <h3 className="text-xs font-bold text-fuchsia-300 uppercase mb-2">Senior Engineer Feedback</h3>
                                <p className="text-slate-300 text-sm italic">"{interviewData.interviewFeedback}"</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Column 2 & 3: Domain #74 ML Engine Output */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="col-span-2 bg-dark-900 border border-blue-500/30 p-6 rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                        <div className="flex items-center gap-3 text-blue-400 mb-6 border-b border-dark-700 pb-4">
                            <Target className="w-6 h-6" />
                            <h2 className="text-xl font-bold font-mono uppercase tracking-widest text-white">Employability Index (Domain #74)</h2>
                        </div>

                        {!mlData ? (
                            <div className="h-64 flex items-center justify-center text-blue-400 animate-pulse">Running Math & Python NLP Models...</div>
                        ) : (
                            <div className="space-y-8">
                                {/* Top ML Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-dark-950 p-6 border border-dark-800 rounded-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                        <div className="text-sm text-blue-400 font-mono mb-2 relative z-10">ML Severity Class</div>
                                        <div className="text-2xl font-black text-white relative z-10">{mlData.classification}</div>
                                    </div>
                                    <div className="bg-dark-950 p-6 border border-dark-800 rounded-xl">
                                        <div className="text-sm text-slate-400 font-mono mb-2">NLP Similarity</div>
                                        <div className="text-3xl font-black text-emerald-400">{Math.round(mlData.semanticSimilarity * 100)}%</div>
                                    </div>
                                    <div className="bg-dark-950 p-6 border border-dark-800 rounded-xl">
                                        <div className="text-sm text-slate-400 font-mono mb-2">Total Index</div>
                                        <div className="text-3xl font-black text-purple-400 flex items-center gap-2">
                                            {mlData.employabilityIndex} <span className="text-sm text-slate-500 font-normal tracking-wide">out of 100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Breakdown */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 font-mono">Verified Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mlData.matchedSkills?.map((skill: string) => (
                                                <span key={skill} className="px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-300 rounded-full text-xs font-mono">{skill}</span>
                                            ))}
                                            {mlData.matchedSkills?.length === 0 && <span className="text-slate-500 text-sm">None detected</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 font-mono">Identified Gaps</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mlData.missingSkills?.map((skill: string) => (
                                                <span key={skill} className="px-3 py-1 bg-red-900/30 border border-red-500/50 text-red-300 rounded-full text-xs font-mono">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Pandas Recommendations */}
                                {mlData.recommendations?.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase mb-4 flex items-center gap-2"><BookOpen size={16} /> Recommended Upskilling (Pandas Matrix)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {mlData.recommendations.map((rec: any, idx: number) => (
                                                <div key={idx} className="bg-dark-950 border border-dark-800 p-4 rounded-lg flex justify-between items-center group hover:border-blue-500/50 transition-colors">
                                                    <div>
                                                        <div className="text-white font-bold mb-1">{rec.skillName || "System Design"} Masterclass</div>
                                                        <div className="text-xs text-slate-500 flex gap-2">
                                                            <span className="bg-blue-900/30 text-blue-400 px-2 rounded-sm">{rec.resources?.[0]?.type || "Course"}</span>
                                                        </div>
                                                    </div>
                                                    {rec.resources?.[0]?.url ? (
                                                        <a href={rec.resources[0].url} target="_blank" rel="noreferrer" className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View &rarr;
                                                        </a>
                                                    ) : (
                                                        <button onClick={() => alert('Course link currently unavailable.')} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View &rarr;
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

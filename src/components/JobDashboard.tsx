import { useState, useEffect } from 'react';
import { Target, ArrowRight, Building2, Zap, AlertTriangle, Loader2, Search } from 'lucide-react';

import { toast } from 'react-hot-toast';

interface JobDashboardProps {
    userName: string;
    resumeData: any;
    onStartSimulation: (config: any) => void;
    onViewProfile: () => void;
    onLogout: () => void;
}

export const JobDashboard = ({ userName, resumeData, onStartSimulation, onViewProfile, onLogout }: JobDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'auto' | 'target'>('auto');
    const [targetCompany, setTargetCompany] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [gapAnalysis, setGapAnalysis] = useState<any>(null);

    const [autoMatchedJobs, setAutoMatchedJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    // Auto-Fetch Matches on Mount
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/jobs/match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData })
                });
                const data = await res.json();
                setAutoMatchedJobs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                toast.error("Could not load job matches");
            } finally {
                setIsLoadingJobs(false);
            }
        };

        if (resumeData) fetchMatches();
    }, [resumeData]);

    const handleTargetAnalysis = async () => {
        if (!targetCompany || !targetRole) return;

        setIsAnalyzing(true);
        try {
            const res = await fetch('http://localhost:4000/api/jobs/gap-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, targetRole, targetCompany })
            });
            const data = await res.json();
            setGapAnalysis(data);
            toast.success("Gap Analysis Complete");
        } catch (err) {
            toast.error("Analysis Failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 p-6 text-white font-mono flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 uppercase">
                                Welcome Back, {userName}
                            </h1>
                            <button
                                onClick={onLogout}
                                className="text-[10px] text-dark-500 hover:text-neon-red font-black border border-dark-800 hover:border-neon-red/50 px-3 py-1 rounded transition-all"
                            >
                                LOGOUT
                            </button>
                        </div>
                        <p className="text-dark-400 mt-2">
                            Optimization Profile: <span className="text-white font-bold">{resumeData?.experienceLevel || 'Unknown'} Engineer</span>
                            <button onClick={onViewProfile} className="ml-4 text-neon-blue text-xs border-b border-neon-blue/0 hover:border-neon-blue transition-all uppercase font-black">View Archives</button>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('auto')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'auto' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue' : 'bg-dark-900 text-dark-400 border border-dark-700'}`}
                        >
                            <Zap size={18} /> Auto-Match
                        </button>
                        <button
                            onClick={() => setActiveTab('target')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'target' ? 'bg-neon-red/20 text-neon-red border border-neon-red' : 'bg-dark-900 text-dark-400 border border-dark-700'}`}
                        >
                            <Target size={18} /> Target Role
                        </button>
                    </div>
                </header>

                {activeTab === 'auto' ? (
                    isLoadingJobs ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neon-blue animate-pulse">
                            <Loader2 size={48} className="animate-spin mb-4" />
                            <p className="tracking-widest font-black uppercase">Scanning Global Job Markets...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            {autoMatchedJobs.map((job) => (
                                <div key={job.id} className="bg-dark-900 border border-dark-700 p-6 rounded-xl hover:border-neon-blue/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-dark-800 rounded-lg text-neon-blue">
                                            <Building2 size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded">
                                            {job.match}% MATCH
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                                    <p className="text-dark-400 text-sm mb-4">{job.company}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.skills.map((skill: string) => (
                                            <span key={skill} className="text-[10px] bg-dark-950 px-2 py-1 rounded border border-dark-800 text-dark-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => onStartSimulation({ role: job.title, company: job.company, level: resumeData?.experienceLevel })}
                                        className="w-full py-3 bg-neon-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Apply & Enter Simulation <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="bg-dark-900 border border-dark-700 rounded-xl p-8 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Target className="text-neon-red" /> Target Protocol
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase">Target Company</label>
                                    <input
                                        className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 focus:border-neon-red focus:outline-none transition-colors"
                                        placeholder="e.g. Google, Netflix, Tesla"
                                        value={targetCompany}
                                        onChange={(e) => setTargetCompany(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase">Target Role</label>
                                    <input
                                        className="w-full bg-dark-950 border border-dark-700 rounded-lg p-3 focus:border-neon-red focus:outline-none transition-colors"
                                        placeholder="e.g. Senior Backend Engineer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleTargetAnalysis}
                                    disabled={!targetCompany || !targetRole || isAnalyzing}
                                    className="w-full py-3 bg-neon-red hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isAnalyzing ? "Analyzing Gap..." : "Analyze Feasibility"}
                                </button>
                            </div>

                            <div className="bg-dark-950 rounded-xl p-6 border border-dark-800 relative overflow-hidden">
                                {!gapAnalysis ? (
                                    <div className="h-full flex flex-col items-center justify-center text-dark-500 opacity-50">
                                        <Search size={48} className="mb-4" />
                                        <p>Awaiting Target Parameters...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in slide-in-from-right">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${gapAnalysis.match > 80 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {gapAnalysis.match}%
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Feasibility Score</h4>
                                                <p className="text-xs text-dark-400">Based on resume analysis</p>
                                            </div>
                                        </div>

                                        {gapAnalysis.missingSkills.length > 0 && (
                                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                                                <h5 className="text-red-400 font-bold flex items-center gap-2 text-sm mb-2">
                                                    <AlertTriangle size={14} /> Skill Gaps Detected
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {gapAnalysis.missingSkills.map((skill: string) => (
                                                        <span key={skill} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h5 className="font-bold text-sm mb-2 text-dark-300">Optimization Advice</h5>
                                            <p className="text-sm text-dark-400 leading-relaxed">
                                                {gapAnalysis.advice}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onStartSimulation({ role: targetRole, company: targetCompany, level: resumeData?.experienceLevel })}
                                            className="w-full py-3 bg-white text-dark-950 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Enter Simulation (Gap Mode)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

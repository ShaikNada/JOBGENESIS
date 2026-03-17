import { useState, useEffect } from 'react';
import { Target, ArrowRight, Building2, Zap, Loader2, Search, Code, Terminal, Cpu, Globe, Server, Shield, Database, Smartphone, Lock, Activity, Layers, Cloud, AlertTriangle, Network, Users } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';
import { NeuralSkillTree } from './NeuralSkillTree';
import { motion } from 'framer-motion';
import { getSocket } from '../socket';

interface JobDashboardProps {
    userName: string;
    resumeData: any;
    onStartSimulation: (config: any) => void;
    onViewProfile: () => void;
    onUploadResume?: () => void;
    onLogout: () => void;
    isInvestor?: boolean;
}

export const JobDashboard = ({ userName, resumeData, onStartSimulation, onViewProfile, onUploadResume, onLogout, isInvestor = false }: JobDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'auto' | 'target' | 'bounties' | 'neural' | 'coop'>('overview');
    const [bounties, setBounties] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isLoadingBounties, setIsLoadingBounties] = useState(false);
    const [targetCompany, setTargetCompany] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Junior');
    const [focusModule, setFocusModule] = useState('Algorithms & DS');

    // Co-Op State
    const [joinRoomCode, setJoinRoomCode] = useState('');

    // RESULTS FROM CAREER PATH SCAN (AI Coach)
    const [targetPathResult, setTargetPathResult] = useState<any>(null);
    const [isScanningTarget, setIsScanningTarget] = useState(false);
    // RESULTS FROM SKILL GAP ENGINE (Domain #74 Math)
    const [skillGapResult, setSkillGapResult] = useState<any>(null);

    const [autoMatchedJobs, setAutoMatchedJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const { difficulty, setDifficulty } = usePreferences();

    // Investor Demo State
    const [simulating, setSimulating] = useState(false);

    const triggerSimulation = (type: string) => {
        setSimulating(true);
        getSocket().emit('simulate_investor', { type, action: 'start' });
        toast.success(`Started Simulation: ${type.toUpperCase()}`);
    };

    const triggerGlitch = () => {
        setSimulating(true);
        getSocket().emit('simulate_investor', { type: 'glitch', action: 'fire' });
        toast.error(`System Anomaly Injected!`);
    };

    const stopSimulations = () => {
        setSimulating(false);
        getSocket().emit('simulate_investor', { action: 'stop' });
        toast.success(`Simulations Terminated.`);
    };

    const ROLES = [
        { id: 'Frontend Engineer', label: 'Frontend Engineer', icon: Globe, desc: 'React, Vue, UI/UX' },
        { id: 'Backend Architect', label: 'Backend Architect', icon: Server, desc: 'Node, Go, Scalability' },
        { id: 'Full Stack Dev', label: 'Full Stack Dev', icon: Layers, desc: 'End-to-End Systems' },
        { id: 'Mobile Developer', label: 'Mobile Developer', icon: Smartphone, desc: 'iOS, Android, React Native' },
        { id: 'DevOps Engineer', label: 'DevOps Engineer', icon: Cloud, desc: 'CI/CD, Docker, K8s' },
        { id: 'Security Analyst', label: 'Security Analyst', icon: Shield, desc: 'Pen-Testing, Crypto' },
        { id: 'AI/ML Engineer', label: 'AI/ML Engineer', icon: Cpu, desc: 'PyTorch, TensorFlow, LLMs' },
        { id: 'Data Scientist', label: 'Data Scientist', icon: Database, desc: 'Python, SQL, Analytics' },
    ];

    const LEVELS = ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal'];

    const FOCUS_MODULES = [
        { id: 'Algorithms & DS', label: 'Algorithms & DS', icon: Code },
        { id: 'System Design', label: 'System Design', icon: Activity },
        { id: 'Debugging', label: 'Debugging', icon: Terminal },
        { id: 'Frontend UI', label: 'Frontend UI', icon: Globe },
    ];

    const COMPANIES = [
        { id: 'google', name: 'Google', category: 'Tech Giant', color: 'text-blue-400' },
        { id: 'microsoft', name: 'Microsoft', category: 'Tech Giant', color: 'text-cyan-400' },
        { id: 'meta', name: 'Meta', category: 'Social', color: 'text-blue-600' },
        { id: 'netflix', name: 'Netflix', category: 'Entertainment', color: 'text-red-500' },
        { id: 'amazon', name: 'Amazon', category: 'E-Commerce', color: 'text-yellow-500' },
        { id: 'tesla', name: 'Tesla', category: 'Automotive', color: 'text-red-600' },
        { id: 'openai', name: 'OpenAI', category: 'AI Research', color: 'text-emerald-400' },
        { id: 'uber', name: 'Uber', category: 'Gig Economy', color: 'text-gray-400' },
        { id: 'airbnb', name: 'Airbnb', category: 'Hospitality', color: 'text-rose-400' },
        { id: 'spotify', name: 'Spotify', category: 'Streaming', color: 'text-green-500' },
        { id: 'palantir', name: 'Palantir', category: 'Big Data', color: 'text-gray-200' },
        { id: 'arasaka', name: 'Arasaka Corp', category: 'Cyberpunk', color: 'text-neon-red' },
    ];

    // Auto-Fetch Matches on Mount
    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/jobs/match`, {
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

    // Fetch History and Bounties
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/jobs/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();

        if (activeTab === 'bounties') {
            setIsLoadingBounties(true);
            fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/problems/bounties`)
                .then(res => res.json())
                .then(data => {
                    setBounties(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error("Failed to fetch bounties", err);
                    toast.error("Could not load Active Bounties");
                })
                .finally(() => setIsLoadingBounties(false));
        }
    }, [activeTab]);

    const handleScanTarget = async () => {
        if (!targetCompany || !targetRole) return;

        setIsScanningTarget(true);
        setTargetPathResult(null);
        setSkillGapResult(null);

        try {
            const token = localStorage.getItem('token');

            // Run BOTH analyses in parallel for speed
            const [pathRes, gapRes] = await Promise.allSettled([
                // 1. AI Coach (Gemini) - qualitative
                fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/jobs/target-path`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData, targetRole, targetCompany, level: selectedLevel })
                }).then(r => r.json()),
                // 2. Domain #74 Math Engine - deterministic
                fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/skill-gap/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        resumeText: Object.values(resumeData || {}).join(' '),
                        jobDescriptionText: `${targetRole} ${targetCompany} ${selectedLevel} ${focusModule} javascript typescript react node python aws docker kubernetes system design algorithms`
                    })
                }).then(r => r.json())
            ]);

            if (pathRes.status === 'fulfilled') setTargetPathResult(pathRes.value);
            if (gapRes.status === 'fulfilled') setSkillGapResult(gapRes.value);

            toast.success('Target analysis complete');
        } catch (err) {
            toast.error('Analysis Failed');
        } finally {
            setIsScanningTarget(false);
        }
    };

    return (
        <div className="h-screen bg-dark-950 p-6 text-white font-mono flex flex-col items-center overflow-y-scroll">
            <div className="w-full max-w-5xl">
                <header className="mb-8 flex flex-col gap-6">
                    {/* TOP BAR */}
                    <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-2xl border border-white/5 tactical-border">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                    <Users size={32} className="text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-neon-red text-[8px] font-black italic rounded border border-[#020202]">LEVEL 7</div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none mb-1">
                                    OPERATIVE: {userName}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-neon-blue w-2/3 shadow-[0_0_10px_#00f0ff]" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Rank: Gold Vanguard</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Neural Stability</div>
                                <div className="flex gap-1 justify-end">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1.5 h-3 rounded-sm ${i <= 4 ? 'bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                            <ThemeToggle />
                            <button
                                onClick={onViewProfile}
                                className="p-3 bg-white/5 hover:bg-[#00f0ff]/10 border border-white/5 hover:border-[#00f0ff]/30 rounded-xl transition-all"
                                title="View Dossier"
                            >
                                <Database size={18} className="text-gray-400" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-6 py-2.5 bg-[#ff0044] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(255,0,68,0.4)] transition-all"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </div>

                    {/* TAB NAVIGATION */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'overview' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-[#0a0a0f] text-gray-500 border border-white/5 hover:border-white/10'}`}
                            >
                                <Activity size={16} /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('auto')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'auto' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-[#0a0a0f] text-gray-500 border border-white/5 hover:border-white/10'}`}
                            >
                                <Zap size={16} /> Auto-Match
                            </button>
                            <button
                                onClick={() => setActiveTab('target')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'target' ? 'bg-neon-red/10 text-neon-red border border-neon-red/30 shadow-[0_0_15px_rgba(255,0,68,0.1)]' : 'bg-[#0a0a0f] text-gray-500 border border-white/5 hover:border-white/10'}`}
                            >
                                <Target size={16} /> Target Role
                            </button>
                            <button
                                onClick={() => setActiveTab('bounties')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'bounties' ? 'bg-red-900/10 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-[#0a0a0f] text-gray-500 border border-white/5 hover:border-white/10'}`}
                            >
                                <AlertTriangle size={16} /> Bounties
                            </button>
                            <button
                                onClick={() => setActiveTab('neural')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'neural' ? 'bg-purple-900/10 text-purple-400 border border-purple-500/30' : 'bg-[#0a0a0f] text-gray-500 border border-white/5'}`}
                            >
                                <Network size={16} /> Neural Map
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-[#0a0a0f] p-1.5 rounded-xl border border-white/5">
                            {['easy', 'normal', 'hard'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level as any)}
                                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${difficulty === level ?
                                        (level === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            level === 'hard' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30')
                                        : 'text-gray-600 hover:text-gray-400'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {/* LEFT COLUMN: PERSONAL DOSSIER */}
                        <div className="col-span-12 lg:col-span-4 space-y-6 text-left">
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group phantom-card">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <Shield size={80} className="text-[#00f0ff]" />
                                </div>
                                <h3 className="text-[10px] font-black text-neon-blue uppercase tracking-[0.4em] mb-6">Operative Status</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-3xl font-black text-white italic tracking-tighter mb-1">94%</div>
                                        <div className="text-[9px] text-gray-600 uppercase tracking-widest font-black">System Match Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-[#ff0044] italic tracking-tighter mb-1">2,450 <span className="text-xs">XP</span></div>
                                        <div className="text-[9px] text-gray-600 uppercase tracking-widest font-black">Total Experience Gained</div>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Core Competencies</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['React', 'TypeScript', 'Node.js', 'System Design', 'Cyber Security'].map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-gray-400 group-hover:text-neon-blue transition-colors cursor-default">{skill}</span>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={onUploadResume}
                                            className="w-full py-2 bg-[#00f0ff]/5 hover:bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-xl text-[9px] font-black text-[#00f0ff] uppercase tracking-widest transition-all"
                                        >
                                            Update Identity Dossier (Upload Resume)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group phantom-card">
                                <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-6">Neural Progress</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Frontend', val: 85, color: '#00f0ff' },
                                        { label: 'Backend', val: 70, color: '#a855f7' },
                                        { label: 'Security', val: 45, color: '#ff0044' }
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                                <span className="text-gray-500">{item.label}</span>
                                                <span style={{ color: item.color }}>{item.val}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ACTIVITY TIMELINE */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 text-left">
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-8 flex-1 relative overflow-hidden phantom-card">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Terminal size={150} />
                                </div>
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.5em] flex items-center gap-3">
                                        <Activity size={14} /> Mission Sequence Log
                                    </h3>
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Live Updates Connected</span>
                                </div>

                                <div className="space-y-8">
                                    {isLoadingHistory ? (
                                        <div className="py-10 text-center text-gray-600 animate-pulse uppercase text-[10px] font-black tracking-widest">Decrypting Logs...</div>
                                    ) : history.length === 0 ? (
                                        <div className="py-20 text-center border border-white/5 border-dashed rounded-2xl">
                                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">No Missions Recorded in this Sector</p>
                                            <button onClick={() => setActiveTab('auto')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest border border-white/5 rounded-lg transition-all">Download Mission Pack</button>
                                        </div>
                                    ) : (
                                        history.slice(0, 5).map((mission, idx) => (
                                            <div key={mission._id} className="flex gap-6 group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${mission.rank === 'S' ? 'bg-[#ff0044] shadow-[0_0_10px_#ff0044]' : 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]'} relative z-10`}>
                                                        <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current" />
                                                    </div>
                                                    {idx !== history.slice(0, 5).length - 1 && <div className="w-[1px] h-full bg-white/10 mt-2" />}
                                                </div>
                                                <div className="flex-1 pb-8">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#00f0ff] transition-colors">{mission.role} // {mission.company}</h4>
                                                        <span className="text-[9px] font-black text-gray-600 uppercase">{new Date(mission.completedAt || mission.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{mission.feedback?.slice(0, 120)}...</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-black text-gray-500 uppercase">Rank: {mission.rank}</div>
                                                        <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-black text-gray-500 uppercase">Score: {mission.score}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-neon-blue/10 to-transparent border border-[#00f0ff]/20 rounded-3xl p-8 flex items-center justify-between group cursor-pointer hover:border-[#00f0ff]/40 transition-all laser-scan">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#00f0ff] flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] group-hover:scale-110 transition-transform">
                                        <Zap size={28} className="text-white fill-current" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.3em] mb-1">Recommended Mission</div>
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">System Design Challenge: Arasaka Security Engine</h4>
                                    </div>
                                </div>
                                <ArrowRight size={24} className="text-[#00f0ff] group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'auto' ? (
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
                                        onClick={() => onStartSimulation({ role: job.title, company: job.company, level: resumeData?.experienceLevel, difficulty })}
                                        className="w-full py-3 bg-neon-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Apply & Enter Simulation <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'bounties' ? (
                    isLoadingBounties ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500 animate-pulse">
                            <Loader2 size={48} className="animate-spin mb-4" />
                            <p className="tracking-widest font-black uppercase">Decrypting Dark Net Bounties...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="mb-8 p-6 bg-red-950/20 border border-red-500/30 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertTriangle size={120} />
                                </div>
                                <h2 className="text-2xl font-black tracking-widest uppercase text-red-500 mb-2 flex items-center gap-3 relative z-10">
                                    <Terminal size={24} /> System Anomalies
                                </h2>
                                <p className="text-red-400/80 font-mono text-sm max-w-2xl relative z-10">
                                    WARNING: These are live zero-day vulnerabilities and fatal server crashes intercepted by the Digital Immune System. Successfully resolving these bounties yields maximum experience multipliers. Proceed with caution.
                                </p>
                            </div>

                            {bounties.length === 0 ? (
                                <div className="text-center py-20 border border-dark-800 border-dashed rounded-xl">
                                    <Shield size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-dark-300">SYSTEM SECURE</h3>
                                    <p className="text-dark-500">No active bounties or system breaches detected.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {bounties.map(problem => (
                                        <div key={problem._id || problem.id} className="group relative bg-[#0a0505] border border-red-900/50 rounded-xl p-6 hover:border-red-500 transition-all overflow-hidden flex flex-col">
                                            {/* Glitch Line on hover */}
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-2 items-center">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                                                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest border border-red-500/30 px-2 rounded bg-red-500/10">FATAL EXCEPTION</span>
                                                </div>
                                                <div className="text-[9px] text-dark-500 font-mono">ID: {problem.id.slice(0, 12)}...</div>
                                            </div>

                                            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-red-400 transition-colors">{problem.title}</h3>
                                            
                                            <div className="flex-1 text-sm text-dark-300 font-mono mb-6 line-clamp-3">
                                                {problem.description}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {problem.tags.map((tag: string) => (
                                                    <span key={tag} className="text-[9px] bg-dark-950 px-2 py-1 rounded border border-dark-800 text-dark-400 uppercase tracking-wider">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => onStartSimulation({ role: 'Anomaly Fixer', company: 'JobGenesis', level: 'Senior', bountyId: problem.id })}
                                                className="w-full mt-auto py-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 hover:border-red-500 font-black tracking-widest uppercase rounded flex justify-center items-center gap-2 transition-all"
                                            >
                                                <Terminal size={14} /> Claim Bounty
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ) : activeTab === 'neural' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <NeuralSkillTree />
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* LEFT PANEL - MISSION SELECTOR */}
                            <div className="lg:col-span-8 space-y-4">

                                {/* 01 // SELECT CLASS */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-neon-red font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                            <span className="text-lg">01 //</span> Select Class
                                        </h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                                            <input
                                                type="text"
                                                placeholder="Search Protocol..."
                                                className="bg-dark-900 border border-dark-700 rounded-full pl-9 pr-4 py-1.5 text-xs focus:border-neon-red focus:outline-none w-48"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {ROLES.map((role) => (
                                            <button
                                                key={role.id}
                                                onClick={() => setTargetRole(role.id)}
                                                className={`relative group p-4 rounded-xl border text-left transition-all overflow-hidden ${targetRole === role.id
                                                    ? 'bg-neon-red/10 border-neon-red shadow-[0_0_15px_rgba(255,59,48,0.3)]'
                                                    : 'bg-dark-900 border-dark-800 hover:border-dark-600 hover:bg-dark-800'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg w-fit mb-3 transition-colors ${targetRole === role.id ? 'bg-neon-red text-white' : 'bg-dark-800 text-dark-400 group-hover:text-white'
                                                    }`}>
                                                    <role.icon size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className={`font-bold text-sm ${targetRole === role.id ? 'text-white' : 'text-dark-200'}`}>
                                                        {role.label}
                                                    </div>
                                                    <div className="text-[10px] text-dark-500 font-mono">
                                                        {role.desc}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* 02 // SELECT TARGET & FOCUS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* TARGET ENTITY */}
                                    <section className="space-y-2">
                                        <h3 className="text-dark-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                            <span className="text-lg text-neon-red">02 //</span> Target Entity
                                        </h3>
                                        <div className="relative group mb-3">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within:text-neon-red transition-colors" />
                                            <input
                                                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-xs focus:border-neon-red focus:bg-dark-950 focus:outline-none transition-all placeholder:text-dark-600 font-bold"
                                                placeholder="Or Type Custom Entity..."
                                                value={targetCompany}
                                                onChange={(e) => setTargetCompany(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                            {COMPANIES.map((comp) => (
                                                <button
                                                    key={comp.id}
                                                    onClick={() => setTargetCompany(comp.name)}
                                                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between h-20 group relative overflow-hidden ${targetCompany === comp.name
                                                        ? 'bg-white/5 border-neon-red/50 shadow-[0_0_10px_rgba(255,59,48,0.2)]'
                                                        : 'bg-dark-900 border-dark-800 hover:border-dark-600 hover:bg-dark-800'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start z-10 relative">
                                                        <span className={`text-[9px] font-mono uppercase tracking-wider opacity-60 ${targetCompany === comp.name ? 'text-white' : 'text-dark-500'}`}>
                                                            {comp.category}
                                                        </span>
                                                        {targetCompany === comp.name && <div className="w-1.5 h-1.5 bg-neon-red rounded-full shadow-[0_0_5px_#ff003c]"></div>}
                                                    </div>
                                                    <div className={`font-bold text-xs truncate z-10 relative ${targetCompany === comp.name ? 'text-white' : comp.color}`}>
                                                        {comp.name}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* FOCUS MODULE */}
                                    <section className="space-y-2">
                                        <h3 className="text-dark-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                            <span className="text-lg text-neon-red">03 //</span> Focus Module
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FOCUS_MODULES.map((mod) => (
                                                <button
                                                    key={mod.id}
                                                    onClick={() => setFocusModule(mod.id)}
                                                    className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${focusModule === mod.id
                                                        ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                                                        : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600'
                                                        }`}
                                                >
                                                    <mod.icon size={14} /> {mod.label}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* CLEARANCE LEVEL */}
                                <section className="space-y-3">
                                    <h3 className="text-dark-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                        <span className="text-lg text-neon-red">04 //</span> Clearance Level
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setSelectedLevel(level)}
                                                className={`px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${selectedLevel === level
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent border-dark-700 text-dark-500 hover:border-dark-500'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* RIGHT PANEL - MISSION BRIEFING */}
                            <div className="lg:col-span-4">
                                <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4 sticky top-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="font-mono text-xs text-dark-400 uppercase tracking-widest">Mission Briefing</div>
                                        <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded flex items-center gap-1 border border-green-500/20">
                                            <Lock size={10} /> SECURE LINK
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="text-[10px] uppercase text-dark-500 font-bold mb-1">Assigned Role</div>
                                            <div className="text-2xl font-black text-white leading-tight">
                                                {targetRole || 'Select Role...'}
                                            </div>
                                            <div className="text-xs text-neon-red font-mono mt-1">
                                                {ROLES.find(r => r.id === targetRole)?.desc || '---'}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] uppercase text-dark-500 font-bold mb-1">Target Entity</div>
                                            <div className="text-xl font-bold text-neon-blue">
                                                {targetCompany || 'Select Entity...'}
                                            </div>
                                        </div>

                                        <div className="flex justify-between border-t border-dark-800 pt-4">
                                            <div>
                                                <div className="text-[10px] uppercase text-dark-500 font-bold mb-1">Clearance</div>
                                                <div className="text-sm font-bold text-white">{selectedLevel}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase text-dark-500 font-bold mb-1">Focus</div>
                                                <div className="text-sm font-bold text-white">{focusModule}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTON */}
                                    <button
                                        onClick={handleScanTarget}
                                        disabled={!targetCompany || !targetRole || isScanningTarget}
                                        className="w-full group relative overflow-hidden rounded-xl bg-neon-red px-8 py-4 transition-all hover:shadow-[0_0_30px_rgba(255,59,48,0.4)] disabled:opacity-50 disabled:hover:shadow-none"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-white">
                                            {isScanningTarget ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} /> Scanning...
                                                </>
                                            ) : (
                                                <>
                                                    <Target size={18} /> Scan Target & Analyze
                                                </>
                                            )}
                                        </div>
                                        {/* Scanline effect */}
                                        <div className="absolute inset-0 z-0 h-full w-full translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                                    </button>

                                    {/* TARGET PATH / SKILL GAP SUGGESTION BOX */}
                                    {(targetPathResult || skillGapResult) && (
                                        <div className="mt-6 pt-6 border-t border-dark-700 space-y-4 animate-in slide-in-from-bottom-2">

                                            {/* === DOMAIN #74: Employability Index === */}
                                            {skillGapResult && (
                                                <div className="space-y-3">
                                                    {/* Master Index */}
                                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-neon-red/10 to-purple-500/10 border border-neon-red/30">
                                                        <div className={`w-14 h-14 rounded-full flex-shrink-0 flex flex-col items-center justify-center font-black border-2 ${skillGapResult.employabilityIndex >= 70 ? 'border-green-500 text-green-400' :
                                                            skillGapResult.employabilityIndex >= 45 ? 'border-yellow-500 text-yellow-400' :
                                                                'border-red-500 text-red-400'
                                                            }`}>
                                                            <span className="text-lg">{skillGapResult.employabilityIndex}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] text-dark-400 uppercase tracking-widest font-bold">Employability Index</div>
                                                            <div className="text-xs text-white font-bold mt-0.5">(0.4×Skills + 0.3×NLP + 0.3×Code)</div>
                                                        </div>
                                                    </div>

                                                    {/* Sub-metrics */}
                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        <div className="bg-dark-900 border border-dark-700 rounded-lg p-2">
                                                            <div className="text-[9px] text-dark-500 uppercase">Match</div>
                                                            <div className="text-sm font-black text-neon-blue">{skillGapResult.matchScoreRaw}%</div>
                                                        </div>
                                                        <div className="bg-dark-900 border border-dark-700 rounded-lg p-2">
                                                            <div className="text-[9px] text-dark-500 uppercase">Weighted</div>
                                                            <div className="text-sm font-black text-purple-400">{skillGapResult.weightedScore}%</div>
                                                        </div>
                                                        <div className="bg-dark-900 border border-dark-700 rounded-lg p-2">
                                                            <div className="text-[9px] text-dark-500 uppercase">NLP Sim.</div>
                                                            <div className="text-sm font-black text-yellow-400">{skillGapResult.semanticSimilarity}%</div>
                                                        </div>
                                                    </div>

                                                    {/* Matched Skills (Green) */}
                                                    {skillGapResult.matchedSkills?.length > 0 && (
                                                        <div>
                                                            <div className="text-[9px] uppercase text-green-500 font-bold mb-1">✓ Verified Skills</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {skillGapResult.matchedSkills.map((s: string) => (
                                                                    <span key={s} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Missing Skills (Red) */}
                                                    {skillGapResult.missingSkills?.length > 0 && (
                                                        <div>
                                                            <div className="text-[9px] uppercase text-red-500 font-bold mb-1">✗ Critical Gaps</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {skillGapResult.missingSkills.map((s: string) => (
                                                                    <span key={s} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Recommendations */}
                                                    {skillGapResult.recommendations?.length > 0 && (
                                                        <div>
                                                            <div className="text-[9px] uppercase text-dark-400 font-bold mb-1">📚 Top Resources</div>
                                                            <div className="space-y-1">
                                                                {skillGapResult.recommendations.slice(0, 3).map((rec: any) => (
                                                                    <a key={rec.skillName} href={rec.resources?.[0]?.url} target="_blank" rel="noopener noreferrer"
                                                                        className="flex items-center justify-between p-2 bg-dark-900 border border-dark-700 rounded-lg hover:border-neon-blue transition-all">
                                                                        <span className="text-[10px] font-bold text-white capitalize">{rec.skillName}</span>
                                                                        <span className="text-[9px] text-neon-blue">{rec.resources?.[0]?.title} →</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* === AI Coach Message (qualitative) === */}
                                            {targetPathResult?.coachMessage && (
                                                <div className="text-[10px] text-dark-400 italic border-t border-dark-700 pt-3">
                                                    💬 {targetPathResult.coachMessage}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => onStartSimulation({ role: targetRole, company: targetCompany, level: selectedLevel, focus: focusModule, missingSkills: skillGapResult?.missingSkills || targetPathResult?.missingSkills, difficulty })}
                                                className="w-full py-3 border border-white/20 hover:bg-white/5 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                            >
                                                Prove It in Simulation <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'coop' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 w-full flex justify-center mt-10">
                        <div className="bg-dark-900 border border-dark-700 p-8 rounded-2xl w-full max-w-2xl text-center shadow-2xl relative overflow-hidden">
                            {/* Neon Header */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
                            
                            <Users size={48} className="mx-auto text-emerald-400 mb-6" />
                            <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-4">
                                Pair Programming Protocol
                            </h2>
                            <p className="text-dark-400 mb-10 max-w-lg mx-auto leading-relaxed">
                                Establish a secure neural link with another operative. Collaborate in real-time on the same Gauntlet challenge using synchronized Code Editors and Cursors.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {/* CREATE ROOM */}
                                <div className="bg-dark-950 p-6 rounded-xl border border-dark-800 hover:border-emerald-500/50 transition-all group">
                                    <h3 className="text-white font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <Zap size={16} className="text-emerald-400" /> Host Session
                                    </h3>
                                    <p className="text-xs text-dark-500 mb-6 h-8">
                                        Generate a secure room code and invite a partner grid-runner.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                                            toast.success(`Room Code [${code}] Generated!`);
                                            onStartSimulation({ role: 'Full Stack Dev', company: 'Tech Corp', level: 'Mid-Level', roomId: code, difficulty });
                                        }} 
                                        className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] px-4 py-3 rounded-lg font-bold uppercase tracking-wider transition-all"
                                    >
                                        Create Room
                                    </button>
                                </div>

                                {/* JOIN ROOM */}
                                <div className="bg-dark-950 p-6 rounded-xl border border-dark-800 hover:border-teal-500/50 transition-all group">
                                    <h3 className="text-white font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <Network size={16} className="text-teal-400" /> Join Session
                                    </h3>
                                    <p className="text-xs text-dark-500 mb-4 h-8">
                                        Enter an active 6-character room code from your partner.
                                    </p>
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            placeholder="XXXXXX" 
                                            className="bg-dark-900 border border-dark-700 focus:border-teal-500 text-white px-4 py-3 rounded-lg w-full uppercase text-center font-mono tracking-[0.5em] font-bold outline-none transition-all placeholder:tracking-normal placeholder:font-normal" 
                                            value={joinRoomCode}
                                            onChange={e => setJoinRoomCode(e.target.value.toUpperCase())} 
                                            maxLength={6} 
                                        />
                                        <button 
                                            onClick={() => {
                                                if(joinRoomCode.length === 6) {
                                                    onStartSimulation({ role: 'Full Stack Dev', company: 'Tech Corp', level: 'Mid-Level', roomId: joinRoomCode, difficulty });
                                                } else {
                                                    toast.error('Invalid Room Code. Must be 6 characters.');
                                                }
                                            }} 
                                            disabled={joinRoomCode.length !== 6}
                                            className="w-full bg-dark-800 text-white border border-dark-700 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-bold uppercase tracking-wider transition-all"
                                        >
                                            Link Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* INVESTOR SIMULATION CONTROLS */}
            {isInvestor && (
                <motion.div 
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    className="fixed right-8 bottom-8 z-50 w-72 bg-[#1a1a24]/90 backdrop-blur-xl border border-[#00f0ff]/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu size={16} className="text-[#00f0ff] animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Simulation Suite</span>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => triggerSimulation('prodigy')}
                            className="w-full py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/20 text-[#00f0ff] text-[10px] font-bold uppercase rounded-xl transition-all"
                        >
                            Simulate Prodigy
                        </button>
                        <button 
                            onClick={() => triggerSimulation('cheater')}
                            className="w-full py-2 bg-[#ff1e56]/10 hover:bg-[#ff1e56]/20 border border-[#ff1e56]/20 text-[#ff1e56] text-[10px] font-bold uppercase rounded-xl transition-all"
                        >
                            Simulate Cheater
                        </button>
                        <button 
                            onClick={triggerGlitch}
                            className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-xl transition-all"
                        >
                            Trigger Self-Healer
                        </button>
                        
                        {simulating && (
                            <button 
                                onClick={stopSimulations}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase rounded-xl transition-all"
                            >
                                Stop All Sims
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

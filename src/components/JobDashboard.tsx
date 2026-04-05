import { useState, useEffect } from 'react';
import { Building2, Zap, Loader2, Search, Code, Terminal, Cpu, Globe, Server, Shield, Database, Smartphone, Activity, Layers, Cloud, AlertTriangle, Network, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';
import { NeuralSkillTree } from './NeuralSkillTree';
import { API_URL } from '../config';

interface JobDashboardProps {
    user: any;
    resumeData: any;
    onStartSimulation: (config: any) => void;
    onSkillGapReport?: (data: any) => void;
    onViewProfile: () => void;
    onUploadResume?: () => void;
    onLogout: () => void;
}

export const JobDashboard = ({ user, resumeData, onStartSimulation, onSkillGapReport, onViewProfile, onUploadResume, onLogout }: JobDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'history' | 'growth'>('overview');
    const [jobsSubTab, setJobsSubTab] = useState<'custom' | 'auto'>('custom');
    const [bounties, setBounties] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isLoadingBounties, setIsLoadingBounties] = useState(false);
    
    // Target Role Search State
    const [targetCompany, setTargetCompany] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Junior');
    const [isScanningTarget, setIsScanningTarget] = useState(false);

    // Auto Matches State
    const [autoMatchedJobs, setAutoMatchedJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);


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

    const COMPANIES = [
        { id: 'google', name: 'Google', category: 'Tech Giant', color: 'text-blue-400' },
        { id: 'microsoft', name: 'Microsoft', category: 'Tech Giant', color: 'text-cyan-400' },
        { id: 'meta', name: 'Meta', category: 'Social', color: 'text-blue-600' },
        { id: 'netflix', name: 'Netflix', category: 'Entertainment', color: 'text-red-500' },
        { id: 'amazon', name: 'Amazon', category: 'E-Commerce', color: 'text-yellow-500' },
        { id: 'tesla', name: 'Tesla', category: 'Automotive', color: 'text-red-600' },
        { id: 'openai', name: 'OpenAI', category: 'AI Research', color: 'text-emerald-400' },
        { id: 'stripe', name: 'Stripe', category: 'FinTech', color: 'text-indigo-400' },
        { id: 'airbnb', name: 'Airbnb', category: 'Hospitality', color: 'text-rose-400' },
        { id: 'spotify', name: 'Spotify', category: 'Streaming', color: 'text-green-500' },
    ];

    // Fetch Initial Data
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/jobs/history`, {
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

        if (resumeData) {
            const fetchMatches = async () => {
                setIsLoadingJobs(true);
                try {
                    const res = await fetch(`${API_URL}/api/jobs/match`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeData })
                    });
                    const data = await res.json();
                    setAutoMatchedJobs(Array.isArray(data) ? data : []);
                } catch (err) {
                    console.error("Failed to fetch jobs", err);
                } finally {
                    setIsLoadingJobs(false);
                }
            };
            fetchMatches();
        }
    }, [resumeData]);

    useEffect(() => {
        if (activeTab === 'growth' && bounties.length === 0) {
            setIsLoadingBounties(true);
            fetch(`${API_URL}/api/problems/bounties`)
                .then(res => res.json())
                .then(data => setBounties(Array.isArray(data) ? data : []))
                .catch(() => toast.error("Could not load Active Challenges"))
                .finally(() => setIsLoadingBounties(false));
        }
    }, [activeTab]);

    const handleScanTarget = async (overrideRole?: string, overrideCompany?: string, url?: string) => {
        const finalRole = overrideRole || targetRole;
        const finalCompany = overrideCompany || targetCompany;
        
        if (!finalCompany || !finalRole) return;
        setIsScanningTarget(true);

        try {
            const token = localStorage.getItem('token');

            // Replace with real live search endpoints when implemented in Phase 3
            // Currently calling the existing logic to emulate the new flow
            const [pathRes, gapRes] = await Promise.allSettled([
                fetch(`${API_URL}/api/careers/path`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        role: finalRole, 
                        company: finalCompany, 
                        experienceLevel: selectedLevel 
                    })
                }).then(r => r.json()),
                
                fetch(`${API_URL}/api/skill-gap/analyze`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                        resumeText: resumeData?.rawText || JSON.stringify(resumeData) || "User Profile Data",
                        jobDescriptionText: `Role: ${finalRole} at Company: ${finalCompany}. Requirements: ${selectedLevel} expertise in modern software engineering stacks.`,
                        targetRole: finalRole
                    })
                }).then(r => r.json())
            ]);

            if (onSkillGapReport) {
                const pathData = pathRes.status === 'fulfilled' ? pathRes.value : null;
                const gapData = gapRes.status === 'fulfilled' ? gapRes.value : null;

                onSkillGapReport({
                    gapResult: gapData,
                    pathResult: pathData,
                    role: finalRole,
                    company: finalCompany,
                    jobUrl: url,
                    isLiveMatch: (pathRes.status === 'fulfilled' && pathRes.value.isAvailable) || (gapRes.status === 'fulfilled' && gapRes.value.isVacant)
                });
            }
            toast.success(`Analysis for ${finalRole} complete`);
        } catch (err) {
            toast.error('Analysis Failed');
        } finally {
            setIsScanningTarget(false);
        }
    };

    return (
        <div className="h-screen bg-[#050505] p-6 text-white font-sans flex flex-col items-center overflow-y-scroll">
            <div className="w-full max-w-6xl">
                <header className="mb-8 flex flex-col gap-6">
                    {/* TOP BAR */}
                    <div className="flex justify-between items-center bg-[#0a0a0f] p-4 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Users size={32} className="text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white mb-1">
                                    {user?.name || 'Applicant'}
                                </h1>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                    Profile Active
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={onViewProfile}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                            >
                                <Database size={18} className="text-gray-400" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-6 py-2.5 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 text-xs font-bold uppercase tracking-wide rounded-xl transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>

                    {/* TAB NAVIGATION */}
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-2 bg-[#0a0a0f] p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'overview' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Activity size={16} /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'jobs' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Search size={16} /> Jobs
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'history' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Database size={16} /> History
                            </button>
                            <button
                                onClick={() => setActiveTab('growth')}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === 'growth' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <Network size={16} /> Challenges & Growth
                            </button>
                        </div>
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Profile Strength</h3>
                                <div className="text-5xl font-black mb-2">{user?.matchRate || "Ready"}</div>
                                <p className="text-sm text-gray-400">Baseline resume analyzed.</p>
                                <button 
                                    onClick={onUploadResume}
                                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    Update Resume
                                </button>
                            </div>

                            <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 shadow-sm col-span-1 lg:col-span-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Code size={16} /> Extracted Top Skills
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {(resumeData?.skills || ['Pending parsing']).slice(0, 15).map((skill: string) => (
                                        <span key={skill} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JOBS TAB (SPLIT VIEW) */}
                    {activeTab === 'jobs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* LEFT CONTROL PANE (60%) */}
                            <div className="lg:col-span-7 space-y-8">
                                {/* SUB-NAV PILLS */}
                                <div className="flex gap-4 mb-4">
                                    <button 
                                        onClick={() => setJobsSubTab('custom')}
                                        className={`px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all ${jobsSubTab === 'custom' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        Custom Path
                                    </button>
                                    <button 
                                        onClick={() => setJobsSubTab('auto')}
                                        className={`px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all ${jobsSubTab === 'auto' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        Auto-Match
                                    </button>
                                </div>

                                {jobsSubTab === 'custom' ? (
                                    <div className="animate-in slide-in-from-left duration-300 space-y-8">
                                        <div className="bg-[#0a0a0f] p-8 rounded-3xl border border-white/5 shadow-sm">
                                            <h3 className="text-gray-500 text-[10px] font-black tracking-[0.1em] uppercase mb-6 flex justify-between items-center pb-3 border-b border-white/5">
                                                <span>A. Selective Intelligence</span>
                                                <Zap size={14} className="text-red-500" />
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {ROLES.map((role) => (
                                                    <button
                                                        key={role.id}
                                                        onClick={() => setTargetRole(role.id)}
                                                        className={`p-4 rounded-2xl border text-left transition-all ${targetRole === role.id ? 'bg-red-500/10 border-red-500/50 scale-[1.02] shadow-[0_0_25px_rgba(239,68,68,0.1)]' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                                                    >
                                                        <role.icon size={18} className={`mb-3 ${targetRole === role.id ? 'text-red-500' : 'text-gray-500'}`} />
                                                        <div className={`font-black text-xs tracking-tight ${targetRole === role.id ? 'text-white' : 'text-gray-400'}`}>{role.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-[#0a0a0f] p-8 rounded-3xl border border-white/5 shadow-sm grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-gray-500 text-[10px] font-black tracking-[0.1em] uppercase mb-6">B. Organization Target</h3>
                                                <div className="relative mb-4">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-all placeholder:text-gray-700"
                                                        placeholder="Company Name..."
                                                        value={targetCompany}
                                                        onChange={(e) => setTargetCompany(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {COMPANIES.slice(0, 6).map((comp) => (
                                                        <button key={comp.id} onClick={() => setTargetCompany(comp.name)}
                                                            className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${targetCompany === comp.name ? 'bg-red-500/20 border-red-500/50 text-white' : 'border-white/5 text-gray-500 hover:text-white'}`}>
                                                            {comp.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-gray-500 text-[10px] font-black tracking-[0.1em] uppercase mb-6">C. Ranking Tier</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {LEVELS.map((level) => (
                                                        <button key={level} onClick={() => setSelectedLevel(level)}
                                                            className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${selectedLevel === level ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-white/5 text-gray-400 hover:bg-white/5'}`}>
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        {isLoadingJobs ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-600 bg-[#0a0a0f] rounded-3xl border border-white/5">
                                                <Loader2 size={32} className="animate-spin mb-4 text-red-500" />
                                                <p className="font-black uppercase tracking-[0.2em] text-[9px]">Live Web Scan Active...</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {autoMatchedJobs.length === 0 ? (
                                                    <div className="col-span-full py-10 bg-[#0a0a0f] rounded-3xl border border-white/5 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                                        No active vacancies identified. Try broad search.
                                                    </div>
                                                ) : (
                                                    autoMatchedJobs.map((job) => (
                                                        <div key={job.id} className="bg-[#0a0a0f] border border-white/5 p-6 rounded-3xl hover:border-red-500/40 transition-all flex flex-col shadow-sm group">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="p-2.5 bg-red-500/5 rounded-xl text-red-500 group-hover:bg-red-500/10 transition-colors border border-red-500/10"><Building2 size={20} /></div>
                                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black tracking-widest uppercase rounded-full">
                                                                    {job.match}% INTEL
                                                                </span>
                                                            </div>
                                                            <h3 className="text-md font-black mb-1 group-hover:text-red-400 transition-colors leading-tight">{job.title}</h3>
                                                            <p className="text-gray-500 text-[10px] mb-4 font-bold uppercase tracking-wider">{job.company}</p>
                                                            <button
                                                                onClick={() => handleScanTarget(job.title, job.company, job.url)}
                                                                className="mt-auto w-full py-3 bg-red-500/5 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 text-red-500 font-black uppercase tracking-[0.2em] text-[8px] rounded-xl transition-all shadow-sm active:scale-95"
                                                            >
                                                                Extract Neural Gap
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT INTELLIGENCE PANE (40% - STICKY) */}
                            <div className="lg:col-span-5 relative h-full">
                                <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 sticky top-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#0c0c14] to-[#0a0a0f]">
                                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500/60 mb-8 pb-4 border-b border-white/5 flex justify-between items-center">
                                        <span>Target Deployment</span>
                                        <Terminal size={14} />
                                    </h3>
                                    
                                    <div className="space-y-8 mb-10">
                                        <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                            <div className="text-[9px] uppercase text-gray-500 font-black mb-1 tracking-widest">Active Role Code</div>
                                            <div className="text-2xl font-black text-white tracking-tight">{targetRole || '---'}</div>
                                        </div>
                                        
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <div className="text-[9px] uppercase text-gray-500 font-black mb-1 tracking-widest">Target Entity</div>
                                            <div className="text-xl font-bold text-red-500/80 tracking-tight">{targetCompany || '---'}</div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="text-[9px] uppercase text-gray-500 font-black mb-1 tracking-widest">Tier</div>
                                                <div className="text-xs font-black text-gray-300">{selectedLevel}</div>
                                            </div>
                                            <div className="flex-1 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                                <div className="text-[9px] uppercase text-gray-500 font-black mb-1 tracking-widest">Stability</div>
                                                <div className="text-xs font-black text-red-400">98.2% AI</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleScanTarget()}
                                        disabled={!targetCompany || !targetRole || isScanningTarget}
                                        className="relative w-full py-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all flex justify-center items-center gap-3 overflow-hidden group shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_50px_rgba(220,38,38,0.4)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent trans-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        {isScanningTarget ? <><Loader2 className="animate-spin" size={18} /> Mapping Neural Link...</> : <><Search size={18} /> Execute Skill Scan</>}
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-gray-700">
                                        <Shield size={12} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Encrypted VANGUARD Protocol</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Interview History</h3>
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-sm py-10">No interviews completed yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {history.map((h, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 gap-4">
                                            <div>
                                                <div className="font-bold text-lg mb-1">{h.role}</div>
                                                <div className="text-gray-400 text-sm font-semibold">{h.company}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Score</div>
                                                    <div className="text-lg font-black text-blue-400">{h.score}%</div>
                                                </div>
                                                <div className="text-center px-4 border-l border-white/10">
                                                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Date</div>
                                                    <div className="text-sm font-semibold">{new Date(h.createdAt || Date.now()).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* GROWTH & GAMIFICATION TAB */}
                    {activeTab === 'growth' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 shadow-sm">
                                <NeuralSkillTree />
                            </div>
                            <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Practice Challenges
                                </h3>
                                {bounties.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No active challenges currently. Check back later.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bounties.map(b => (
                                            <div key={b.id} className="p-5 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-md text-white">{b.title}</h4>
                                                    <span className="text-[10px] px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded uppercase font-bold tracking-widest">+{b.reward || 50} XP</span>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{b.description}</p>
                                                <button 
                                                    onClick={() => onStartSimulation({ role: 'Software Engineer', company: 'JobGenesis', level: 'Senior', bountyId: b.id })}
                                                    className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                                                >
                                                    Start Challenge
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

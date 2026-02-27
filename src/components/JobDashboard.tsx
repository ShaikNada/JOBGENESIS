import { useState, useEffect } from 'react';
import { Target, ArrowRight, Building2, Zap, Loader2, Search, Code, Terminal, Cpu, Globe, Server, Shield, Database, Smartphone, Lock, Activity, Layers, Cloud } from 'lucide-react';

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
    const [selectedLevel, setSelectedLevel] = useState('Junior');
    const [focusModule, setFocusModule] = useState('Algorithms & DS');

    // RESULTS FROM CAREER PATH SCAN (AI Coach)
    const [targetPathResult, setTargetPathResult] = useState<any>(null);
    const [isScanningTarget, setIsScanningTarget] = useState(false);
    // RESULTS FROM SKILL GAP ENGINE (Domain #74 Math)
    const [skillGapResult, setSkillGapResult] = useState<any>(null);

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
                fetch('http://localhost:4000/api/jobs/target-path', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData, targetRole, targetCompany, level: selectedLevel })
                }).then(r => r.json()),
                // 2. Domain #74 Math Engine - deterministic
                fetch('http://localhost:4000/api/skill-gap/analyze', {
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
                                                onClick={() => onStartSimulation({ role: targetRole, company: targetCompany, level: selectedLevel, focus: focusModule, missingSkills: skillGapResult?.missingSkills || targetPathResult?.missingSkills })}
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
            </div>
        </div>
    );
};

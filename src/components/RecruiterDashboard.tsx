import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Target, Cpu, Users, FileText,
    BarChart3, TerminalSquare, Settings, Search,
    Bell, Zap, Activity, Eye, Play, ChevronRight
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    XAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { getSocket } from '../socket';

// Mock Data
const radarData = [
    { subject: 'Algorithms', A: 90, fullMark: 100 },
    { subject: 'System Design', A: 75, fullMark: 100 },
    { subject: 'React/UI', A: 85, fullMark: 100 },
    { subject: 'Cloud/DevOps', A: 60, fullMark: 100 },
    { subject: 'Databases', A: 80, fullMark: 100 },
    { subject: 'Security', A: 70, fullMark: 100 },
];

const lineData = [
    { time: '08:00', score: 65 },
    { time: '10:00', score: 78 },
    { time: '12:00', score: 85 },
    { time: '14:00', score: 81 },
    { time: '16:00', score: 92 },
    { time: '18:00', score: 88 },
];



// We now use live activeCandidates via WebSockets instead of mockCandidates

const logsList = [
    "> [SYSTEM] Initializing Vanguard Protocol...",
    "> [AI] Tracking behavioral heuristics for candidate C-9921.",
    "> [ENGINE] Plagiarism check passed (Similarity: 4.2%).",
    "> [AI] Synthesizing audio context...",
    "> [SYSTEM] Telemetry nominal. Server workload at 8%.",
    "> [AI] Skill gap detected in C-9923 (System Design).",
    "> [ENGINE] Updating master indices.",
];


export function RecruiterDashboard({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [logs, setLogs] = useState<string[]>([logsList[0]]);
    const [logIndex, setLogIndex] = useState(1);

    // Typing effect for Vanguard Engine
    const [typedText, setTypedText] = useState("");
    const vanguardString = "Vanguard Engine Running...";

    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < vanguardString.length) {
                setTypedText(vanguardString.slice(0, i + 1));
                i++;
            } else {
                i = 0; // loop
            }
        }, 150);
        return () => clearInterval(typingInterval);
    }, []);

    // LIVE WEBSOCKET TELEMETRY
    const [activeCandidates, setActiveCandidates] = useState<any[]>([]);

    useEffect(() => {
        const socket = getSocket();
        socket.emit("join_recruiter_room");

        const handleTelemetry = (data: any) => {
            setActiveCandidates(prev => {
                const exists = prev.find(c => c.id === data.id);
                if (exists) {
                    return prev.map(c => c.id === data.id ? { ...c, ...data } : c);
                } else {
                    return [...prev, {
                        ...data,
                        avatar: `https://i.pravatar.cc/150?u=${data.id}`
                    }];
                }
            });
        };

        const handleLog = (data: { log: string }) => {
            setLogs(prev => {
                const newLogs = [...prev, data.log];
                if (newLogs.length > 50) newLogs.shift();
                return newLogs;
            });
        };

        socket.on("candidate_telemetry", handleTelemetry);
        socket.on("candidate_log", handleLog);

        return () => {
            socket.off("candidate_telemetry", handleTelemetry);
            socket.off("candidate_log", handleLog);
        };
    }, []);

    // Live Log generation
    useEffect(() => {
        const logInt = setInterval(() => {
            setLogs(prev => {
                const newLogs = [...prev, logsList[logIndex % logsList.length]];
                if (newLogs.length > 10) newLogs.shift();
                return newLogs;
            });
            setLogIndex(prev => prev + 1);
        }, 3000);
        return () => clearInterval(logInt);
    }, [logIndex]);


    const sidebarItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'skillgap', icon: Target, label: 'Skill Gap Analysis' },
        { id: 'ai-match', icon: Cpu, label: 'AI Match Engine' },
        { id: 'candidates', icon: Users, label: 'Candidates' },
        { id: 'resume', icon: FileText, label: 'Resume Intelligence' },
        { id: 'reports', icon: BarChart3, label: 'Coding Reports' },
        { id: 'logs', icon: TerminalSquare, label: 'System Logs' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    const StatCard = ({ title, value, gradient, delay }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-[1px] rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden group`}
        >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="h-full w-full bg-[#0a0a0f]/90 backdrop-blur-xl rounded-2xl p-6 relative z-10 flex flex-col justify-between">
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-2">{title}</div>
                <div className="text-4xl font-black text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                    {value}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-[#ff1e56]/30">
            {/* Parallax / Mesh Background (Subtle) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00f0ff] blur-[150px] mix-blend-screen animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#ff1e56] blur-[200px] mix-blend-screen"></div>
            </div>

            {/* LEFTSIDEBAR */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-20 md:w-64 border-r border-white/5 bg-[#0a0a0f]/60 backdrop-blur-2xl z-20 flex flex-col justify-between"
            >
                <div>
                    <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ff1e56] to-[#00f0ff] flex items-center justify-center shadow-[0_0_20px_rgba(255,30,86,0.5)]">
                            <Zap size={18} className="text-white" />
                        </div>
                        <span className="ml-3 font-black text-xl tracking-tighter hidden md:block uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            JobGenesis
                        </span>
                    </div>

                    <div className="py-6 px-2 md:px-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative ${active ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                                >
                                    {active && (
                                        <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-[#00f0ff] rounded-r-full shadow-[0_0_10px_#00f0ff]" />
                                    )}
                                    <item.icon size={20} className={`min-w-5 ml-1 ${active ? 'text-[#00f0ff]' : 'group-hover:text-white transition-colors'}`} />
                                    <span className="ml-3 font-semibold text-sm hidden md:block tracking-wide">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button onClick={onLogout} className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-[#ff1e56] transition-colors group">
                        <span className="min-w-5 ml-1 flex-center">
                            <div className="w-2 h-2 rounded-full bg-[#ff1e56] group-hover:shadow-[0_0_10px_#ff1e56] transition-shadow"></div>
                        </span>
                        <span className="ml-3 font-bold text-xs uppercase tracking-widest hidden md:block">Terminate</span>
                    </button>
                </div>
            </motion.div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                {/* TOP NAVBAR */}
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="h-20 border-b border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl flex items-center justify-between px-8"
                >
                    <div className="flex-1 flex items-center">
                        <div className="relative group w-full max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/50 to-transparent rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center bg-[#151520] border border-white/10 rounded-full px-4 py-2">
                                <Search size={16} className="text-gray-500 group-focus-within:text-[#00f0ff] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Execute neural search query..."
                                    className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder-gray-600 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-green-400">System Live</span>
                        </div>

                        <button
                            onClick={() => alert('Notifications coming soon!')}
                            className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff1e56] animate-ping"></span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff1e56]"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors">Recruiter Admin</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Level 5 Clearance</div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/20 p-0.5 group-hover:border-[#00f0ff]/50 transition-colors">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* SCROLLABLE DASHBOARD CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* TITLE ROW */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
                                    Vanguard <span className="text-[#ff1e56]">Analytics</span>
                                </h1>
                                <div className="flex items-center gap-2 font-mono text-xs text-[#00f0ff]">
                                    <Activity size={14} className="animate-pulse" />
                                    {typedText}
                                </div>
                            </div>
                            <button
                                onClick={() => alert('Auto-Sourcing model initializing...')}
                                className="relative group overflow-hidden px-6 py-2.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-xs uppercase tracking-widest hover:bg-[#00f0ff] hover:text-black transition-all duration-300">
                                <span className="relative z-10 flex items-center gap-2">
                                    <Play size={14} /> Init Auto-Sourcing
                                </span>
                            </button>
                        </div>

                        {/* STATS ROW */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Sourced" value="1,204" gradient="from-purple-500/30 to-blue-500/30" delay={0.1} />
                            <StatCard title="Avg Match %" value="84.2%" gradient="from-[#00f0ff]/30 to-blue-500/30" delay={0.2} />
                            <StatCard title="Active Gauntlets" value="56" gradient="from-green-500/30 to-emerald-500/30" delay={0.3} />
                            <StatCard title="AI Predictions" value="1.2M" gradient="from-[#ff1e56]/30 to-orange-500/30" delay={0.4} />
                        </div>

                        {/* CHARTS GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* RADAR CHART - Skill Gap */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="lg:col-span-4 bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 blur-3xl rounded-full"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Global Talent Matrix</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height={250} minWidth={0}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
                                            <Radar name="Market Average" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.2} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* LINE CHART - AI Match Score Trend */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="lg:col-span-5 bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative"
                            >
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#00f0ff]/5 to-transparent pointer-events-none"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Real-time Acquisition Trend</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height={250} minWidth={0}>
                                        <AreaChart data={lineData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="time" stroke="#444" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }} itemStyle={{ color: '#00f0ff' }} />
                                            <Area type="monotone" dataKey="score" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* RIGHT PANEL - LIVE TERMINAL */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="lg:col-span-3 bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 rounded-2xl p-0 flex flex-col overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                            >
                                {/* Terminal Header */}
                                <div className="px-4 py-3 border-b border-white/5 bg-black/40 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Live Forensics</span>
                                </div>
                                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                    <AnimatePresence>
                                        {logs.map((log, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`break-words ${log.includes('[SYSTEM]') ? 'text-gray-400' : log.includes('[ENGINE]') ? 'text-[#ff1e56]' : 'text-[#00f0ff]'}`}
                                            >
                                                {log}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* BOTTOM TABLE - Candidate Predictions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-[#0a0a0f]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Elite Candidates Queue</h3>
                                <button
                                    onClick={() => alert('Loading complete candidate roster...')}
                                    className="text-[10px] text-[#00f0ff] uppercase tracking-widest hover:underline flex items-center">
                                    View All Records <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5 bg-black/40">
                                            <th className="py-4 px-6 font-medium">Identity</th>
                                            <th className="py-4 px-6 font-medium">Assigned Role</th>
                                            <th className="py-4 px-6 font-medium text-center">Tech Score</th>
                                            <th className="py-4 px-6 font-medium text-center">Risk Level</th>
                                            <th className="py-4 px-6 font-medium text-center">Job Fit Prediction</th>
                                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {activeCandidates.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-xs">
                                                    Awaiting live connections...
                                                </td>
                                            </tr>
                                        )}
                                        {activeCandidates.map((cand, idx) => (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 * idx }}
                                                key={cand.id}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={cand.avatar} alt={cand.name} className="w-10 h-10 rounded-full border border-white/10" />
                                                        <div>
                                                            <div className="font-bold text-sm text-white">{cand.name}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono tracking-wider">{cand.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-400">{cand.role}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                                        {cand.score}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cand.risk === 'Low' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                        'bg-[#ff1e56]/10 text-[#ff1e56] border border-[#ff1e56]/20'
                                                        }`}>
                                                        {cand.risk}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden max-w-[120px] mx-auto border border-white/5">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-[#00f0ff] relative"
                                                            style={{ width: `${cand.fit}%` }}
                                                        >
                                                            <div className="absolute top-0 right-0 w-2 h-full bg-white opacity-50 blur-[2px]"></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1 font-mono">{cand.fit}% Synthesized</div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => alert('Opening candidate full dossier...')}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-[#00f0ff] hover:text-black text-gray-400 transition-all duration-300">
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>

            {/* Custom Scrollbar CSS Injection for this component */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 240, 255, 0.5);
                }
            `}</style>
        </div>
    );
}

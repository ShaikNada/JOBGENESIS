import { useState, useEffect } from 'react';
import { User, Award, Zap, Clock, ChevronRight, BarChart3, Shield, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface MissionRecord {
    _id: string;
    role: string;
    company: string;
    score: number;
    rank: string;
    completedAt: string;
}

interface ProfilePageProps {
    user: string;
    resumeData: any;
    onBack: () => void;
    onLogout: () => void;
}

export const ProfilePage = ({ user, resumeData, onBack, onLogout }: ProfilePageProps) => {
    const [history, setHistory] = useState<MissionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:4000/api/jobs/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load history");
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
                toast.error("Could not sync mission archives.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'S': return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
            case 'A': return 'text-neon-red border-neon-red/50 bg-neon-red/10';
            case 'B': return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
            case 'C': return 'text-green-400 border-green-400/50 bg-green-400/10';
            default: return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 text-white font-mono p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <button
                        onClick={onBack}
                        className="text-xs text-dark-500 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={14} />
                        RETURN TO HUB
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <h2 className="text-sm font-black text-white">{user.toUpperCase()}</h2>
                                <p className="text-[10px] text-neon-blue uppercase tracking-tighter">Identity Verified</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-neon-blue">
                                <User size={20} />
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-[10px] text-dark-500 hover:text-neon-red border border-dark-800 hover:border-neon-red/50 px-3 py-1.5 rounded transition-all font-black"
                        >
                            TERMINATE SESSION
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar / Bio */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-neon-blue/10"></div>

                            <h3 className="text-xs font-black text-dark-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield size={14} className="text-neon-blue" /> Career Core
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-dark-600 uppercase mb-1">Current Level</p>
                                    <p className="text-lg font-bold text-white">{resumeData?.experienceLevel || 'Uncalibrated'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-dark-600 uppercase mb-1">Specialization</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {resumeData?.skills?.slice(0, 5).map((skill: string) => (
                                            <span key={skill} className="text-[9px] bg-dark-950 border border-dark-800 px-2 py-0.5 rounded text-dark-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-dark-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BarChart3 size={14} className="text-purple-500" /> Stats Terminal
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-dark-950 rounded-xl border border-dark-800">
                                    <p className="text-[9px] text-dark-600 uppercase">Simulations</p>
                                    <p className="text-xl font-bold">{history.length}</p>
                                </div>
                                <div className="p-3 bg-dark-950 rounded-xl border border-dark-800">
                                    <p className="text-[9px] text-dark-600 uppercase">Avg Score</p>
                                    <p className="text-xl font-bold">
                                        {history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content / History */}
                    <div className="md:col-span-8">
                        <div className="bg-dark-900/50 border border-dark-800 rounded-2xl p-8 min-h-[500px]">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                                <Award className="text-neon-red" /> MISSION ARCHIVE
                            </h3>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64 text-dark-500">
                                    <Cpu className="animate-spin mr-2" /> ACCESSING ENCRYPTED RECORDS...
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-dark-600 border-2 border-dashed border-dark-800 rounded-xl">
                                    <Globe className="mb-4 opacity-50" size={48} />
                                    <p className="text-sm">No mission records found in the simulation logs.</p>
                                    <button onClick={onBack} className="mt-4 text-xs text-neon-blue hover:underline">Start First Mission</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((mission, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={mission._id}
                                            className="group bg-dark-950 border border-dark-800 p-5 rounded-xl hover:border-dark-600 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-lg border flex items-center justify-center font-black text-xl ${getRankColor(mission.rank)}`}>
                                                    {mission.rank}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-neon-blue transition-colors">{mission.role}</h4>
                                                    <p className="text-xs text-dark-500 flex items-center gap-2">
                                                        {mission.company} <span className="opacity-30">•</span> {new Date(mission.completedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden sm:block">
                                                    <div className="flex items-center gap-1 text-neon-blue text-xs font-bold justify-end">
                                                        <Zap size={12} /> {mission.score}
                                                    </div>
                                                    <p className="text-[10px] text-dark-600 uppercase">Performance</p>
                                                </div>
                                                <div className="text-dark-700">
                                                    <Clock size={16} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

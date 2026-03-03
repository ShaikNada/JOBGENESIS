import { useState, useEffect } from 'react';
import { Target, Users, Zap, Copy, FileText, ChevronRight, Activity, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function RecruiterDashboard({ onLogout }: { onLogout: () => void }) {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCampaignData, setSelectedCampaignData] = useState<any | null>(null);

    // Form State
    const [companyName, setCompanyName] = useState('Google');
    const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
    const [level, setLevel] = useState('Senior');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('${import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}`}/api/recruiter/campaigns', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchLeaderboard = async (campId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}`}/api/recruiter/campaigns/${campId}/leaderboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedCampaignData(data);
            }
        } catch (e) {
            toast.error("Failed to load leaderboard.");
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('${import.meta.env.VITE_BACKEND_URL || `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}`}/api/recruiter/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyName, targetRole, experienceLevel: level })
            });

            if (res.ok) {
                toast.success('Campaign Initiated!');
                setIsCreating(false);
                fetchCampaigns();
            } else {
                toast.error('Failed to create campaign');
            }
        } catch (e) {
            toast.error('Network error');
        }
    };

    const copyLink = (linkHash: string) => {
        const fullUrl = `${window.location.origin}${linkHash}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success('Interview Link Copied to Clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden font-mono">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-red/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-12 border-b border-dark-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Target className="text-blue-500" size={32} />
                            Vanguard <span className="text-blue-500 font-light">Command Center</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">B2B Recruitment & Assesment Dashboard</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-widest text-sm rounded transition-colors flex items-center gap-2">
                            <Zap size={16} /> New Assessment Campaign
                        </button>
                        <button onClick={onLogout} className="px-4 py-3 bg-dark-900 border border-dark-700 hover:border-red-500/50 hover:text-red-400 font-bold uppercase text-sm rounded transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Active Campaigns */}
                    <div className="col-span-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-blue-500" size={20} />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-200">Active Campaigns</h2>
                        </div>

                        <div className="space-y-4">
                            {campaigns.length === 0 ? (
                                <div className="p-12 border border-dark-800 bg-dark-950/50 rounded-lg text-center text-gray-500 flex flex-col items-center">
                                    <FileText size={48} className="mb-4 opacity-20" />
                                    <p>No active assessment campaigns detected.</p>
                                    <p className="text-xs mt-2">Create a campaign to generate shareable candidate links.</p>
                                </div>
                            ) : (
                                campaigns.map(camp => (
                                    <div key={camp._id} className="p-6 border border-dark-800 bg-dark-950 hover:border-blue-500/50 transition-colors rounded-lg group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{camp.targetRole}</h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    <span>{camp.companyName}</span> • <span className="text-yellow-500/80">{camp.experienceLevel}</span>
                                                </p>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded text-blue-400 flex items-center gap-2">
                                                <Users size={14} /> <span className="font-bold">{camp.candidateCount}</span> Candidates
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-dark-800/50 pt-4 mt-4">
                                            <div className="flex items-center gap-3 bg-black flex-1 max-w-md p-2 rounded border border-dark-700">
                                                <code className="text-green-400 text-xs truncate flex-1">{window.location.origin}{camp.shareableLink}</code>
                                                <button onClick={() => copyLink(camp.shareableLink)} className="p-2 bg-dark-800 hover:bg-dark-700 rounded text-white transition-colors">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => fetchLeaderboard(camp._id)}
                                                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                            >
                                                View Leaderboard <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="col-span-4 space-y-6">
                        {/* ... existing sidebar content ... */}
                    </div>
                </div>

                {/* Leaderboard Detail View */}
                {selectedCampaignData && (
                    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-8">
                        <div className="w-full max-w-5xl h-full flex flex-col bg-dark-950 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedCampaignData.campaign.targetRole}</h2>
                                    <p className="text-sm text-gray-500">{selectedCampaignData.campaign.companyName} // Recruitment Pipeline</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCampaignData(null)}
                                    className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 hover:text-white"
                                >
                                    ✕ Close Protocol
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-widest text-dark-500 border-b border-dark-800">
                                            <th className="py-4 px-4">Candidate Identity</th>
                                            <th className="py-4 px-4 text-center">Score</th>
                                            <th className="py-4 px-4 text-center">Employability Index</th>
                                            <th className="py-4 px-4 text-right">Last Sync</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-800/50">
                                        {selectedCampaignData.candidates.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center text-gray-600 font-mono italic">
                                                    No transmission data received from this campaign hash yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedCampaignData.candidates.map((cand: any) => (
                                                <tr key={cand._id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-white mb-1">{cand.userId?.name || 'Anonymous Protocol'}</div>
                                                        <div className="text-[10px] text-gray-500">{cand.userId?.email || 'N/A'}</div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-mono font-bold text-blue-400">
                                                        {cand.score}%
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full font-black text-xs border-2 ${cand.employabilityIndex >= 80 ? 'bg-green-500/10 border-green-500 text-green-400' :
                                                            cand.employabilityIndex >= 50 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
                                                                'bg-red-500/10 border-red-500 text-red-400'
                                                            }`}>
                                                            {cand.employabilityIndex || cand.score}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-[10px] text-gray-600 font-mono">
                                                        {new Date(cand.completedAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-dark-950 border border-blue-500/50 p-8 rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                        <h2 className="text-2xl font-black uppercase mb-6 text-white flex items-center gap-3">
                            <Zap className="text-blue-500" /> Initialize Gauntlet
                        </h2>
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-widest">Company Organization</label>
                                <input value={companyName} onChange={e => setCompanyName(e.target.value)} type="text" className="w-full bg-dark-900 border border-dark-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors" required />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-widest">Target Role (e.g. Frontend Engineer)</label>
                                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} type="text" className="w-full bg-dark-900 border border-dark-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors" required />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-widest">Experience Level</label>
                                <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors">
                                    <option>Entry Level</option>
                                    <option>Mid Level</option>
                                    <option>Senior</option>
                                    <option>Lead</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded font-bold uppercase text-xs tracking-widest transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-xs tracking-widest transition-colors">Deploy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Billing Section */}
            <div className="bg-gradient-to-r from-neon-blue/10 to-purple-500/10 border border-neon-blue/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-neon-blue">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Vanguard Enterprise Clearance</h3>
                        <p className="text-dark-400 text-sm">Unlock deep behavioral forensics, plagiarism heatmap, and unlimited CAL model training.</p>
                    </div>
                </div>
                <button
                    onClick={() => toast.success("Billing Protocol Initialized. Simulation only (Contact Sales).", { icon: "💳" })}
                    className="px-8 py-3 bg-neon-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-neon-blue/20"
                >
                    UPGRADE TO ENTERPRISE
                </button>
            </div>
        </div>
    );
}

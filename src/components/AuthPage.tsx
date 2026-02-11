import { useState } from 'react';
import { Cpu, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AuthPageProps {
    onLogin: (username: string) => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { email, password }
                : { email, password, name: name || email.split('@')[0] };

            const res = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            setIsLoading(false);

            if (res.ok) {
                if (!isLogin) {
                    toast.success(data.message || "Protocol Initiated. Verify email to proceed.");
                    setIsLogin(true); // Switch to login view after registration
                } else {
                    toast.success("Identity Verified. Terminal Access Granted.");
                    localStorage.setItem('token', data.token); // Save JWT
                    localStorage.setItem('user', JSON.stringify(data));
                    onLogin(data.name);
                }
            } else {
                toast.error(data.message || "Authentication Failed");
            }
        } catch (err) {
            setIsLoading(false);
            toast.error("Server Connection Failed");
            console.error(err);
        }
    };

    const handleOAuth = (provider: string) => {
        toast.error(`${provider} OAuth Bridge currently in development. Please use standard Protocol.`);
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden text-white font-mono">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-red/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-red/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-dark-900/80 backdrop-blur-xl border border-dark-700/50 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-dark-800 rounded-xl flex items-center justify-center border border-neon-red/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Cpu size={32} className="text-neon-red animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        JOBGENESIS OS
                    </h1>
                    <p className="text-dark-400 text-sm">
                        v2.1.0 [STABLE] :: {isLogin ? "IDENTITY VERIFICATION" : "NEW USER PROTOCOL"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Candidate Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-dark-950 border border-dark-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-dark-600"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                            <input
                                type="email"
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-dark-600"
                                placeholder="candidate@corp.net"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Access Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                            <input
                                type="password"
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-dark-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-neon-red to-rose-600 hover:from-neon-red/90 hover:to-rose-600/90 text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                            {isLogin ? "INITIATE SESSION" : "CREATE IDENTITY"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>}
                    </button>
                </form>

                <div className="mt-6 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-dark-700" />
                    <span className="text-xs text-dark-500 font-bold uppercase">Or Connect With</span>
                    <div className="h-[1px] flex-1 bg-dark-700" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                        onClick={() => handleOAuth('GitHub')}
                        className="flex items-center justify-center gap-2 py-2.5 bg-dark-950 border border-dark-700 rounded-lg hover:bg-dark-800 hover:border-dark-600 transition-all text-sm text-dark-300"
                    >
                        <Github size={18} /> GitHub
                    </button>
                    <button
                        onClick={() => handleOAuth('Google')}
                        className="flex items-center justify-center gap-2 py-2.5 bg-dark-950 border border-dark-700 rounded-lg hover:bg-dark-800 hover:border-dark-600 transition-all text-sm text-dark-300"
                    >
                        <Chrome size={18} /> Google
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-dark-400 hover:text-white transition-colors underline decoration-dark-700 underline-offset-4 hover:decoration-white"
                    >
                        {isLogin ? "Create New Identity" : "Access Existing Terminal"}
                    </button>
                </div>
            </div>
        </div>
    );
};

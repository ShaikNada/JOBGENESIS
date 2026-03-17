import { useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthPageProps {
    onLogin: (username: string, role?: string) => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
    const [isLoading, setIsLoading] = useState(false);

    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { email, password }
                : { email, password, name: name || email.split('@')[0], role };

            const res = await fetch(`${BACKEND}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            setIsLoading(false);

            if (res.ok) {
                if (!isLogin) {
                    toast.success(data.message || "Registration successful! Please login.");
                    setIsLogin(true);
                } else {
                    toast.success("Login successful!");
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data));
                    onLogin(data.name, data.role);
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

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const res = await fetch(`${BACKEND}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: idToken, role })
            });

            const data = await res.json();
            setIsLoading(false);

            if (res.ok) {
                toast.success("Google login successful!");
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                onLogin(data.name, data.role);
            } else {
                toast.error(data.message || "Google Authentication Failed");
            }
        } catch (err: any) {
            setIsLoading(false);
            if (err.code === 'auth/popup-closed-by-user') {
                toast.error("Sign-in cancelled.");
            } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
                toast.error("Firebase not yet configured. Please set VITE_FIREBASE_* env vars.");
            } else {
                toast.error("Google Sign-In failed. Try again.");
            }
            console.error("Firebase Auth Error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decoration */}
            <div className="mesh-gradient opacity-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="bg-[#0a0a0f] border border-white/5 p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#ff1e56]/50 to-transparent" />

                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group">
                                <Zap size={28} className="text-[#ff1e56] group-hover:animate-pulse transition-all" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white mb-2 uppercase italic">
                            JobGenesis
                        </h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            {isLogin ? "Login" : "Register"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-medium focus:outline-none focus:border-[#ff1e56]/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-700 font-mono"
                                                placeholder="SYSTEM_NAME"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">I am a...</label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setRole('candidate')}
                                                className={`flex-1 py-3 text-[10px] font-black rounded-xl border transition-all ${role === 'candidate' ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                            >
                                                CANDIDATE
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('recruiter')}
                                                className={`flex-1 py-3 text-[10px] font-black rounded-xl border transition-all ${role === 'recruiter' ? 'bg-[#ff1e56]/10 border-[#ff1e56] text-[#ff1e56] shadow-[0_0_15px_rgba(255,30,86,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                            >
                                                RECRUITER
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-medium focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-700 font-mono"
                                placeholder="ACCESS@OS.NET"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-medium focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-700 font-mono"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-black py-4 rounded-xl shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-xs tracking-widest mt-4 uppercase"
                        >
                            {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>
                                {isLogin ? "Login" : "Sign Up"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Or continue with</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                        >
                            {/* Google SVG Icon */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Sign in with Google
                        </button>
                    </div>

                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-white"
                        >
                            {isLogin ? "Register" : "Back to Login"}
                        </button>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="mt-8 text-center text-[9px] text-gray-700 font-bold uppercase tracking-[0.4em]">
                    JobGenesis / OS :: Encrypted Link Protocol 2.4.1
                </div>
            </motion.div>
        </div>
    );
};

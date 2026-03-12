import { ArrowRight, BrainCircuit, Terminal, ShieldAlert, Cpu, Play, Users, Zap, Activity, Target, UploadCloud, Map, BarChart3 } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
    onEnterTerminal: () => void;
}

const radarData = [
    { subject: 'Algorithms', A: 85 },
    { subject: 'System Design', A: 70 },
    { subject: 'Frontend', A: 90 },
    { subject: 'Backend', A: 75 },
    { subject: 'DevOps', A: 60 },
    { subject: 'Security', A: 80 },
];

export const LandingPage = ({ onEnterTerminal }: LandingPageProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);


    const springX = useSpring(0, { stiffness: 50, damping: 20 });
    const springY = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = (clientX - window.innerWidth / 2) / 50;
            const moveY = (clientY - window.innerHeight / 2) / 50;
            springX.set(moveX);
            springY.set(moveY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [springX, springY]);

    const fadeUp: any = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    // Particle Logic
    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 10
        }));
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#00f0ff]/30 relative">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="mesh-gradient opacity-30" />

                {/* Animated Grid Lines */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '80px 80px'
                    }}
                />
                <motion.div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`,
                        backgroundSize: '400px 400px',
                        translateX: springX,
                        translateY: springY,
                    }}
                />

                {/* Floating Particles */}
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-white/20"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.x}%`,
                            top: `${p.y}%`
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* 1. TOP NAVIGATION */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/40 backdrop-blur-2xl px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff1e56] to-[#00f0ff] flex items-center justify-center shadow-[0_0_15px_rgba(255,30,86,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all">
                        <Zap size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic transition-colors">JobGenesis</span>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    {['Features', 'How It Works', 'For Recruiters'].map((item) => (
                        <button key={item} className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#00f0ff] transition-all group-hover:w-full shadow-[0_0_8px_#00f0ff]" />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <button onClick={onEnterTerminal} className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Login</button>
                    <button
                        onClick={onEnterTerminal}
                        className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.15em] rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="pt-56 pb-40 px-8 flex flex-col items-center text-center relative max-w-7xl mx-auto z-10"
            >
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-10 shadow-inner"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                    <span className="text-[9px] uppercase font-black tracking-[0.3em] text-[#00f0ff]">System Online</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.9] italic"
                >
                    AI-POWERED <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                        CAREER GUIDE
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-500 max-w-3xl mb-16 font-medium leading-relaxed uppercase tracking-tight"
                >
                    Upload your resume. Find your skill gaps. <br />
                    Build your career path with AI guidance.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-8"
                >
                    <button
                        onClick={onEnterTerminal}
                        className="px-12 py-6 bg-[#ff1e56] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_50px_rgba(255,30,86,0.4)] transition-all flex items-center gap-4 group"
                    >
                        Start Analysis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onEnterTerminal}
                        className="px-12 py-6 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center gap-4 group">
                        <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Watch Demo
                    </button>
                </motion.div>

                {/* 3D Perspective Dashboard Preview (Higher Fidelity) */}
                <motion.div
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, type: 'spring' }}
                    className="mt-32 w-full max-w-6xl h-[650px] bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-[0_100px_200px_rgba(0,0,0,0.8)] overflow-hidden relative group p-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10" />

                    {/* Mock Interface Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02]">
                        <div className="flex gap-2">
                            {[1, 2, 3].map((i, index) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                    className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-neon-red/80' : i === 2 ? 'bg-yellow-500/80' : 'bg-green-500/80'}`}
                                />
                            ))}
                        </div>
                        <div className="h-6 w-1/3 bg-white/5 rounded-full mx-auto relative overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '300%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-neon-blue"
                        >
                            <Zap size={14} />
                        </motion.div>
                    </div>

                    <div className="p-10 grid grid-cols-12 gap-8 h-full">
                        {/* Sidebar Mock */}
                        <div className="col-span-3 space-y-4">
                            <div className="h-12 w-full bg-gradient-to-r from-[#00f0ff]/10 to-transparent rounded-xl border-l-2 border-[#00f0ff]" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-12 w-4/5 bg-white/[0.02] rounded-xl ml-2" />
                            ))}
                        </div>
                        {/* Content Mock */}
                        <div className="col-span-9 grid grid-cols-3 gap-8">
                            <div className="col-span-3 h-48 bg-white/[0.03] rounded-[32px] border border-white/5 p-8 flex items-center justify-around relative overflow-hidden">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-32 -left-32 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl"
                                />
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="56" cy="56" r="52" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="8" fill="none" />
                                        <motion.circle
                                            cx="56" cy="56" r="52"
                                            stroke="#00f0ff" strokeWidth="8" fill="none"
                                            strokeDasharray="326"
                                            initial={{ strokeDashoffset: 326 }}
                                            whileInView={{ strokeDashoffset: 326 * 0.15 }}
                                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                            style={{ filter: "drop-shadow(0 0 10px rgba(0,240,255,0.8))" }}
                                        />
                                    </svg>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1 }}
                                        className="font-black text-2xl text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                                    >
                                        85%
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full border border-neon-blue/30"
                                    />
                                </div>
                                <div className="space-y-4 flex-1 ml-10 z-10">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: "33%" }} transition={{ duration: 1, delay: 0.5 }} className="h-4 bg-white/20 rounded-full" />
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.2, delay: 0.7 }} className="h-2 bg-gradient-to-r from-neon-blue to-purple-500 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: "80%" }} transition={{ duration: 1.4, delay: 0.9 }} className="h-2 bg-white/10 rounded-full" />
                                </div>
                            </div>
                            <div className="col-span-1 h-64 bg-white/[0.02] rounded-[32px] border border-white/5 p-6 space-y-4 relative overflow-hidden group">
                                <motion.div
                                    animate={{ y: ['-100%', '100%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="h-3 w-1/2 bg-neon-red/40 shadow-[0_0_10px_rgba(255,30,86,0.5)] rounded-full mb-6" />
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3, 4].map((i, idx) => (
                                        <div key={i} className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ x: '-100%' }}
                                                whileInView={{ x: 0 }}
                                                transition={{ duration: 1.5, delay: 1 + (idx * 0.2), ease: "easeOut" }}
                                                className="h-full bg-white/30 w-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2 h-64 bg-white/[0.02] rounded-[32px] border border-white/5 p-6 relative overflow-hidden">
                                <motion.div
                                    animate={{ backgroundPosition: ['0px 0px', '0px 40px'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 opacity-30"
                                    style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,0.2) 1px, transparent 1px)', backgroundSize: '100% 20px' }}
                                />
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#00f0ff]/10 to-transparent skew-x-[-20deg]"
                                />
                                <div className="h-3 w-1/4 bg-white/20 rounded-full relative z-10" />
                            </div>
                        </div>
                    </div>
                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent blur-sm z-20" />
                </motion.div>
            </motion.section>

            {/* 3. LIVE AI PREVIEW SECTION */}
            <section className="py-40 px-8 bg-[#08080c]/50 relative border-y border-white/5 overflow-hidden z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="space-y-10 text-left"
                    >
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] italic">
                            HEURISTIC <br />
                            <span className="text-[#00f0ff]">SYNOPSIS</span>
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed font-medium uppercase tracking-tight">
                            Our engine executes cross-sector semantic vector parsing to calculate your identity fingerprint against 10M+ elite datasets.
                        </p>
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <div className="text-5xl font-black text-white italic tracking-tighter">94%</div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black mt-2">Dossier Integrity</div>
                            </div>
                            <div>
                                <div className="text-5xl font-black text-[#ff1e56] italic tracking-tighter">A+</div>
                                <div className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black mt-2">Neural Grade</div>
                            </div>
                        </div>
                        <button
                            onClick={onEnterTerminal}
                            className="flex items-center gap-3 text-[#00f0ff] font-black text-[11px] uppercase tracking-widest hover:gap-5 transition-all">
                            Deep Link Analysis <ArrowRight size={16} />
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="bg-[#050505] border border-white/5 rounded-[40px] p-12 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] group overflow-hidden"
                    >
                        <div className="mesh-gradient opacity-10 absolute inset-0 group-hover:opacity-20 transition-opacity" />
                        <div className="absolute top-0 right-0 p-8">
                            <Activity size={32} className="text-[#00f0ff] animate-pulse" />
                        </div>
                        <div className="h-[400px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11, fontWeight: 'black' }} />
                                    <Radar name="Candidate" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.2} strokeWidth={3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#ff1e56]/50 transition-colors">
                                    <Cpu size={24} className="text-[#ff1e56]" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Processing Core</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-tighter italic">Synthesizing Stratigraphy...</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[24px] font-black text-[#00f0ff] leading-none mb-1">2.4<span className="text-xs">s</span></div>
                                <div className="text-[9px] text-gray-600 uppercase font-black">Latency</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. FEATURES GRID */}
            <section className="py-40 px-8 max-w-7xl mx-auto z-10 relative">
                <div className="text-center mb-32 space-y-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#ff1e56] italic">System Core</h2>
                    <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase whitespace-pre-line">
                        Advanced Career <br /> Intelligence Suite
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'Vector Parsing', icon: BrainCircuit, desc: 'Experience mapped in high-dimensional semantic space for sub-millisecond comparisons.' },
                        { title: 'Void Identification', icon: ShieldAlert, desc: 'Proprietary telemetry that pinpoints technical deficiencies vs market demands.' },
                        { title: 'Future Trajectory', icon: Target, desc: 'Algorithmic forecasting of success rates at FANG+ and elite AI labs.' },
                        { title: 'Live Gauntlets', icon: BarChart3, desc: 'Pressure-tested technical assessments with real-time complexity analytics.' },
                        { title: 'Evolution Map', icon: Map, desc: 'Personalized pathway generation focused on high-compensation skill acquisition.' },
                        { title: 'Risk Scoping', icon: Users, desc: 'Multi-variable career move simulation to minimize pivot friction.' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8 } }
                            }}
                            className="p-10 rounded-[32px] bg-[#0a0a0f]/50 border border-white/5 hover:border-[#00f0ff]/30 transition-all group relative overflow-hidden flex flex-col items-center text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00f0ff]/40 transition-all mb-8 shadow-inner relative z-10">
                                <feature.icon size={28} className="text-gray-500 group-hover:text-[#00f0ff] transition-colors" />
                            </div>
                            <h4 className="text-xl font-black mb-4 group-hover:text-white transition-colors relative z-10 italic uppercase tracking-tighter">{feature.title}</h4>
                            <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors leading-relaxed font-medium relative z-10">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. HOW IT WORKS */}
            <section className="py-40 px-8 bg-[#030305] relative z-10 overflow-hidden">
                <div className="mesh-gradient absolute inset-0 opacity-5 pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-32">
                        <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">How it Works</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Your journey to a new job</p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-24">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent z-0" />

                        {[
                            { step: '01', title: 'Upload Resume', desc: 'Securely upload your resume in any format.', icon: UploadCloud },
                            { step: '02', title: 'AI Analysis', desc: 'Our AI analyzes your skills against current market needs.', icon: Cpu },
                            { step: '03', title: 'Get Matches', desc: 'Instantly view matching jobs and skill gaps.', icon: Zap },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="flex flex-col items-center text-center relative z-10"
                            >
                                <div className="w-20 h-20 rounded-[28px] bg-[#050505] border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <item.icon size={32} className="text-[#00f0ff] relative z-10" />
                                    <div className="absolute bottom-1 right-2 text-[8px] font-black text-gray-800">{item.step}</div>
                                </div>
                                <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter">{item.title}</h4>
                                <p className="text-[13px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. SOCIAL PROOF / STATS */}
            <section className="py-32 border-y border-white/5 bg-[#050505] z-10 relative">
                <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 lg:grid-cols-4 gap-20">
                    {[
                        { value: '1M+', label: 'RESUMES ANALYZED' },
                        { value: '98%', label: 'MATCH ACCURACY' },
                        { value: '450+', label: 'SKILL CATEGORIES' },
                        { value: '1.2s', label: 'ANALYSIS SPEED' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4"
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-[11px] uppercase font-black tracking-[0.4em] text-[#ff1e56]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. FINAL CTA SECTION */}
            <section className="py-56 px-8 text-center relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.06)_0%,transparent_70%)] pointer-events-none" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="max-w-4xl mx-auto space-y-16"
                >
                    <h2 className="text-7xl md:text-[130px] font-black tracking-tighter leading-[0.8] uppercase">
                        GET <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#3b82f6]">
                            HIRED
                        </span>
                    </h2>
                    <p className="text-gray-500 text-xl font-medium uppercase tracking-widest max-w-2xl mx-auto">
                        Find your gaps. Boost your skills. <br /> Get the job you deserve.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={onEnterTerminal}
                            className="group relative px-16 py-8 bg-white text-black text-[13px] font-black rounded-[24px] overflow-hidden hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] transition-all transform active:scale-95"
                        >
                            <span className="relative z-10 tracking-[0.3em]">GET STARTED NOW</span>
                            <div className="absolute inset-0 bg-[#00f0ff] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </button>
                        <div className="flex items-center gap-3 text-[10px] text-gray-700 font-black uppercase tracking-[0.5em] mt-10">
                            <Terminal size={12} /> System Status: Online v2.4.1
                        </div>
                    </div>
                </motion.div>
            </section>

            <footer className="py-10 border-t border-white/5 bg-[#030305] text-center relative z-10 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">© 2026 JobGenesis // All Rights Reserved</div>
                    <div className="flex gap-10">
                        {['Security', 'Terminal', 'Telemetry'].map(item => (
                            <button
                                key={item}
                                onClick={onEnterTerminal}
                                className="text-[10px] text-gray-700 font-bold uppercase tracking-widest hover:text-white transition-colors">{item}</button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

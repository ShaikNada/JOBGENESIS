import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Code2, Play, Terminal, Cpu, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Props {
  onStart: (role: string, company: string, level: string) => void;
}

const LEVELS = ["Intern/Fresher", "Mid-Level", "Senior/Expert"];

// Pre-defined suggestions for the "Simulation Database"
const ROLES = [
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Engineer", 
  "DevOps Engineer",
  "Security Architect",
  "Machine Learning Engineer",
  "Data Scientist",
  "iOS Developer",
  "Android Developer",
  "System Administrator"
];

const COMPANIES = [
  "Google",
  "Amazon",
  "Netflix",
  "Microsoft",
  "Meta",
  "Apple",
  "Tesla",
  "Uber",
  "Airbnb",
  "Spotify",
  "OpenAI",
  "Palantir"
];

export const ConfigScreen = ({ onStart }: Props) => {
  const [role, setRole] = useState(" ");
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState("");

  // Dropdown States
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);

  // Close dropdowns when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowRoleSuggestions(false);
        setShowCompanySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-dark-950 text-white relative overflow-hidden" ref={containerRef}>
      
      {/* Red Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-red rounded-full blur-[150px]"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 0, 60, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-lg p-1 bg-dark-900 border border-neon-red/50 shadow-[0_0_40px_rgba(255,0,60,0.3)]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)" }} 
      >
        <div className="bg-dark-950 p-8 h-full w-full">
          <div className="flex justify-center mb-8">
            <div className="p-4 border-2 border-neon-red rounded-full shadow-[0_0_20px_#ff003c] animate-pulse-fast">
              <Cpu size={40} className="text-neon-red" />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-2 text-center text-white tracking-tighter uppercase" style={{ textShadow: "0 0 10px #ff003c" }}>
            JOB<span className="text-neon-red">GENESIS</span>
          </h1>
          <p className="text-red-400/60 text-center mb-8 font-mono text-xs uppercase tracking-[0.2em]">System Initialization Sequence</p>

          <div className="space-y-6 font-mono">
            
            {/* ROLE INPUT + DROPDOWN */}
            <div className="group relative">
              <label className="flex items-center gap-2 text-xs font-bold text-neon-red mb-2 uppercase tracking-wider">
                <Code2 size={14} /> Target Role
              </label>
              <div className="relative">
                <input 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={() => setShowRoleSuggestions(true)}
                  className="w-full bg-dark-900 border border-dark-700 text-white p-3 focus:border-neon-red focus:ring-1 focus:ring-neon-red outline-none transition-all placeholder:text-dark-700 z-10 relative"
                  placeholder="Type or select role..."
                />
                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 w-4 h-4" />
              </div>
              
              <AnimatePresence>
                {showRoleSuggestions && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute w-full bg-dark-900 border border-neon-red mt-1 max-h-48 overflow-y-auto z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] scrollbar-thin scrollbar-thumb-neon-red"
                  >
                    {ROLES.filter(r => r.toLowerCase().includes(role.toLowerCase())).map((r) => (
                      <li 
                        key={r}
                        onClick={() => { setRole(r); setShowRoleSuggestions(false); }}
                        className="px-4 py-2 hover:bg-neon-red hover:text-black cursor-pointer text-sm border-b border-dark-800 last:border-0 transition-colors"
                      >
                        {r}
                      </li>
                    ))}
                    {ROLES.filter(r => r.toLowerCase().includes(role.toLowerCase())).length === 0 && (
                       <li className="px-4 py-2 text-gray-500 text-sm italic">System: Custom Role detected...</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* COMPANY INPUT + DROPDOWN */}
            <div className="group relative">
              <label className="flex items-center gap-2 text-xs font-bold text-neon-red mb-2 uppercase tracking-wider">
                <Building2 size={14} /> Target Company
              </label>
              <div className="relative">
                <input 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onFocus={() => setShowCompanySuggestions(true)}
                  className="w-full bg-dark-900 border border-dark-700 text-white p-3 focus:border-neon-red focus:ring-1 focus:ring-neon-red outline-none transition-all placeholder:text-dark-700"
                  placeholder="Type or select entity..."
                />
                 <ChevronDown className="absolute right-3 top-3.5 text-gray-500 w-4 h-4" />
              </div>

              <AnimatePresence>
                {showCompanySuggestions && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute w-full bg-dark-900 border border-neon-red mt-1 max-h-48 overflow-y-auto z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] scrollbar-thin scrollbar-thumb-neon-red"
                  >
                    {COMPANIES.filter(c => c.toLowerCase().includes(company.toLowerCase())).map((c) => (
                      <li 
                        key={c}
                        onClick={() => { setCompany(c); setShowCompanySuggestions(false); }}
                        className="px-4 py-2 hover:bg-neon-red hover:text-black cursor-pointer text-sm border-b border-dark-800 last:border-0 transition-colors"
                      >
                        {c}
                      </li>
                    ))}
                    {COMPANIES.filter(c => c.toLowerCase().includes(company.toLowerCase())).length === 0 && (
                       <li className="px-4 py-2 text-gray-500 text-sm italic">System: Unknown Entity...</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Level Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-neon-red mb-3 uppercase tracking-wider">
                <Terminal size={14} /> Difficulty Parameters
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={clsx(
                      "p-2 text-[10px] uppercase font-bold border transition-all",
                      level === l 
                        ? "bg-neon-red text-black border-neon-red shadow-[0_0_15px_#ff003c]" 
                        : "bg-dark-900 border-dark-700 text-gray-500 hover:text-white hover:border-red-500"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStart(role, company, level)}
              className="w-full flex items-center justify-center gap-2 bg-neon-red hover:bg-red-600 text-black font-black py-4 uppercase tracking-widest transition-all hover:shadow-[0_0_30px_#ff003c] mt-6 group"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%)" }}
            >
              <Play size={18} fill="currentColor" className="group-hover:translate-x-1 transition-transform" /> 
              Execute Simulation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
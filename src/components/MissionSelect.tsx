import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Server, Database, Shield, Globe, Cpu, ArrowRight, 
  Smartphone, Terminal, Layers, Wifi, Search, Building2, Briefcase
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onStart: (config: { role: string; company: string; level: string }) => void;
}

// --- DATASETS ---
const ROLES = [
  { id: 'frontend', label: 'Frontend Engineer', icon: Code2, desc: 'React, Vue, UI/UX' },
  { id: 'backend', label: 'Backend Architect', icon: Server, desc: 'Node, Go, Scalability' },
  { id: 'fullstack', label: 'Full Stack Dev', icon: Layers, desc: 'End-to-End Systems' },
  { id: 'mobile', label: 'Mobile Developer', icon: Smartphone, desc: 'iOS, Android, React Native' },
  { id: 'devops', label: 'DevOps Engineer', icon: Wifi, desc: 'CI/CD, Docker, K8s' },
  { id: 'security', label: 'Security Analyst', icon: Shield, desc: 'Pen-Testing, Crypto' },
  { id: 'ai', label: 'AI/ML Engineer', icon: Cpu, desc: 'PyTorch, TensorFlow, LLMs' },
  { id: 'data', label: 'Data Scientist', icon: Database, desc: 'Python, SQL, Analytics' },
  { id: 'blockchain', label: 'Blockchain Dev', icon: Globe, desc: 'Solidity, Web3, Smart Contracts' },
  { id: 'qa', label: 'QA Engineer', icon: Terminal, desc: 'Automation, Cypress, Jest' },
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

const LEVELS = ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal'];

export const MissionSelect = ({ onStart }: Props) => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [selectedLevel, setSelectedLevel] = useState('Junior');

  const [roleSearch, setRoleSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const filteredRoles = ROLES.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()));
  const filteredCompanies = COMPANIES.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()));

  return (
    // FIX: Changed to h-screen with overflow-y-auto to FORCE scrolling within this container
    <div className="h-screen w-full bg-dark-950 text-white font-sans selection:bg-neon-red selection:text-white flex flex-col relative overflow-y-auto overflow-x-hidden">
      
      {/* Background Noise - Fixed to viewport so it doesn't move */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      {/* Header - Sticky within the scroll container */}
      <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-dark-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-neon-red rounded-full animate-pulse shadow-[0_0_10px_#ff003c]"></div>
            <div className="absolute inset-0 bg-neon-red rounded-full animate-ping opacity-20"></div>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-widest uppercase">
            JobGenesis <span className="text-neon-red">///</span> Mission Control
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
           <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pb-20">
        
        {/* === LEFT COLUMN: CONFIGURATION === */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* 1. ROLE SELECTION */}
          <section className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 relative">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-neon-red">01 //</span> Select Class
                </h2>
                <div className="relative w-full max-w-xs">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="Search Protocol..." 
                     value={roleSearch}
                     onChange={(e) => setRoleSearch(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-neon-red focus:outline-none transition-colors font-mono"
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence>
                  {filteredRoles.map((role) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-xl border text-left transition-all relative group overflow-hidden h-fit",
                        selectedRole.id === role.id 
                          ? "bg-neon-red/10 border-neon-red shadow-[0_0_15px_rgba(255,0,60,0.1)]" 
                          : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5"
                      )}
                    >
                      <div className={clsx(
                        "p-2 rounded-lg transition-colors shrink-0",
                        selectedRole.id === role.id ? "bg-neon-red text-black" : "bg-dark-800 text-gray-500 group-hover:text-white"
                      )}>
                        <role.icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className={clsx("font-bold text-sm truncate", selectedRole.id === role.id ? "text-white" : "text-gray-300")}>{role.label}</div>
                        <div className="text-[10px] text-gray-500 font-mono truncate">{role.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {filteredRoles.length === 0 && <div className="col-span-full text-center text-gray-600 py-10 font-mono text-sm">No matching classes found.</div>}
             </div>
          </section>

          {/* 2. COMPANY SELECTION */}
          <section className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 relative">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-neon-red">02 //</span> Select Target Entity
                </h2>
                <div className="relative w-full max-w-xs">
                   <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="Filter Entities..." 
                     value={companySearch}
                     onChange={(e) => setCompanySearch(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-neon-red focus:outline-none transition-colors font-mono"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCompanies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompany(comp)}
                    className={clsx(
                      "p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 group",
                      selectedCompany.id === comp.id 
                        ? "bg-white/10 border-white/40 shadow-inner" 
                        : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex justify-between items-start">
                       <span className={clsx("text-[10px] font-mono uppercase tracking-wider opacity-60", selectedCompany.id === comp.id ? "text-white" : "text-gray-500")}>
                         {comp.category}
                       </span>
                       {selectedCompany.id === comp.id && <div className="w-1.5 h-1.5 bg-neon-red rounded-full shadow-[0_0_5px_#ff003c]"></div>}
                    </div>
                    <div className={clsx("font-bold text-sm truncate", selectedCompany.id === comp.id ? "text-white" : comp.color)}>
                      {comp.name}
                    </div>
                  </button>
                ))}
             </div>
          </section>
          
          {/* 3. DIFFICULTY */}
          <section>
            <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-neon-red">03 //</span> Clearance Level
            </h2>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={clsx(
                    "px-5 py-2 rounded text-xs font-mono border transition-all uppercase tracking-wider",
                    selectedLevel === lvl 
                      ? "bg-white text-black border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-dark-900 border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </section>

        </div>

        {/* === RIGHT COLUMN: MISSION PREVIEW (STICKY) === */}
        <div className="col-span-1 lg:col-span-4">
          {/* Sticky Header Fix: top-28 ensures it sticks below the main header */}
          <div className="sticky top-28 z-20">
            <div className="bg-dark-900/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50 animate-pulse"></div>

              <div className="flex justify-between items-start mb-8">
                 <h3 className="font-mono text-gray-500 text-xs uppercase tracking-widest">Mission Briefing</h3>
                 <div className="px-2 py-1 border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                   <Wifi size={10} /> Secure Link
                 </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-600 uppercase font-bold block">Assigned Role</label>
                  <div className="text-2xl font-black text-white leading-none tracking-tight">{selectedRole.label}</div>
                  <div className="text-xs text-neon-red font-mono">{selectedRole.desc}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-600 uppercase font-bold block">Target Entity</label>
                  <div className={clsx("text-xl font-bold transition-colors", selectedCompany.color)}>{selectedCompany.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{selectedCompany.category}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div>
                      <label className="text-[10px] text-gray-600 uppercase font-bold block">Clearance</label>
                      <div className="text-white font-mono text-sm">{selectedLevel}</div>
                   </div>
                   <div>
                      <label className="text-[10px] text-gray-600 uppercase font-bold block">Est. Time</label>
                      <div className="text-white font-mono text-sm">~45 Mins</div>
                   </div>
                </div>

                <button
                  onClick={() => onStart({ role: selectedRole.label, company: selectedCompany.name, level: selectedLevel })}
                  className="w-full group relative py-4 bg-neon-red hover:bg-red-600 text-black font-black uppercase tracking-widest rounded-xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,0,60,0.3)] mt-4"
                >
                  <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Briefcase size={16} /> Initialize Simulation <ArrowRight size={16} />
                  </span>
                </button>
                
                <div className="text-center">
                   <p className="text-[10px] text-gray-600 font-mono">
                     By initializing, you agree to the <span className="text-gray-400 underline decoration-dotted">Sentinel Anti-Cheat Protocol</span>.
                   </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
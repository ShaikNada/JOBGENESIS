import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Zap, Brain, Play, Shield, Terminal, TrendingUp, Cpu, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillGapReportProps {
  data: any;
  onBack: () => void;
  onStartSimulation: (config: any) => void;
}

export const SkillGapReportPage = ({ data, onBack, onStartSimulation }: SkillGapReportProps) => {
  const { gapResult, pathResult, role, company, jobUrl, isLiveMatch } = data;
  
  const matchScore = gapResult?.matchScore || 0;
  const employability = gapResult?.employabilityIndex || 0;
  const pivotRoles = gapResult?.pivotRoles || [];
  const statusLabel = isLiveMatch || gapResult?.isVacant ? 'Neural Link Verified // Job Open' : 'Vanguard Deployment // Analyzing Market Requisites';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400 border-red-500/50';
    if (score >= 50) return 'text-red-500 border-red-600/30';
    return 'text-red-600 border-red-900/50';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
    if (score >= 50) return 'bg-red-600/5 shadow-[0_0_15px_rgba(220,38,38,0.05)]';
    return 'bg-red-900/5';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-8 overflow-y-auto selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-all uppercase tracking-[0.2em] text-[10px] font-black group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Neural Hub
          </button>
          
          <div className="px-4 py-1.5 bg-red-500/5 border border-red-500/20 text-red-500 text-[9px] uppercase font-black tracking-[0.2em] rounded-full flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)] ${(isLiveMatch || gapResult?.isVacant) ? 'bg-green-500' : 'bg-red-500'}`} /> 
            {statusLabel}
          </div>
        </div>

        {/* Global Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (Left 8/12) */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Hero Assessment Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#0a0a10] to-[#050505] border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 shadow-2xl relative overflow-hidden group"
            >
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-2 py-0.5 border border-red-500/30 rounded text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/5">Target Role</div>
                  <div className="h-[1px] w-12 bg-white/10" />
                  <Shield size={12} className="text-gray-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2 uppercase leading-none">{role}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                   <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-red-500" />
                    <h2 className="text-xl text-gray-400 font-bold uppercase tracking-[0.2em]">{company}</h2>
                   </div>
                   {jobUrl && (
                     <a 
                      href={jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] whitespace-nowrap"
                     >
                       <ExternalLink size={14} /> Neural Apply ▹
                     </a>
                   )}
                </div>
              </div>
              
              <div className="flex gap-4 md:gap-6 relative z-10">
                <div className={`p-6 rounded-[1.5rem] border flex flex-col items-center justify-center min-w-[120px] transition-all hover:scale-105 duration-500 ${getScoreBg(matchScore)} ${getScoreColor(matchScore)}`}>
                  <div className="text-4xl font-black mb-1">{matchScore}%</div>
                  <div className="text-[8px] uppercase font-black tracking-widest opacity-60">Match</div>
                </div>
                
                <div className={`p-6 rounded-[1.5rem] border flex flex-col items-center justify-center min-w-[120px] transition-all hover:scale-105 duration-500 ${getScoreBg(employability)} ${getScoreColor(employability)}`}>
                  <div className="text-4xl font-black mb-1">{employability}</div>
                  <div className="text-[8px] uppercase font-black tracking-widest opacity-60">Success Index</div>
                </div>
              </div>
            </motion.div>

            {/* Skill Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 shadow-lg">
                <h3 className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><XCircle size={14} /> Strategic Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {gapResult?.missingSkills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{skill}</span>
                  )) || <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No Gaps Detected</p>}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 shadow-lg">
                <h3 className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><CheckCircle2 size={14} /> Intelligence Assets</h3>
                <div className="flex flex-wrap gap-2">
                  {gapResult?.matchedSkills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 bg-green-500/5 border border-green-500/10 text-green-400 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{skill}</span>
                  )) || <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Awaiting Data Sync</p>}
                </div>
              </motion.div>
            </div>

            {/* Strategic Intelligence RoadMap */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-[#0a0a10] to-[#07070c] border border-red-500/20 rounded-[2rem] p-10 relative group">
              <h3 className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                <div className="p-2 bg-red-500/10 rounded-lg"><Brain size={16} /></div> Strategic Deployment
              </h3>
              <div className="prose prose-invert prose-red max-w-none text-gray-400">
                <div className="roadmap-content [&>h4]:text-white [&>h4]:uppercase [&>h4]:tracking-[0.2em] [&>h4]:font-black [&>h4]:text-[10px] [&>h4]:mb-3 [&>h4]:mt-8 [&>ul]:space-y-2 [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:before:content-['▹'] [&>ul>li]:before:text-red-500 [&>ul>li]:before:mr-3 [&>ul>li]:text-sm"
                  dangerouslySetInnerHTML={{ __html: pathResult?.careerPath || pathResult?.feedback || "Neural analysis sequence failed. Retrying..." }} />
              </div>
            </motion.div>
          </div>

          {/* Pivot Sidebar (Right 3/12) */}
          <aside className="lg:col-span-3 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0c0c14] border border-red-500/30 rounded-[2rem] p-6 sticky top-8 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-red-500" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Path Pivots</h3>
              </div>
              
              <div className="space-y-4">
                {pivotRoles.length > 0 ? pivotRoles.map((pivot: any, idx: number) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03, x: 5 }}
                    onClick={() => onStartSimulation({ role: pivot.role, company: pivot.company || 'Market Leader', level: 'Mid-Level' })}
                    className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-red-500/40 transition-all text-left group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-[11px] font-black text-gray-200 uppercase tracking-tight line-clamp-1">{pivot.role}</div>
                      <div className="text-[10px] font-black text-red-500">{pivot.match}%</div>
                    </div>
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 opacity-70">@ {pivot.company || 'Market'}</div>
                    <p className="text-[9px] text-gray-500 font-medium leading-tight line-clamp-2 italic">{pivot.reason}</p>
                    <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-[1px] flex-1 bg-red-500/20" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Jump ▹</span>
                    </div>
                  </motion.button>
                )) : (
                  <div className="p-4 border border-dashed border-white/10 rounded-2xl text-center">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Calculating Alts...</p>
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={12} className="text-red-500" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency Tip</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Your stack overlaps significantly with these roles. Tactical pivoting could increase salary by 15-20%.</p>
              </div>
            </motion.div>
          </aside>

        </div>

        {/* Global CTA Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-10">
          <button 
            onClick={() => onStartSimulation({ role, company, level: 'Mid-Level' })}
            className="w-full group relative py-8 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.4em] text-xs rounded-3xl overflow-hidden transition-all shadow-[0_0_50px_rgba(220,38,38,0.2)] flex items-center justify-center gap-4"
          >
            <Play size={20} fill="currentColor" stroke="none" className="group-hover:scale-110 transition-transform" />
            Initialize Vanguard Assessment
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-800">
            <Shield size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Vanguard Deployment Protocol // Enterprise Grade Verified</span>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

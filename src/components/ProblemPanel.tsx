import { useState } from 'react';
import { Loader2, Target, FileText, Eye, AlertTriangle, Maximize2, X, Grid, GitMerge } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { DataVisualizer } from './DataVisualizer';

interface Props {
  loading: boolean;
  problem: { 
    title: string; 
    difficulty: string; 
    description: string; 
    visualType?: string; 
    visualData?: any; 
  } | null;
}

export const ProblemPanel = ({ loading, problem }: Props) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'visual'>('brief');
  const [showFullBlueprint, setShowFullBlueprint] = useState(false);

  const hasVisualData = problem?.visualData && Array.isArray(problem.visualData) && problem.visualData.length > 0;

  return (
    <>
      <div className="h-full flex flex-col bg-dark-950 border-r border-dark-800 relative">
        <div className="h-12 border-b border-dark-800 flex items-center bg-dark-900 shrink-0 z-10 shadow-lg">
          <button onClick={() => setActiveTab('brief')} className={clsx("flex-1 h-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden", activeTab === 'brief' ? "text-neon-red bg-dark-950" : "text-gray-500 hover:text-white hover:bg-dark-800")}>
            <FileText size={14} /> Mission Brief
            {activeTab === 'brief' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-red shadow-[0_0_10px_#ff003c]" />}
          </button>
          <div className="w-px h-6 bg-dark-800"></div>
          <button onClick={() => setActiveTab('visual')} className={clsx("flex-1 h-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden", activeTab === 'visual' ? "text-blue-400 bg-dark-950" : "text-gray-500 hover:text-white hover:bg-dark-800")}>
            <GitMerge size={14} /> Logic Flow
            {activeTab === 'visual' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />}
          </button>
        </div>
        
        <div className="flex-1 relative overflow-hidden bg-dark-950">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #0f0f0f; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff003c; }
            .lc-content { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; color: #d4d4d4; }
            .lc-content h3.example-header { margin-top: 32px; margin-bottom: 12px; color: #fff; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 8px; }
            .lc-content h3.example-header::before { content: ''; display: block; width: 4px; height: 14px; background: #ff003c; }
            .lc-content .example-block { background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 16px; margin-bottom: 24px; color: #ccc; font-size: 12px; white-space: pre-wrap; position: relative; overflow: hidden; }
            .lc-content .example-block::before { content: ''; position: absolute; inset: 0; opacity: 0.05; pointer-events: none; background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 20px 20px; }
            .lc-content .ex-label { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 8px; margin-top: 8px; margin-bottom: 4px; }
            .lc-content .ex-label.input { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
            .lc-content .ex-label.output { background: rgba(255, 0, 60, 0.1); color: #ff003c; border: 1px solid rgba(255, 0, 60, 0.2); }
            .lc-content .ex-label.explain { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
            .lc-content h3.constraint-header { margin-top: 40px; margin-bottom: 16px; color: #eab308; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(234, 179, 8, 0.2); padding-bottom: 8px; }
            .lc-content ul.constraint-list { list-style: none; padding: 0; }
            .lc-content ul.constraint-list li { background: #111; padding: 8px 12px; margin-bottom: 4px; border-radius: 4px; border-left: 2px solid #333; font-size: 11px; color: #aaa; }
            .lc-content code { background: #222; padding: 2px 5px; border-radius: 3px; color: #fff; font-size: 0.9em; }
            .lc-content strong { color: #fff; }
          `}</style>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Loader2 className="animate-spin text-neon-red" size={32} />
              <div className="text-center font-mono text-sm">
                <p className="text-white animate-pulse">Decrypting Mission Data...</p>
                <p className="text-xs opacity-50">Establishing Secure Link</p>
              </div>
            </div>
          ) : problem ? (
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
              {activeTab === 'brief' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
                  <div className="mb-8 pb-6 border-b border-dark-800">
                    <h1 className="text-2xl font-black text-white flex items-start gap-4 uppercase tracking-tight leading-none">
                      <Target className="text-neon-red shrink-0 mt-1" size={28} />
                      {problem.title}
                    </h1>
                    <div className="mt-4"><span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded text-yellow-400 border-yellow-400/30 bg-yellow-400/10">{problem.difficulty || "Classified"}</span></div>
                  </div>
                  <div className="lc-content" dangerouslySetInnerHTML={{ __html: problem.description }} />
                </div>
              ) : (
                <div className="h-full flex flex-col animate-in zoom-in-95 duration-300">
                  <div onClick={() => hasVisualData && setShowFullBlueprint(true)} className={clsx("relative flex-1 bg-[#050505] rounded-lg border border-dark-700 overflow-hidden shadow-inner flex flex-col transition-colors", hasVisualData ? "cursor-pointer group hover:border-blue-500/50" : "cursor-default opacity-50")}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    {hasVisualData && (
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] z-20">
                        <div className="bg-black/80 px-4 py-2 rounded border border-blue-500 text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2"><Maximize2 size={16} /> Expand Diagram</div>
                        </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-400 font-mono uppercase tracking-widest z-10">Logic Flow</div>
                    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                       {hasVisualData ? (
                           <DataVisualizer type="Flowchart" data={problem.visualData} />
                       ) : (
                           <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">NO LOGIC DATA</div>
                       )}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-dark-900 border border-dark-700 rounded-lg flex gap-3 items-start">
                    <AlertTriangle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 font-mono">Logic Flow Diagram. Represents the step-by-step algorithmic solution.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="h-full flex items-center justify-center p-4 text-red-500 font-mono text-xs">NO_DATA_RECEIVED</div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showFullBlueprint && hasVisualData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-8" onClick={() => setShowFullBlueprint(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-blue-500 rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden">
              <div className="h-14 border-b border-dark-700 bg-dark-900 flex items-center justify-between px-6 shrink-0">
                <span className="font-mono text-blue-400 font-bold uppercase flex items-center gap-2"><Grid size={16} /> Solution Logic Flow</span>
                <button onClick={() => setShowFullBlueprint(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-auto p-12 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100 custom-scrollbar flex items-center justify-center">
                 <div className="w-full max-w-lg origin-center scale-110">
                    <DataVisualizer type="Flowchart" data={problem?.visualData} />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
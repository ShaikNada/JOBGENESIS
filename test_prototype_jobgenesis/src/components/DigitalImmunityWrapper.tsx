import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const socket = io(API_URL);

interface ImmunityWrapperProps {
  children: React.ReactNode;
}

export const DigitalImmunityWrapper: React.FC<ImmunityWrapperProps> = ({ children }) => {
  const [breachData, setBreachData] = useState<any>(null);

  useEffect(() => {
    socket.on('system-breach', (data) => {
      console.log('System Breach Detected!', data);
      setBreachData(data);
      
      // Auto-clear glitch after 15 seconds to return to normal
      setTimeout(() => setBreachData(null), 15000);
    });

    socket.on('new-gauntlet-level', (data) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-black/90 border border-[#b8ff2b] shadow-[0_0_15px_rgba(184,255,43,0.3)] rounded-lg pointer-events-auto flex`}>
              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1 font-mono">
                    <p className="text-sm font-black text-[#b8ff2b] uppercase tracking-widest border-b border-[#b8ff2b]/30 pb-2 mb-2">
                       ✨ System Healed
                    </p>
                    <p className="text-xs text-white/70">
                      New Gauntlet Level Auto-Generated: <br/><strong className="text-white mt-1 block">{data.title}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
        ), { duration: 8000 });
    });

    return () => {
      socket.off('system-breach');
      socket.off('new-gauntlet-level');
    };
  }, []);

  // Safe file name extraction
  const getFileName = (pathStr: string) => {
      if (!pathStr) return 'unknown';
      const parts = pathStr.split(/[\/\\]/);
      return parts[parts.length - 1];
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {breachData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ backdropFilter: 'invert(1) contrast(1.2)' }}
          >
            {/* Red overlay and scanlines */}
            <div className="absolute inset-0 bg-red-900/30 mix-blend-overlay"></div>
            <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)' }}></div>
            
            {/* Terminal Window */}
            <motion.div 
               initial={{ scale: 0.9, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-black/90 border border-red-500 rounded-lg p-8 max-w-4xl w-full mx-4 shadow-[0_0_50px_rgba(255,0,0,0.5)] font-mono"
            >
               <h2 className="text-red-500 text-3xl font-black uppercase mb-4 tracking-widest animate-pulse border-b border-red-500/50 pb-4">
                  ⚠️ System Compromise Detected
               </h2>
               
               <div className="text-red-400 mb-6 font-bold text-lg">
                  <span className="text-gray-500">{"["}INITIATING DIGITAL IMMUNE RESPONSE{"]"}</span><br/>
                  Analyzing Fault in <span className="text-white">{getFileName(breachData.file)}</span>...
               </div>
               
               <div className="bg-red-950 border border-red-500/30 p-4 rounded mb-6 text-xs text-red-300 whitespace-pre-wrap overflow-x-auto" style={{ textShadow: '0 0 5px rgba(255,0,0,0.5)' }}>
                  <div className="text-white font-bold mb-2">// FATAL EXCEPTION: {breachData.type} - {breachData.message}</div>
                  {breachData.snippet}
               </div>
               
               <div className="text-white/80">
                  <div className="text-[#b8ff2b] font-bold mb-2 uppercase tracking-wider">AI DIAGNOSIS & AST PATCH GENERATING...</div>
                  <div className="h-2 w-full bg-dark-700 rounded overflow-hidden border border-[#b8ff2b]/30">
                     <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-[#b8ff2b] shadow-[0_0_10px_#b8ff2b]"
                     />
                  </div>
                  <div className="text-right text-[10px] text-gray-500 mt-2 uppercase">Please standby. Auto-Reboot imminent.</div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StressHeartbeatProps {
    stressLevel: number; // 0 to 1
}

export const StressHeartbeat: React.FC<StressHeartbeatProps> = ({ stressLevel }) => {
    // Standard heartbeat path
    const path = "M0,20 L10,20 L15,0 L20,40 L25,20 L50,20";
    
    // Duration decreases as stress increases (faster heart)
    const duration = useMemo(() => 1.5 - (stressLevel * 1.2), [stressLevel]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-48 h-12 bg-black/40 border border-red-500/20 rounded overflow-hidden">
                {/* Horizontal scanline background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(239,68,68,0.05)_50%)] bg-[size:100%_4px]"></div>
                
                <svg viewBox="0 0 50 40" className="w-full h-full preserve-3d">
                    <motion.path
                        d={path}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                            pathLength: [0, 1, 1],
                            opacity: [0, 1, 0],
                            x: [0, 0, 50] 
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Shadow/Echo path */}
                    <motion.path
                        d={path}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1"
                        opacity={0.2}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                </svg>

                {/* Vertical scan wave */}
                <motion.div 
                    className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-red-500/80 to-transparent"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ duration: duration * 2, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <div className="flex justify-between w-full px-1">
                <span className="text-[8px] font-mono text-red-500/60 uppercase tracking-widest">ECG_SIGNAL_STABLE</span>
                <span className="text-[8px] font-mono text-red-500 font-bold">{Math.round(60 + (stressLevel * 120))} BPM</span>
            </div>
        </div>
    );
};

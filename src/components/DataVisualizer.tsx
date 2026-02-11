import { motion } from 'framer-motion';
import { ArrowDown, Play, CheckCircle2, AlertTriangle, Hexagon } from 'lucide-react';
import clsx from 'clsx';

interface FlowStep {
  type: 'start' | 'process' | 'decision' | 'end';
  label: string;
}

interface Props {
  type: string; 
  data: FlowStep[];
}

export const DataVisualizer = ({ type, data }: Props) => {
  const steps = Array.isArray(data) ? data : [];

  if (steps.length === 0) {
    return <div className="text-gray-500 text-xs italic p-4 text-center">Loading Blueprint...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start w-full py-6 space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="flex flex-col items-center relative w-full">
            
            {/* RENDER NODE */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={clsx(
                "relative z-10 flex flex-col items-center justify-center p-4 border transition-all hover:scale-105 hover:z-20",
                "min-w-[200px] max-w-[280px] min-h-[60px]", 
                step.type === 'start' && "bg-green-900/20 border-green-500/50 text-green-400 rounded-full",
                step.type === 'process' && "bg-dark-800 border-blue-500/50 text-blue-300 rounded-lg",
                step.type === 'decision' && "bg-yellow-900/20 border-yellow-500/50 text-yellow-400 rounded-md transform", 
                step.type === 'end' && "bg-red-900/20 border-red-500/50 text-red-400 rounded-full"
              )}
            >
              <div className="mb-2 opacity-80 text-white">
                {step.type === 'start' && <Play size={16} fill="currentColor" />}
                {step.type === 'process' && <Hexagon size={16} />}
                {step.type === 'decision' && <AlertTriangle size={16} />} 
                {step.type === 'end' && <CheckCircle2 size={16} />}
              </div>
              <span className="text-xs font-mono font-bold text-center leading-snug tracking-tight text-white z-50 break-words w-full shadow-sm">
                {step.label || "Processing..."}
              </span>
            </motion.div>

            {/* ARROW */}
            {!isLast && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 32, opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.1, duration: 0.3 }}
                className="w-px bg-gradient-to-b from-dark-600 to-dark-700 relative flex items-end justify-center"
              >
                 <ArrowDown size={14} className="text-dark-500 absolute -bottom-2" />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
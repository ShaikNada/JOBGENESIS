import { motion } from 'framer-motion';
import { RefreshCw, Download, Zap, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

interface Props {
  score: number;
  totalTime: number; // Seconds elapsed
  role: string;
  company: string;
  onRestart: () => void;
}

export const ResultsModal = ({ score, totalTime, role, company, onRestart }: Props) => {
  const [windowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [suggestion, setSuggestion] = useState<string>("Analyzing performance vectors...");

  // 1. Calculate Rank based on Score
  let rank = "F";
  let title = "Unverified";
  let color = "text-gray-500";
  let shadow = "rgba(100,100,100,0.2)";

  if (score >= 90) {
    rank = "S"; title = "Neural Architect"; color = "text-yellow-400"; shadow = "rgba(250, 204, 21, 0.5)";
  } else if (score >= 75) {
    rank = "A"; title = "Senior Engineer"; color = "text-neon-red"; shadow = "rgba(255, 0, 60, 0.5)";
  } else if (score >= 60) {
    rank = "B"; title = "System Maintainer"; color = "text-blue-400"; shadow = "rgba(96, 165, 250, 0.5)";
  } else if (score >= 40) {
    rank = "C"; title = "Junior Dev"; color = "text-green-400"; shadow = "rgba(74, 222, 128, 0.5)";
  }

  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  const timeStr = `${minutes}m ${seconds}s`;

  // 3. Persist Result to DB
  useEffect(() => {
    const saveResult = async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:4000/api/jobs/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            role,
            company,
            score,
            rank,
            feedback: `Candidate achieved ${rank} Rank in ${timeStr} for ${role} at ${company}.`
          })
        });
      } catch (err) {
        console.error("Failed to persist mission record", err);
      }
    };
    saveResult();

    // 4. Generate AI Suggestions
    const fetchSuggestions = async () => {
      try {
        const prompt = `Based on a score of ${score}/100 in a ${role} simulation at ${company} (Time: ${timeStr}), provide 1 specific technical improvement and 1 career strategy suggestion. Max 2 sentences total.`;
        const res = await fetch('http://localhost:4000/api/ai/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: prompt })
        });
        const data = await res.json();
        setSuggestion(data.summary || "High integrity maintained. Continue current optimization path.");
      } catch {
        setSuggestion("Technical data clear. Proceed to higher difficulty calibrations.");
      }
    };
    fetchSuggestions();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">

      {/* Victory Confetti for High Ranks */}
      {score >= 75 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#ff003c', '#ffffff', '#333']}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-dark-950 border border-neon-red/50 rounded-2xl relative overflow-hidden shadow-[0_0_100px_rgba(255,0,60,0.2)]"
      >
        {/* Background Tech Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#ff003c 1px, transparent 1px), linear-gradient(90deg, #ff003c 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Header */}
        <div className="relative z-10 bg-dark-900/80 p-8 text-center border-b border-neon-red/20">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-2">JobGenesis Verification Protocol</h2>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Mission Debrief</h1>
        </div>

        <div className="relative z-10 p-8 space-y-6">

          {/* RANK DISPLAY */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className={`text-9xl font-black ${color} drop-shadow-[0_0_30px_${shadow}] select-none`}
              >
                {rank}
              </motion.div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark-900 border border-neon-red px-3 py-1 rounded-full text-[10px] text-white font-mono uppercase tracking-widest">
                Rank Assigned
              </div>
            </div>

            <div className="text-center mt-6">
              <h3 className={`text-2xl font-bold ${color} uppercase tracking-widest`}>{title}</h3>
              <p className="text-gray-500 text-xs font-mono mt-1">Target Role: <span className="text-white">{role}</span></p>
            </div>
          </div>

          {/* AI SUGGESTION BOX */}
          <div className="bg-dark-900/80 p-5 rounded-xl border border-blue-500/20 text-center hover:border-blue-500/40 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.05)]">
            <div className="text-neon-blue text-[10px] uppercase mb-2 flex items-center justify-center gap-2 font-black tracking-widest">
              <Sparkles size={14} /> AI Optimization Suggestion
            </div>
            <p className="text-xs text-dark-300 italic px-4 leading-relaxed line-clamp-2">"{suggestion}"</p>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 text-center hover:border-neon-red/50 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase mb-1 flex items-center justify-center gap-1"><Zap size={12} /> Final Score</div>
              <div className="text-2xl font-mono font-bold text-white">{score}</div>
            </div>

            <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 text-center hover:border-neon-red/50 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase mb-1 flex items-center justify-center gap-1"><Clock size={12} /> Time Elapsed</div>
              <div className="text-2xl font-mono font-bold text-blue-400">{timeStr}</div>
            </div>

            <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 text-center hover:border-neon-red/50 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase mb-1 flex items-center justify-center gap-1"><ShieldAlert size={12} /> Integrity</div>
              <div className={`text-2xl font-mono font-bold ${score > 80 ? 'text-green-400' : 'text-red-500'}`}>{score > 80 ? "SECURE" : "COMPROMISED"}</div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4 border-t border-dark-800">
            <button className="flex-1 flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 text-white py-4 rounded-xl border border-dark-700 transition-all font-mono text-xs uppercase group">
              <Download size={16} className="group-hover:text-neon-red transition-colors" /> Export Asset
            </button>
            <button
              onClick={onRestart}
              className="flex-[2] flex items-center justify-center gap-2 bg-neon-red hover:bg-red-600 text-black font-black py-4 rounded-xl uppercase tracking-widest shadow-[0_0_20px_#ff003c] transition-all hover:scale-[1.02]"
            >
              <RefreshCw size={18} /> Restart Simulation
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle2, DollarSign, Briefcase, User, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OfferData {
  salary: string;
  equity: string;
  joiningBonus: string;
  managerQuote: string;
  team: string;
}

interface Props {
  data: OfferData;
  company: string;
  role: string;
  onClose: () => void;
}

export const OfferModal = ({ data, company, role, onClose }: Props) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.2} />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-dark-900 border border-green-500/50 rounded-2xl w-full max-w-2xl relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.2)]"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-green-900 to-dark-900 p-8 text-center border-b border-green-500/20 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">Offer Extended</h2>
          <p className="text-green-400 font-mono mt-2">Candidate Status: HIRED</p>
        </div>

        {/* Offer Details */}
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm uppercase tracking-widest">Official Offer For</p>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {role}
            </h1>
            <p className="text-xl text-white font-semibold">at {company}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <div className="text-gray-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><DollarSign size={12}/> Base Salary</div>
              <div className="text-xl font-bold text-white">{data.salary}</div>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <div className="text-gray-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><Award size={12}/> Equity / RSUs</div>
              <div className="text-xl font-bold text-purple-400">{data.equity}</div>
            </div>
            <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-center">
              <div className="text-gray-500 text-xs uppercase mb-1 flex items-center justify-center gap-1"><Briefcase size={12}/> Joining Bonus</div>
              <div className="text-xl font-bold text-green-400">{data.joiningBonus}</div>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl relative">
            <User className="absolute top-4 left-4 text-blue-500/50" size={24} />
            <p className="text-center text-blue-200 italic font-medium leading-relaxed">
              "{data.managerQuote}"
            </p>
            <p className="text-center text-blue-500/50 text-xs mt-3 uppercase font-bold">— Hiring Committee, {data.team}</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg hover:shadow-green-500/20"
          >
            Accept Offer & Start Career
          </button>
        </div>
      </motion.div>
    </div>
  );
};
import Webcam from "react-webcam";
import { useRef, useState } from "react";
import { useProctorAI } from "../hooks/useProctorAI";
import { ShieldAlert, ShieldCheck, Scan, Eye } from "lucide-react";
import clsx from "clsx";

interface Props {
  onStrike: (reason: string) => void;
}

export const SentinelCam = ({ onStrike }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const [violation, setViolation] = useState<string | null>(null);

  // Hook into the AI
  const { status, isModelLoading } = useProctorAI(webcamRef, (reason) => {
    setViolation(reason);
    onStrike(reason);
    
    // Clear violation visual after 3 seconds so it flashes
    setTimeout(() => setViolation(null), 3000);
  });

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border-2 border-dark-700 shadow-lg group">
      
      {/* THE CAMERA FEED */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
      />

      {/* CYBERPUNK OVERLAYS */}
      
      {/* 1. Scanning Line Animation */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(255,0,60,0.1)_50%,transparent_100%)] bg-[length:100%_200%] animate-scan-fast" />

      {/* 2. Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* 3. Status HUD (Top Left) */}
      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/80 px-2 py-1 rounded border border-white/10 backdrop-blur-md">
        {violation ? (
          <ShieldAlert className="text-neon-red animate-pulse" size={12} />
        ) : (
          <ShieldCheck className="text-green-500" size={12} />
        )}
        <span className={clsx("text-[10px] font-mono font-bold tracking-widest", violation ? "text-neon-red" : "text-green-500")}>
          {violation ? "INTEGRITY BREACH" : "SENTINEL ACTIVE"}
        </span>
      </div>

      {/* 4. AI Status Text (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full bg-black/90 py-1 px-2 border-t border-dark-700 flex justify-between items-center">
        <span className="text-[9px] text-gray-500 font-mono uppercase truncate max-w-[150px]">
          {status}
        </span>
        <Scan size={10} className="text-neon-red opacity-50" />
      </div>

      {/* 5. VIOLATION FLASH OVERLAY */}
      {violation && (
        <div className="absolute inset-0 bg-neon-red/20 border-4 border-neon-red animate-pulse flex items-center justify-center">
          <div className="bg-black/90 border border-neon-red px-4 py-2 rounded">
            <p className="text-neon-red font-black text-xs uppercase tracking-widest text-center">
              {violation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
import { useEffect, useState, useRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export const useProctorAI = (videoRef: React.RefObject<any>, onViolation: (reason: string) => void) => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [status, setStatus] = useState("Initializing Neural Net...");
  
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const detectionInterval = useRef<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🧠 Loading AI Model...");
        const model = await cocoSsd.load();
        modelRef.current = model;
        setIsModelLoading(false);
        setStatus("ACTIVE: SCANNING");
        console.log("✅ AI Vision Ready");
        startDetection();
      } catch (err) {
        console.error("❌ AI Load Error:", err);
      }
    };

    loadModel();

    return () => stopDetection();
  }, []);

  const startDetection = () => {
    detectionInterval.current = setInterval(async () => {
      if (!modelRef.current || !videoRef.current || !videoRef.current.video) return;

      const video = videoRef.current.video;
      
      if (video.readyState === 4) {
        // Detect objects
        const predictions = await modelRef.current.detect(video);
        
        // DEBUG: Log what the AI sees (Open Console F12 to see this)
        if (predictions.length > 0) {
           console.log("👁️ AI Sees:", predictions.map(p => p.class).join(', '));
        }

        let personCount = 0;
        let phoneDetected = false;

        predictions.forEach((pred) => {
          if (pred.class === 'person') personCount++;
          if (pred.class === 'cell phone') phoneDetected = true;
        });

        if (phoneDetected) {
          console.warn("🚨 PHONE DETECTED!");
          onViolation("UNAUTHORIZED DEVICE DETECTED");
        }

        if (personCount > 1) {
          console.warn("🚨 MULTIPLE PEOPLE DETECTED!");
          onViolation("MULTIPLE BIOSIGNATURES DETECTED");
        }
      }
    }, 1000); 
  };

  const stopDetection = () => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);
  };

  return { isModelLoading, status };
};
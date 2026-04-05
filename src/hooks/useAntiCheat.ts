import { useState, useEffect, useRef, useCallback } from 'react';

// src/hooks/useAntiCheat.ts
export const useAntiCheat = (onStrike?: (reason: string) => void) => {
  const [warnings, setWarnings] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  
  // Debounce to prevent rapid-fire duplicate strikes
  const lastStrikeTime = useRef<number>(0);
  
  // Keystroke cadence tracking
  const lastKeyTime = useRef<number>(Date.now());
  const keystrokeCount = useRef<number>(0);

  // Stable callback ref to avoid re-registering listeners
  const onStrikeRef = useRef(onStrike);
  useEffect(() => { onStrikeRef.current = onStrike; }, [onStrike]);

  const fireStrike = useCallback((reason: string) => {
    const now = Date.now();
    // Debounce: ignore strikes that fire within 3 seconds of each other
    if (now - lastStrikeTime.current < 3000) return;
    lastStrikeTime.current = now;

    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (onStrikeRef.current) onStrikeRef.current(reason);
      // Increase disqualification threshold to 5 for demo friendliness
      if (newWarnings >= 5) setDisqualified(true);
      return newWarnings;
    });
  }, []);

  useEffect(() => {
    // 1. Window Blur Detection (Clicking out of the tab)
    const handleBlur = () => {
      fireStrike('Tab switch detected');
    };

    // 2. Keystroke Cadence Monitoring (Copy/Paste detection)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;
      
      if (timeDiff < 10) { 
        keystrokeCount.current += 1;
      } else {
        keystrokeCount.current = 1;
      }

      // If more than 30 characters appear in under 10ms each, it's a massive paste
      if (keystrokeCount.current > 30) {
        keystrokeCount.current = 0;
        fireStrike('Unusual keystroke pattern detected');
      }

      lastKeyTime.current = now;
    };

    // Global Paste Event Listener
    const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text') || '';
        // Only flag very large pastes (100+ chars) to avoid false positives
        if (pastedText.length > 100) {
            fireStrike('Large text paste detected');
        }
    }

    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [fireStrike]);

  return { 
    warnings, 
    disqualified 
  };
};
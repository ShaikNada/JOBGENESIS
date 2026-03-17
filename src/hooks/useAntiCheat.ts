import { useState, useEffect, useRef } from 'react';

// src/hooks/useAntiCheat.ts
export const useAntiCheat = (onStrike?: (reason: string) => void) => {
  const [warnings, setWarnings] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  
  // Keystroke cadence tracking
  const lastKeyTime = useRef<number>(Date.now());
  const keystrokeCount = useRef<number>(0);
  const wpmHistory = useRef<number[]>([]);

  useEffect(() => {
    // 1. Window Blur Detection (Clicking out of the tab)
    const handleBlur = () => {
      setWarnings(prev => {
        const newWarnings = prev + 1;
        if (onStrike) onStrike('Tab Switch / Window Focus Lost');
        if (newWarnings >= 3) setDisqualified(true);
        return newWarnings;
      });
    };

    // 2. Keystroke Cadence Monitoring (Copy/Paste detection)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;
      
      // If keystrokes are impossibly fast (e.g., pasting block of text triggers many characters instantly)
      // Note: React/Browser sometimes bundles paste events, but rapid sequential keydowns also indicate script/macro
      if (timeDiff < 10) { 
        keystrokeCount.current += 1;
      } else {
        keystrokeCount.current = 1;
      }

      // If more than 30 characters appear in under 10ms each, it's a massive paste
      if (keystrokeCount.current > 30) {
        keystrokeCount.current = 0; // Reset
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (onStrike) onStrike('Unnatural Keystroke Cadence (Paste Detected)');
          if (newWarnings >= 3) setDisqualified(true);
          return newWarnings;
        });
      }

      lastKeyTime.current = now;
    };

    // Global Paste Event Listener
    const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text') || '';
        // If pasting more than 50 characters of code, flag it
        if (pastedText.length > 50) {
            setWarnings(prev => {
                const newWarnings = prev + 1;
                if (onStrike) onStrike('Unauthorized Code Paste Detected');
                if (newWarnings >= 3) setDisqualified(true);
                return newWarnings;
            });
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
  }, [onStrike]);

  return { 
    warnings, 
    disqualified 
  };
};
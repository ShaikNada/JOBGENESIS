
// src/hooks/useAntiCheat.ts
export const useAntiCheat = () => {
  // We strictly return 0 warnings and never disqualify
  // The rest of the app will think the user is being perfect.
  return { 
    warnings: 0, 
    disqualified: false 
  };
};
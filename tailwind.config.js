/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#050505", // Almost pure black
          900: "#0a0a0a",
          800: "#121212",
          700: "#1e1e1e"
        },
        neon: {
          red: "#ff003c",
          dim: "#7f001e",
          glow: "#ff003c", // For box-shadows
          blue: "#3b82f6",
          purple: "#a855f7",
          green: "#10b981"
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 3s infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: 0.99 },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: 0.4 },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
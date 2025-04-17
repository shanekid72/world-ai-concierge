
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "cyberpunk-pink": "#ff00cc",
        "cyberpunk-purple": "#9f00ff",
        "cyberpunk-blue": "#00ccff",
        "cyberpunk-green": "#00ff9f",
        "cyberpunk-yellow": "#ffcc00",
        "cyberpunk-bg": "#0a0a1a",
        "cyberpunk-dark": "#151528",
        "cyberpunk-darker": "#0f0f1b",
        "cyberpunk-gray": "#2a2a3a",
        "matrix-green": "#00ff41",
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        cyber: ["'Orbitron'", "sans-serif"],
      },
      animation: {
        pulseSlow: "pulse 3s infinite",
        flicker: "flicker 2s infinite",
        glitch: "glitch 1s infinite",
        scanline: "scanline 8s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 6px #ff00cc)",
          },
          "20%, 21.999%, 63%, 63.999%, 65%": {
            opacity: "0.4",
            filter: "none",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(90deg, rgba(40, 40, 60, 0.3) 1px, transparent 1px), linear-gradient(0deg, rgba(40, 40, 60, 0.3) 1px, transparent 1px)",
        "cyber-gradient": "linear-gradient(45deg, #0a0a1a 0%, #1a1a3a 100%)",
        "neon-glow": "radial-gradient(circle at center, rgba(255, 0, 255, 0.1) 0%, transparent 70%)",
      },
      boxShadow: {
        neon: "0 0 10px rgba(255, 0, 255, 0.7)",
        "neon-cyan": "0 0 10px rgba(0, 255, 255, 0.7)",
        "neon-strong": "0 0 20px rgba(255, 0, 255, 0.9)",
      },
      textShadow: {
        neon: "0 0 8px rgba(255, 0, 255, 0.8)",
        "neon-cyan": "0 0 8px rgba(0, 255, 255, 0.8)",
      },
    },
  },
  plugins: [],
};

export default config;

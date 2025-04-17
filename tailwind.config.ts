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
        "cyberpunk-purple": "#333399",
        "cyberpunk-bg": "#0f0c29",
        "worldapi-blue-50": "#e0f2fe",
        "worldapi-blue-100": "#bae6fd",
        "worldapi-blue-800": "#075985",
        "worldapi-teal-50": "#ccfbf1",
        "worldapi-teal-100": "#99f6e4",
        "worldapi-teal-600": "#0d9488",
      },
      fontFamily: {
        mono: ["'Fira Code'", "monospace"],
        cyber: ["'Orbitron'", "sans-serif"],
      },
      animation: {
        pulseSlow: "pulse 3s infinite",
        flicker: "flicker 2s infinite",
      },
      keyframes: {
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 100%": {
            opacity: 1,
            filter: "drop-shadow(0 0 6px #ff00cc)",
          },
          "20%, 21.999%, 63%, 63.999%, 65%": {
            opacity: 0.4,
            filter: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

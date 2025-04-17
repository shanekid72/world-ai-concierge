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

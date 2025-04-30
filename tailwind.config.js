/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0D0A2C',      // Dark background
        'cyber-darker': '#090720',     // Darker shade for contrast
        'cyber-primary': {
          from: '#581CA0',            // Primary gradient start
          to: '#371C9C',              // Primary gradient end
        },
        'cyber-heading': '#F2F0F4',    // Heading text color
        'cyber-body': '#DCD7E5',       // Body text color
        'cyber-card': '#120E35',       // Slightly lighter than background for cards
        'cyber-border': '#371C9C',     // Border color matching primary
        'cyber-accent': '#581CA0',     // Accent color for highlights
        'cyber-hover': '#6B21C8',      // Lighter purple for hover states
        'cyber-muted': '#9CA3AF',      // Muted text color
        'cyber-pink': '#FF00CC',       // Cyberpunk pink color for accents
        'cyber-blue': '#00FFFF',       // Cyberpunk blue color for accents
        'cyber-purple': '#8A2BE2',     // Cyberpunk purple color for gradients
        'cyber-yellow': '#FFD700',     // Cyberpunk yellow color
        'cyber-deep-teal': '#006466',  // Deep teal color
        'cyber-medium-teal': '#065A60', // Medium teal color
        'cyber-light-teal': '#7FFFD4',  // Light teal/cyan color
        'cyber-avatar-glow': '#0A1437',  // Avatar glow color
        'cyber-avatar-bg-from': '#065A60',  // Avatar gradient from color
        'cyber-avatar-bg-to': '#006466',    // Avatar gradient to color
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
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, var(--tw-gradient-from) 10%, var(--tw-gradient-to) 90%)',
        'avatar-gradient': 'linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'avatar-glow': '0 0 25px 5px',
        'neon': '0 0 10px var(--tw-shadow-color)',
      },
      fontFamily: {
        'cyber': ['Share Tech Mono', 'monospace'],
        'code': ['Fira Code', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { 
            boxShadow: '0 0 5px #581CA0, 0 0 10px #581CA0, 0 0 15px #581CA0, 0 0 20px #581CA0',
          },
          '50%': { 
            boxShadow: '0 0 2px #581CA0, 0 0 5px #581CA0, 0 0 10px #581CA0, 0 0 15px #581CA0',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} 
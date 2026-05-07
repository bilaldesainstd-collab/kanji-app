/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#050505",
        "neon-cyan": "#00f3ff",
        "neon-pink": "#ff00ff",
        "neon-yellow": "#fff200",
        "cyber-surface": "#0a0a0f",
        "cyber-border": "#1a1a2e",
      },
      boxShadow: {
        "neon-cyan": "0 0 8px rgba(0, 243, 255, 0.6), 0 0 20px rgba(0, 243, 255, 0.3)",
        "neon-pink": "0 0 8px rgba(255, 0, 255, 0.6), 0 0 20px rgba(255, 0, 255, 0.3)",
        "neon-yellow": "0 0 8px rgba(255, 242, 0, 0.6), 0 0 20px rgba(255, 242, 0, 0.3)",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        cyber: ['"Orbitron"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#8b5cf6", // Vibrant Violet
        "primary-hover": "#7c3aed",
        secondary: "#6366f1", // Indigo
        dark: {
          900: "#030712", // Deepest dark
          800: "#111827", // Lighter dark
          700: "#1f2937",
          600: "#374151",
        },
        accent: {
          cyan: "#06b6d4",
          pink: "#ec4899",
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-secondary': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .7, filter: 'brightness(1.5)' },
        }
      }
    },
  },
  plugins: [],
};

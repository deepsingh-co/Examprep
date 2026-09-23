/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#4f46e5", // Indigo 600
        "primary-hover": "#4338ca", // Indigo 700
        "primary-light": "#e0e7ff", // Indigo 100
        secondary: "#9333ea", // Purple 600
        "accent-cyan": "#06b6d4",
        "accent-pink": "#ec4899",
        surface: "#ffffff",
        background: "#f8fafc", // slate-50
        "glass-bg": "rgba(255, 255, 255, 0.75)",
        "glass-border": "rgba(255, 255, 255, 0.2)",
      },
      boxShadow: {
        subtle: "0 2px 4px 0 rgba(0, 0, 0, 0.02)",
        card: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
        premium: "0 25px 50px -12px rgba(99, 102, 241, 0.15)",
        glow: "0 0 20px rgba(99, 102, 241, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      }
    },
  },
  plugins: [],
};

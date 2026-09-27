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
        primary: "#F52B2B", // Classic PW Red
        "primary-hover": "#D32020", // Darker Red
        "primary-light": "#FDEAEA", // Very light red
        secondary: "#1E293B", // PW Dark Blue/Slate
        "accent-cyan": "#06b6d4",
        "accent-pink": "#ec4899",
        surface: "#ffffff",
        background: "#F3F4F6", // Gray 100
        "glass-bg": "rgba(255, 255, 255, 0.95)",
        "glass-border": "rgba(255, 255, 255, 0.2)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        glass: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        premium: "0 10px 25px -5px rgba(245, 43, 43, 0.15)",
        glow: "0 0 20px rgba(245, 43, 43, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6c63ff",
        "primary-hover": "#5a52d5",
        dark: {
          900: "#0a0a1a",
          800: "#1a1a2e",
          700: "#16213e",
          600: "#0f3460",
        },
        accent: "#e94560",
      },
    },
  },
  plugins: [],
};

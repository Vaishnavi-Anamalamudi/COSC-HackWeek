/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#0B1120",
          sidebar: "#111827",
          card: "#1F2937",
          accent: "#22C55E",
          text: "#F8FAFC",
        },
      },
      boxShadow: {
        studio: "0 24px 80px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

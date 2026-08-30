/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0F172A",
        accent: "#F97316",
      },
      fontFamily: {
        sriracha: ["Sriracha", "cursive"],
      },
    },
  },
  plugins: [],
}
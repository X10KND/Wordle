/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#121213",
        tile: "#3a3a3c",
        key: "#818384",
        present: "#b59f3b",
        correct: "#538d4e",
        absent: "#3a3a3c",
      },
    },
  },
  plugins: [],
};


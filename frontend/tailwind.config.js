/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f3faf6",
          100: "#def3e6",
          200: "#b8e6cd",
          300: "#86d3ac",
          400: "#52b887",
          500: "#2f9e6c",
          600: "#1f7f57",
          700: "#1a6548",
          800: "#17513c",
          900: "#134234",
        },
      },
    },
  },
  plugins: [],
};
/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a24",
          600: "#24243a",
          500: "#2e2e50",
          accent: "#7c3aed",
          hover:  "#6d28d9",
          soft:   "#ede9fe",
        },
        surface: {
          DEFAULT: "#16161f",
          raised:  "#1e1e2e",
          border:  "#2a2a3d",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}

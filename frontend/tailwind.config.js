/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cortex: {
          950:  "#0f1a09",
          900:  "#181816",
          800:  "#1c1c1a",
          700:  "#242422",
          600:  "#2c2c29",
          500:  "#363633",
          primary:   "#60d02b",
          hover:     "#3cb031",
          active:    "#1e6018",
          light:     "#b0e454",
          soft:      "#ecffd1",
          text:      "#f8f7f7",
          muted:     "#b4b4b4",
          subtle:    "#6b7280",
          border:    "#2c2c29",
          "border-light": "#3a3a37",
          success:   "#2ee638",
          warning:   "#f59e0b",
          danger:    "#ef4444",
          info:      "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in":     "fadeIn 0.3s ease-out",
        "slide-up":    "slideUp 0.3s ease-out",
        "pulse-soft":  "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#313131",
        mint: "#B6FF00",
        line: "#E5E5DF",
        panel: "#F4F4EF",
        tomato: "#D95D43"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(49,49,49,0.14)",
        glow: "0 0 0 6px rgba(182,255,0,0.18)"
      },
      fontFamily: {
        brand: ["var(--font-brand)"],
        sans: ["var(--font-body)"]
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)"],
        brand: ["var(--font-brand)"]
      },
      colors: {
        ink: "#343434",
        panel: "#f4f4ee",
        line: "#deded5",
        mint: "#b6ff00",
        tomato: "#ff4f2e",
        plum: "#1f1f1f"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(52, 52, 52, 0.12)",
        glow: "0 20px 55px rgba(182, 255, 0, 0.36)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        quran: ["var(--font-quran)", "serif"],
        naskh: ["var(--font-naskh)", "serif"],
        arabic: ["var(--font-arabic-ui)", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#1a1714",
          soft: "#4a4540",
          faint: "#8a847c",
        },
        parchment: {
          DEFAULT: "#faf7f0",
          deep: "#f3ede1",
          card: "#ffffff",
        },
        gold: {
          DEFAULT: "#a67c2e",
          soft: "#c9a24b",
        },
        sage: {
          DEFAULT: "#2f6b4f",
          soft: "#3f8a66",
        },
      },
    },
  },
  plugins: [],
};

export default config;

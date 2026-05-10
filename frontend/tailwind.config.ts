import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        canvas: "#0A0A0B",
        surface: "#111114",
        elevated: "#16161A",
        dim: "#1E1E26",
        mid: "#2D2D38",
        accent: "#E8D5A3",
        primary: "#F0EBE0",
        muted: "#8A8A9A",
        ghost: "#3D3D4D",
        hot: "#4ADE80",
        warm: "#FB923C",
        cold: "#93C5FD",
      },
    },
  },
  plugins: [],
};

export default config;

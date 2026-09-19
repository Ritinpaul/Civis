import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070709",
        surface: {
          1: "#0B0B0F",
          2: "#0F1015",
          3: "#14151B",
          hover: "#181A21",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.075)",
          strong: "rgba(255, 255, 255, 0.14)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
        primary: {
          DEFAULT: "#EDEDEF",
          secondary: "#8E8EA0",
          muted: "#52525B",
        },
        crimson: {
          DEFAULT: "#E5252A",
          muted: "rgba(229, 37, 42, 0.12)",
          border: "rgba(229, 37, 42, 0.3)",
          glow: "rgba(229, 37, 42, 0.25)",
        },
        emerald: {
          DEFAULT: "#10B981",
          muted: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        indigo: {
          DEFAULT: "#6366F1",
          muted: "rgba(99, 102, 241, 0.12)",
          border: "rgba(99, 102, 241, 0.3)",
          glow: "rgba(99, 102, 241, 0.25)",
        },
        purple: {
          DEFAULT: "#818CF8",
          muted: "rgba(129, 140, 248, 0.12)",
          border: "rgba(129, 140, 248, 0.3)",
          glow: "rgba(129, 140, 248, 0.25)",
        },
        amber: {
          DEFAULT: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.04)" },
        },
        edgeFlow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        radarScan: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        flashCrimson: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(229, 37, 42, 0.2)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "edge-flow": "edgeFlow 1.2s linear infinite",
        "radar-scan": "radarScan 4s linear infinite",
        "flash-crimson": "flashCrimson 0.6s ease-in-out 2",
      },
    },
  },
  plugins: [],
};

export default config;

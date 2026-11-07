import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        paper: "#f7f4ef",
        veto: "#d7263d",
        negotiate: "#e5a100",
        clear: "#1f7a4c",
        mute: "#6b6560",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(1.6) rotate(-12deg)", opacity: "0" },
          "60%": { transform: "scale(0.92) rotate(-6deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-6deg)", opacity: "1" },
        },
        rise: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        stamp: "stamp 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        rise: "rise 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

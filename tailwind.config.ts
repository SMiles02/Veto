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
        ink: "#0e1218",
        paper: "#f2f5f7",
        mist: "#d5dee6",
        veto: "#b91c1c",
        tide: "#0f766e",
        negotiate: "#c2410c",
        clear: "#047857",
        mute: "#5c6770",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      keyframes: {
        stamp: {
          "0%": {
            transform: "translateY(-56px) scale(1.4) rotate(-18deg)",
            opacity: "0",
          },
          "55%": {
            transform: "translateY(6px) scale(0.9) rotate(-7deg)",
            opacity: "1",
          },
          "72%": {
            transform: "translateY(-4px) scale(1.04) rotate(-4deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(0) scale(1) rotate(-6deg)",
            opacity: "1",
          },
        },
        rise: {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        heroIn: {
          "0%": { transform: "translateY(14px)" },
          "100%": { transform: "translateY(0)" },
        },
        drift: {
          "0%": { transform: "scale(1.08) translate3d(0,0,0)" },
          "100%": { transform: "scale(1) translate3d(0,-1.5%,0)" },
        },
      },
      animation: {
        stamp: "stamp 0.75s cubic-bezier(0.16, 0.9, 0.3, 1) forwards",
        rise: "rise 0.45s ease-out forwards",
        "hero-in": "heroIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        drift: "drift 18s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./UI/**/*.{js,ts,jsx,tsx,html}",
    "./UI/index.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        card: "#ffffff",
        "card-foreground": "#111827",
      },
      backgroundColor: {
        card: "#ffffff",
      },
      textColor: {
        "card-foreground": "#111827",
      },
      animation: {
        "bounce": "bounce 1s infinite",
      },
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-0.25rem)" },
        },
      },
    },
  },
  plugins: [],
};

export default config; 
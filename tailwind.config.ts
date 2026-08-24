import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gardin: {
          black: "#0b0b0c",
          panel: "#141416",
          border: "#26262a",
          gold: "#e8a628",
          goldLight: "#f4c14f",
          goldDark: "#b9821a",
          white: "#f5f5f5",
          muted: "#9a9a9f",
        },
        status: {
          gray: "#6b7280",
          yellow: "#d4a017",
          blue: "#2563eb",
          green: "#16a34a",
          red: "#dc2626",
          orange: "#ea580c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

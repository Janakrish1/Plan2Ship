import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        plc: {
          intro: "rgb(59 130 246)",
          growth: "rgb(34 197 94)",
          maturity: "rgb(168 85 247)",
          decline: "rgb(239 68 68)",
          newdev: "rgb(245 158 11)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

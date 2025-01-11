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
        // Define color variables for light mode
        light: {
          background: "#ffffff", // Light background
          foreground: "#000000", // Light foreground (text)
          primary: "#3b82f6", // Light primary color (blue)
          secondary: "#F54F0B", // Light secondary color (yellow)
          accent: "#eab308", // Light accent color (green)
          "secondary-disabled": "#fce7b2", // Light secondary-disabled color
        },
        // Define color variables for dark mode
        dark: {
          background: "#1f1f1f", // Dark background
          foreground: "#ffffff", // Dark foreground (text)
          primary: "#2563eb", // Dark primary color (blue)
          secondary: "#F54F0B", // Dark secondary color (yellow)
          accent: "#f59e0b", // Dark accent color (green)
          "secondary-disabled": "#7a5e27", // Dark secondary-disabled color
        },
      },
      fontFamily: {
        dancing: ["Dancing Script", "serif"],
        stix: ["STIX Two Text", "serif"],
      },
    },
    keyframes: {
      "fade-in": {
        "0%": { opacity: "0", transform: "translateY(-10px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      spin: {
        to: { transform: "rotate(360deg)" },
      },
    },
    animation: {
      "bounce-slow": "bounce 1s ease-in-out infinite",
      spin: "spin 1s linear infinite",
      "fade-in": "fade-in 0.5s ease-out",
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
  darkMode: "class",
};

export default config;

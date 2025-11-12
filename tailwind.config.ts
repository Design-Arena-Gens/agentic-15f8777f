import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff"
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#4b5563"
        }
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(37, 99, 235, 0.35)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;

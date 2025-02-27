import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgb(229 231 235 / 0.1)", // Subtle border
        input: "#2A2D3E", // Dark input background
        ring: "#4F46E5", // Primary accent
        background: {
          DEFAULT: "#1A1C2A", // Dark background
          secondary: "#2A2D3E", // Slightly lighter background
        },
        foreground: {
          DEFAULT: "#E5E7EB", // Light text
          secondary: "#9CA3AF", // Secondary text
        },
        muted: {
          DEFAULT: "#374151",
          foreground: "#9CA3AF",
        },
        "messenger-primary": "#4F46E5", // Primary accent
        "messenger-secondary": "#6366F1", // Secondary accent
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2A2D3E",
          foreground: "#E5E7EB",
        },
        popover: {
          DEFAULT: "#1A1C2A",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#2A2D3E",
          foreground: "#FFFFFF",
        },
        "status-online": '#10B981', // Success green
        "status-away": '#F59E0B', // Warning yellow
        "status-offline": '#6B7280', // Neutral gray
        accent: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        bold: "700",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "status-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "message-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "status-change": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "panel-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "status-pulse": "status-pulse 2s ease-in-out infinite",
        "message-in": "message-in 150ms ease-out",
        "status-change": "status-change 300ms ease-out",
        "panel-slide": "panel-slide 0.5s ease-out",
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
    fontSize: {
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "xl": ["1.25rem", { lineHeight: "1.75rem" }],
      "lg": ["1.125rem", { lineHeight: "1.75rem" }],
      "base": ["1rem", { lineHeight: "1.5rem" }],
      "sm": ["0.875rem", { lineHeight: "1.25rem" }],
      "xs": ["0.75rem", { lineHeight: "1rem" }],
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;

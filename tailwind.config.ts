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
        border: "#413C3C", // Black Olive
        input: "#454650", // Outer Space
        ring: "#3D505B", // Outer Space (accent)
        background: {
          DEFAULT: "#151A25", // Eerie Black
          secondary: "#454650", // Outer Space
        },
        foreground: { // Updated foreground colors for better contrast and accessibility
          DEFAULT: "#E0E0E0", // Light Gray
          secondary: "#9CA3AF", // Light Granite Gray
        },
        muted: {
          DEFAULT: "#413C3C", // Black Olive
          foreground: "#9CA3AF", // Light Granite Gray (updated)
        },
        "messenger-primary": "#3D505B", // Outer Space (accent)
        "messenger-secondary": "#5D6165", // Granite Gray
        primary: {
          DEFAULT: "#3D505B", // Outer Space (accent)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#454650", // Outer Space
          foreground: "#5D6165", // Granite Gray
        },
        popover: {
          DEFAULT: "#151A25", // Eerie Black
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#151A25", // Eerie Black
          foreground: "#FFFFFF",
        },
        "status-online": '#22C55E', // Live green for online status
        "status-away": '#F59E0B', // Orange for away status
        "status-offline": '#6B7280', // Neutral gray for offline status
      },
      fontFamily: {
        sans: ["Inter", "Roboto", ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        bold: "700",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
    },
    fontSize: {
      "3xl": "30px",
      "2xl": "24px",
      "xl": "20px",
      "base": "16px",
      "sm": "14px",
      "xs": "12px",
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;

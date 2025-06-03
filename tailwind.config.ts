import type { Config } from "tailwindcss";
import {heroui} from "@heroui/react";
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "dark_blue":"#081e25",
        "light_blue":"#8ab0e0",
        "light_blue-500":"#7dd5de",
        "modal_bg":"#212c30",
        "accent-blue": "#7dd5de",
        "text-dark": "#333333",
        "text-medium": "#666666",
        "text-light": "#ffffff",
        "bg-light": "#f4f4f4",
        "header-blue": "#2c5282",
        "success": "#4caf50",
        "warning": "#ff9800",
        "danger": "#f44336",
      },
      fontFamily: {
        sans: ['Helvetica', ...fontFamily.sans], 
      },
      animation: {
        'pulse': 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-opacity': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()]
};
export default config;

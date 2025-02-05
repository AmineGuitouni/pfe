import type { Config } from "tailwindcss";
import {heroui} from "@heroui/react";

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
        "blue_pfe":"#22577a",
        "dark_grey":"#27292f",
        "light_grey":"#8e92a2",
        "white_pfe":"#f6fafc"

      }
    },
  },
  darkMode: "class",
  plugins: [heroui()]
};
export default config;

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
        // UST colors (optional, for future branding)
        "ust-purple": "#4f2d7f",
        "ust-gray": "#6b7280",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // todas las páginas y layouts
    "./src/components/**/*.{js,ts,jsx,tsx}", // todos los componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

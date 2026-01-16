import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Для App Router
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3f51b5', // Синий из Figma
        secondary: '#e0e0e0', // Серый фон
      },
    },
  },
  plugins: [],
};
export default config;

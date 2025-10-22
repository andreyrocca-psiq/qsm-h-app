import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a69bd',
          dark: '#3c56a0',
          light: '#5d78d0',
        },
        secondary: {
          DEFAULT: '#6c757d',
          light: '#8a939c',
        },
        background: {
          light: '#f7f9fc',
          card: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#334155',
          foreground: '#fefdfb',
        },
        accent: {
          DEFAULT: '#0d9488',
          foreground: '#ffffff',
        },
        background: '#fefdfb',
        card: '#ffffff',
        'card-sand': '#f7f6f3',
        border: '#e2e8f0',
        muted: {
          DEFAULT: '#f7f6f3',
          foreground: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

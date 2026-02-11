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
        lukso: {
          pink: '#FF2975',
          purple: '#8E4EC6',
          blue: '#3070F0',
          dark: '#1A1A2E',
          darker: '#0F0F1A',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'lukso-gradient': 'linear-gradient(135deg, #FF2975 0%, #8E4EC6 50%, #3070F0 100%)',
      },
    },
  },
  plugins: [],
}
export default config
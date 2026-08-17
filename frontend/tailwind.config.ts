import type { Config } from 'tailwindcss'

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        offwhite: '#F8FAFC',
        amber: '#F5B301',
        amber2: '#FBBF24',
        emerald: '#10B981'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.25)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
} satisfies Config


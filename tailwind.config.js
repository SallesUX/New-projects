/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7C3AED',
          'purple-light': '#8B5CF6',
          'purple-pale': '#C4A4F5',
          green: '#059669',
          'green-dark': '#047857',
          'green-light': '#10B981',
          coral: '#DC2626',
          'coral-dark': '#B91C1C',
          'coral-light': '#EF4444',
          amber: '#D97706',
        },
        surface: {
          bg: '#EDE9FA',
          card: '#FFFFFF',
          50: '#F5F3FF',
          100: '#EDE9FA',
          200: '#DDD6FE',
          300: '#C4B5FD',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#9B8EC4',
          muted: '#B9AEDE',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(124,58,237,0.08)',
        'card-hover': '0 12px 40px rgba(124,58,237,0.14)',
        btn: '0 4px 16px rgba(124,58,237,0.30)',
        nav: '0 -4px 24px rgba(124,58,237,0.10)',
        header: '0 2px 16px rgba(124,58,237,0.08)',
      },
    },
  },
  plugins: [],
}

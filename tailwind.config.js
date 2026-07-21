/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#06B6D4",
        accent: "#14B8A6",
        background: "#F8FAFC",
        cards: "#FFFFFF",
        "primary-text": "#0F172A",
        "secondary-text": "#64748B",
        border: "#E2E8F0",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '20': '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'premium': '0 12px 24px -10px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.02)',
      }
    },
  },
  plugins: [],
}

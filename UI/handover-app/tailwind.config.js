/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          deep: '#1D4ED8',
          soft: '#DBEAFE',
        },
        amber: {
          text: '#B45309',
          soft: '#FFFBEB',
        },
        ink: {
          DEFAULT: '#1F2937',
          soft: '#4B5563',
          faint: '#6B7280',
          mute: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 0 0 1px rgba(15,23,42,.04)',
      },
      keyframes: {
        amberBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        recPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37,99,235,0)' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pop: {
          from: { transform: 'scale(.92)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        amberBlink: 'amberBlink 1.6s ease-in-out infinite',
        recPulse: 'recPulse 1.2s ease-in-out infinite',
        fade: 'fade .2s ease',
        pop: 'pop .25s cubic-bezier(.18,.9,.32,1.28)',
      },
    },
  },
  plugins: [],
};

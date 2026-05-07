/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B4F72', light: '#2E6B9E', dark: '#133755' },
        accent:  { DEFAULT: '#2E86C1', light: '#5BA3D4', dark: '#1A6FA8' },
        success: { DEFAULT: '#1E8449', light: '#27AE60' },
        warning: { DEFAULT: '#E67E22', light: '#F39C12' },
        danger:  { DEFAULT: '#C0392B', light: '#E74C3C' },
        surface: '#FFFFFF',
        muted:   '#F4F6F9',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 4px rgba(0,0,0,0.08)',
        modal: '0 4px 24px rgba(0,0,0,0.14)',
      },
      borderRadius: { card: '10px', btn: '7px' },
      animation: {
        'fade-in':    'fadeIn 0.25s ease both',
        'slide-in-u': 'slideInUp 0.3s cubic-bezier(.22,1,.36,1) both',
        'scale-in':   'scaleIn 0.2s cubic-bezier(.22,1,.36,1) both',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideInUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:   { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      fontWeight: { '700': '700', '800': '800' },
    },
  },
  plugins: [],
}

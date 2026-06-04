/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gold':           '#C5A059',
        'gold-light':     '#D4AF37',
        'gold-dark':      '#B8860B',
        'surface':        '#f9f9f9',
        'on-surface':     '#1a1c1c',
        'on-surface-var': '#444748',
      },
      fontFamily: {
        display:  ['"Playfair Display"', 'Georgia', 'serif'],
        sans:     ['Inter', 'system-ui', 'sans-serif'],
        serif:    ['"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        kenburns: {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.12)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(197,160,89,0.25)' },
          '50%':     { boxShadow: '0 0 0 14px rgba(197,160,89,0)' },
        },
        scrollLine: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(300%)', opacity: '0' },
        },
      },
      animation: {
        marquee:     'marquee 40s linear infinite',
        kenburns:    'kenburns 30s ease-out infinite alternate',
        'fade-up':   'fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) forwards',
        'pulse-gold':'pulseGold 3s infinite',
        scrollLine:  'scrollLine 2s ease-in-out infinite',
      },
      transitionDuration: {
        350:  '350ms',
        400:  '400ms',
        600:  '600ms',
        800:  '800ms',
        1000: '1000ms',
        1500: '1500ms',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

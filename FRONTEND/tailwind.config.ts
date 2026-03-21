import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rust: '#4a0e10',
        clot: '#8f1117',
        marrow: '#d22b2b',
        soot: '#070707',
        fog: '#111214',
        steel: '#24262b',
      },
      boxShadow: {
        lumen: '0 0 40px rgba(210, 43, 43, 0.25)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      animation: {
        flicker: 'flicker 6s linear infinite',
        pulseSlow: 'pulseSlow 3.2s ease-in-out infinite',
        glitch: 'glitch 2.8s steps(2, end) infinite',
        scan: 'scan 12s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.92' },
          '8%': { opacity: '0.8' },
          '10%': { opacity: '0.96' },
          '26%': { opacity: '0.78' },
          '28%': { opacity: '0.93' },
          '62%': { opacity: '0.84' },
          '64%': { opacity: '0.98' },
        },
        pulseSlow: {
          '0%, 100%': { transform: 'scaleX(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scaleX(0.985)', filter: 'brightness(1.18)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-1px, 1px)' },
          '20%': { transform: 'translate(1px, -1px)' },
          '30%': { transform: 'translate(-2px, 0)' },
          '40%': { transform: 'translate(2px, 1px)' },
          '50%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-10%)' },
          '100%': { transform: 'translateY(110%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

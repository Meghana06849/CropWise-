/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crop: {
          50: '#f3fbf3',
          100: '#e4f6e6',
          200: '#c7eacb',
          300: '#9fd7a8',
          400: '#6fbc79',
          500: '#3f9c53',
          600: '#2f8244',
          700: '#256836',
          800: '#1d522c',
          900: '#173f22'
        }
      },
      boxShadow: {
        glow: '0 24px 80px rgba(47, 130, 68, 0.18)'
      },
      backgroundImage: {
        'crop-gradient': 'linear-gradient(135deg, rgba(19, 56, 25, 0.96), rgba(41, 115, 57, 0.92) 45%, rgba(120, 174, 86, 0.88))'
      }
    }
  },
  plugins: []
};

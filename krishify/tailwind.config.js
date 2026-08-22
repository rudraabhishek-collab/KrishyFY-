/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(142, 72%, 29%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(142, 60%, 40%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(20, 14.3%, 4.1%)',
        muted: {
          DEFAULT: 'hsl(60, 4.8%, 95.9%)',
          foreground: 'hsl(25, 5.3%, 44.7%)',
        },
        border: 'hsl(20, 5.9%, 90%)',
      },
    },
  },
  plugins: [],
}

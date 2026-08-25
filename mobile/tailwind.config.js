/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        'primary-hover': '#20bd5a',
        danger: '#f43f5e',
        'dark-bg': '#0c0a09',
        'dark-card': '#1c1917',
        'dark-card-hover': '#292524',
        'dark-border': '#44403c',
      },
    },
  },
  plugins: [],
};

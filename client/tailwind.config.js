module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tunisia: {
          red: '#E70013',
          white: '#FFFFFF',
          green: '#00A651',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
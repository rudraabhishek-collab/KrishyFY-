module.exports = {
  plugins: {
    tailwindcss: function() {
      return {
        adaptToTailwindCss4: true,
      }
    },
    autoprefixer: {
      flexbox: true,
    },
  },
}
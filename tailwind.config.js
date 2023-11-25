/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./index.html","./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
      backgroundImage: theme => ({
         'purple-gradient': 'linear-gradient(to bottom, #442661, #662b49)',
      })
    }  },
  plugins: [],
}


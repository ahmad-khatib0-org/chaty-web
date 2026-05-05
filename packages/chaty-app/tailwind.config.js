// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        ripple: 'ripple 0.6s linear',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 0.5 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
      },
    },
  },
}

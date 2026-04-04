import type { Config } from "tailwindcss"

export default {
  content: ["./src/renderer/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        skydesk: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#00a884",
          600: "#008069",
          700: "#075e54",
          800: "#064e3b",
          900: "#022c22",
        },
        wa: {
          green: "#25d366",
          teal: "#075e54",
          "bubble-out": "#d9fdd3",
          "bubble-in": "#ffffff",
          "bg-chat": "#efeae2",
          "bg-sidebar": "#ffffff",
          "bg-dark": "#111b21",
          "bg-dark-sidebar": "#202c33",
          "bg-dark-chat": "#0b141a",
          "bubble-dark-out": "#005c4b",
          "bubble-dark-in": "#202c33",
        },
      },
    },
  },
  plugins: [],
} satisfies Config

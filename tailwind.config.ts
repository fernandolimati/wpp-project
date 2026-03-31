import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        wp: {
          green: '#00a884',
          'green-dark': '#008069',
          'green-light': '#25d366',
          teal: '#075e54',
          bg: '#efeae2',
          'sidebar-bg': '#ffffff',
          header: '#f0f2f5',
          'bubble-out': '#d9fdd3',
          'bubble-in': '#ffffff',
          'input-bg': '#f0f2f5',
          border: '#e9edef',
          'text-primary': '#111b21',
          'text-secondary': '#667781',
          'dark-bg': '#0b141a',
          'dark-sidebar': '#111b21',
          'dark-header': '#202c33',
          'dark-bubble-out': '#005c4b',
          'dark-bubble-in': '#202c33',
          'dark-input': '#2a3942',
          'dark-border': '#313d45'
        }
      }
    }
  },
  plugins: []
}

export default config

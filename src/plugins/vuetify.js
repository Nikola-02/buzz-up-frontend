// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#f0f2f5',
          surface: '#ffffff',
          primary: '#0f3460',
          secondary: '#1a1a2e',
          accent: '#ffc107',
          error: '#e53935',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#18191a',
          surface: '#242526',
          primary: '#ffc107',
          secondary: '#e4e6eb',
          accent: '#ffc107',
          error: '#e53935',
        },
      },
    },
  },
})

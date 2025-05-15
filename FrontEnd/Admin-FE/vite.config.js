import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/x-date-pickers/AdapterDateFns',
      '@mui/x-date-pickers/DateTimePicker',
      '@mui/x-date-pickers/LocalizationProvider',
      '@mui/icons-material/Search',
      '@mui/icons-material/Refresh',
      '@mui/icons-material/Cloud',
      '@mui/icons-material/Warning'
    ]
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
})

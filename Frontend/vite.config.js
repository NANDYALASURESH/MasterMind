import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      filter: /\.(js|jsx|ts|tsx)$/,
      babelConfig: {
        presets: [],
        plugins: [
          ["styled-jsx/babel", { "sourceMaps": true, "vendorPrefixes": true }]
        ]
      }
    })
  ],
})

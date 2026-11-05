import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode, command }) => {
  const env = loadEnv(mode, '.', '')
  const localApi = (env.VITE_DEV_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
  const productionApi = (env.VITE_PRODUCTION_API_URL || 'https://coderise-academy-backend667-1.onrender.com').replace(/\/+$/, '')
  let apiTarget = localApi

  // The browser always uses same-origin /api. During local development, prefer
  // the local backend when it is ready and fall back to Render when it is not.
  if (command === 'serve') {
    try {
      const response = await fetch(`${localApi}/health/ready`, { signal: AbortSignal.timeout(1000) })
      if (!response.ok) apiTarget = productionApi
    } catch {
      apiTarget = productionApi
    }
    console.info(`[vite] API proxy target: ${apiTarget}`)
  }

  const proxyFor = (target) => ({
    '/api': {
      target,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api(?=\/|$)/, '') || '/',
    },
  })

  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      // Local development picks the local backend when healthy, then falls back to Render.
      proxy: proxyFor(apiTarget),
    },
    preview: {
      // `vite preview` serves a production build locally, so send its API calls to Render.
      // Actual Vercel deployments use the equivalent external rewrite in vercel.json.
      proxy: proxyFor(productionApi),
    },
  }
})

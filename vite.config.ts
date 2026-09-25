import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-32x32.png',
          'favicon-16x16.png',
          'apple-touch-icon.png',
          'icon.svg',
          'icon-maskable.svg',
          'logo.svg',
          'logo.png',
          'grafico_funciones_1024x500_listo.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Mesa & Dominó - Anotador de Puntos',
          short_name: 'Mesa & Dominó',
          description: 'Mesa & Dominó: Anotador de puntos con control rápido y automático para tus partidas.',
          theme_color: '#1c1917',
          background_color: '#1c1917',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'es',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
          screenshots: [
            {
              src: '/grafico_funciones_1024x500_listo.png',
              sizes: '1024x500',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Mesa & Dominó - Anotador de Puntos',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_YOUTUBE_API_KEY': JSON.stringify(
        process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || ''
      ),
      'process.env.YOUTUBE_API_KEY': JSON.stringify(
        process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || ''
      ),
      'process.env.VITE_YOUTUBE_API_KEY': JSON.stringify(
        process.env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || ''
      ),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

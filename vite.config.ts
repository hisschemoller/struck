/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: './',
  plugins: [
    VitePWA({
      devOptions: {
        enabled: false,
      },
      includeAssets: ['struck-icon.svg', 'struck-icon-180.png'],
      manifest: {
        name: 'Struck',
        short_name: 'Struck',
        description: 'Percussive action with 3D physics.',
        theme_color: '#3778AF',
        icons: [
          {
            src: 'struck-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'struck-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      registerType: 'autoUpdate',
    }),
  ],
});

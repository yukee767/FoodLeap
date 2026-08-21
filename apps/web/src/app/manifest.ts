import type { MetadataRoute } from 'next';

/**
 * Next.js 15 dynamic manifest route
 * Gera /manifest.webmanifest automaticamente.
 * Mantido em sincronia com public/manifest.webmanifest (fallback estático).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FoodLeap',
    short_name: 'FoodLeap',
    description: 'Receitas diárias personalizadas e dieta integrada sem restrições malucas.',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'browser'],
    orientation: 'any',
    scope: '/',
    start_url: '/?source=pwa',
    id: '/',
    theme_color: '#ff6b00',
    background_color: '#FFFBF5',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['food', 'lifestyle', 'health'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Receitas',
        short_name: 'Receitas',
        description: 'Explorar receitas do dia',
        url: '/receitas?source=pwa-shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Minha Dieta',
        short_name: 'Dieta',
        description: 'Ver plano alimentar personalizado',
        url: '/dieta?source=pwa-shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Ocasiões',
        short_name: 'Ocasiões',
        description: 'Receitas por ocasião',
        url: '/ocasioes?source=pwa-shortcut',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
    screenshots: [
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'wide',
        label: 'FoodLeap - Home',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'FoodLeap - Mobile',
      },
    ],
    prefer_related_applications: false,
    // launch_handler (PWA 2025) - não tipado ainda no MetadataRoute, injetado via spread para evitar erro TS
    ...({ launch_handler: { client_mode: ['navigate-existing', 'auto'] } } as unknown as Record<
      string,
      unknown
    >),
  };
}

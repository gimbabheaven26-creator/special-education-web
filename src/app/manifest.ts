import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '이음진',
    short_name: '이음진',
    description: '용어에서 개념, 기출, AI 동형문제까지 이어지는 특수교육 임용 수험지',
    start_url: '/',
    display: 'standalone',
    background_color: '#101214',
    theme_color: '#101214',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

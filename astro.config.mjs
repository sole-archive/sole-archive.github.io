import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://sole-archive.github.io', // GitHub user page URL
  base: '/', // root base path because user page
  trailingSlash: 'never',
  build: {
    assets: 'assets'
  }
});

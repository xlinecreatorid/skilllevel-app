import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'serve' && {
      name: 'skilllevel-ai-proxy',
      async configureServer(server) {
        try {
          const { readAiEnv, loadEnv } = await import('./server/env.js');
          const { createAiHandler } = await import('./server/handler.js');
          loadEnv(process.cwd());
          const config = readAiEnv(process.env);
          const handle = createAiHandler(config, { logger: server.config.logger });
          server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/api/ai/')) return next();
            handle(req, res).catch(next);
          });
        } catch (e) {
          server.config.logger.error('Failed to initialize dev AI proxy: ' + e.message);
        }
      },
    },
  ].filter(Boolean),
  server: {
    port: process.env.FIGMA ? Number(process.env.PORT) : 5173,
    host: process.env.FIGMA ? (process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0') : undefined,
    strictPort: Boolean(process.env.FIGMA),
  },
  build: { outDir: 'dist', sourcemap: false },
}));

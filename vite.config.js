import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv, readAiEnv } from './server/env.js';
import { createAiHandler } from './server/handler.js';

loadEnv(process.cwd());

function aiProxyPlugin() {
  return {
    name: 'skilllevel-ai-proxy',
    configureServer(server) {
      const config = readAiEnv(process.env);
      const handle = createAiHandler(config, { logger: server.config.logger });
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/ai/')) return next();
        handle(req, res).catch(next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), aiProxyPlugin()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: false },
});

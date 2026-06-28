import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const query: Record<string, string> = {};
              urlObj.searchParams.forEach((value, key) => {
                query[key] = value;
              });

              (req as any).query = query;

              const patchedRes = res as any;
              patchedRes.status = (code: number) => {
                patchedRes.statusCode = code;
                return patchedRes;
              };
              patchedRes.json = (data: any) => {
                patchedRes.setHeader('Content-Type', 'application/json');
                patchedRes.end(JSON.stringify(data));
                return patchedRes;
              };

              try {
                const { handleProjects, handleInternship, handleProjectIdStandard } = await server.ssrLoadModule('/lib/server/handler.ts');
                
                if (urlObj.pathname === '/api/projects') {
                  await handleProjects(req, patchedRes);
                  return;
                } else if (urlObj.pathname === '/api/internship') {
                  await handleInternship(req, patchedRes);
                  return;
                } else if (urlObj.pathname === '/api/project-id-standard') {
                  await handleProjectIdStandard(req, patchedRes);
                  return;
                }
              } catch (err: any) {
                console.error('[Vite Dev API Proxy Error]', err);
                patchedRes.status(500).json({ success: false, error: err.message || String(err) });
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

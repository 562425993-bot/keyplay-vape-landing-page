import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import { defineConfig, loadEnv } from 'vite';

/** 开发/预览时从 replacement-images/6321.18 提供 360 帧，避免复制到 public。正式部署请把该目录拷到 dist 的 images/product-360 或使用 CDN。 */
function product360FramesPlugin(): {
  name: string;
  configureServer: (server: { middlewares: Connect.Server }) => void;
  configurePreviewServer: (server: { middlewares: Connect.Server }) => void;
} {
  const framesDir = path.resolve(process.cwd(), 'replacement-images', '6321.18');
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const raw = req.url?.split('?')[0] ?? '';
    const base = '/keyplay';
    const pathOnly =
      raw === base || raw.startsWith(`${base}/`) ? (raw.slice(base.length) || '/') : raw;
    if (!pathOnly.startsWith('/images/product-360/')) {
      next();
      return;
    }
    const name = path.basename(pathOnly);
    if (!/^\d+_\d+\.png$/i.test(name)) {
      res.statusCode = 400;
      res.end();
      return;
    }
    const filePath = path.join(framesDir, name);
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(filePath).pipe(res);
  };
  return {
    name: 'product-360-frames',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/**
 * 开发/预览：replacement-images/详情切图 - 副本/05咔哒/动画帧（01.jpg…）
 * → /keyplay/local-clack-joy-frames/NN.jpg
 * 若无该目录则回退到 …/02功能/03
 */
function findClackJoyReplacementFramesDir(): string | null {
  const base = path.resolve(process.cwd(), 'replacement-images');
  if (!fs.existsSync(base)) return null;
  const preferred = path.join(
    base,
    `\u8be6\u60c5\u5207\u56fe - \u526f\u672c`,
    `05\u5494\u54d2`,
    `\u52a8\u753b\u5e27`,
  );
  if (fs.existsSync(preferred) && fs.statSync(preferred).isDirectory()) {
    const files = fs.readdirSync(preferred).filter((n) => /^\d+\.(jpe?g|png)$/i.test(n));
    if (files.length > 0) return preferred;
  }
  const folder02Func = `02\u529f\u80fd`; // 02功能
  const walk = (dir: string, depth: number): string | null => {
    if (depth > 14) return null;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      if (e.name === folder02Func) {
        const d03 = path.join(full, '03');
        if (fs.existsSync(d03) && fs.statSync(d03).isDirectory()) {
          const files = fs.readdirSync(d03).filter((n) => /^\d+\.(jpe?g|png)$/i.test(n));
          if (files.length > 0) return d03;
        }
      }
      const found = walk(full, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(base, 0);
}

function localClackJoyFramesPlugin(): {
  name: string;
  configureServer: (server: { middlewares: Connect.Server }) => void;
  configurePreviewServer: (server: { middlewares: Connect.Server }) => void;
} {
  const framesDir = findClackJoyReplacementFramesDir();
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!framesDir) {
      next();
      return;
    }
    const raw = req.url?.split('?')[0] ?? '';
    const base = '/keyplay';
    const pathOnly =
      raw === base || raw.startsWith(`${base}/`) ? (raw.slice(base.length) || '/') : raw;
    if (!pathOnly.startsWith('/local-clack-joy-frames/')) {
      next();
      return;
    }
    const name = path.basename(pathOnly);
    if (!/^\d{1,3}\.(jpe?g|png)$/i.test(name)) {
      res.statusCode = 400;
      res.end();
      return;
    }
    const filePath = path.join(framesDir, name);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end();
      return;
    }
    const ext = path.extname(name).toLowerCase();
    res.setHeader('Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(filePath).pipe(res);
  };
  return {
    name: 'local-clack-joy-frames',
    configureServer(server) {
      if (framesDir) {
        console.info(`[vite] CLACK JOY 本地动画帧: ${framesDir}`);
      }
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/** 开发/预览：访问 / 时 302 到 /keyplay/，避免 base 子路径下误开根地址导致空白或资源错路径。 */
function devRootRedirectToBasePlugin(): {
  name: string;
  configureServer: (server: { middlewares: Connect.Server }) => void;
  configurePreviewServer: (server: { middlewares: Connect.Server }) => void;
} {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const raw = req.url ?? '';
    const pathOnly = raw.split('?')[0] ?? '';
    const method = req.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      next();
      return;
    }
    if (pathOnly !== '/' && pathOnly !== '') {
      next();
      return;
    }
    const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
    res.statusCode = 302;
    res.setHeader('Location', `/keyplay/${search}`);
    res.end();
  };
  return {
    name: 'dev-root-redirect-to-base',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  /** 本地开发仍用 /keyplay/；Vercel 等生产环境挂在域名根路径，必须用 / 否则资源 404 白屏 */
  const base = mode === 'production' ? '/' : '/keyplay/';
  return {
    base,
    plugins: [
      devRootRedirectToBasePlugin(),
      react(),
      tailwindcss(),
      product360FramesPlugin(),
      localClackJoyFramesPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/keyplay.js',
          chunkFileNames: 'assets/chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) return 'assets/keyplay.css';
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd()),
      },
    },
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      /** 启动 dev 时自动打开带 base 的地址，减少“打不开”误操作 */
      open: '/keyplay/',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

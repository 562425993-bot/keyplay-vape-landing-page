/**
 * 构建后检查：ZIP 若只有 index.html + assets/*.js|css 而没有 images/videos，
 * 线上会出现 404、闪屏、视频不播、360 空白——不是动画代码单独坏了。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const images = path.join(dist, 'images');
const videos = path.join(dist, 'videos');
const frames360 = path.join(images, 'product-360');

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function countPng(dir) {
  if (!exists(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith('.png')).length;
}

if (!exists(dist)) {
  console.error('[keyplay-deploy] dist 目录不存在，请先执行 vite build');
  process.exit(1);
}

const problems = [];
if (!exists(images)) problems.push('缺少 dist/images/（应来自 public/images 或构建后手动复制）');
if (!exists(videos)) problems.push('缺少 dist/videos/（应来自 public/videos 或构建后手动复制）');
const n360 = countPng(frames360);
if (n360 < 10) {
  problems.push(
    `dist/images/product-360/ 下 PNG 过少（当前 ${n360}）。360 展示需要 19×36 帧或你实际打包的帧；开发时可用 replacement-images/6321.18 拷入该目录。`,
  );
}

if (problems.length) {
  console.error('\n======== KEYPLAY 部署包不完整 ========');
  problems.forEach((p) => console.error(' - ', p));
  console.error('\n正确做法：');
  console.error('  1) 把所有静态资源按 URL 结构放进 public/images、public/videos（与代码中路径一致），再 npm run build；或');
  console.error('  2) npm run build 后，将完整 images、videos 文件夹复制到 dist/ 再打 ZIP。');
  console.error('纯 dist（仅 keyplay.js + keyplay.css + index.html）在服务器上必然大量 404。\n');
  process.exit(1);
}

console.log('[keyplay-deploy] dist 内已检测到 images/、videos/ 与 product-360 帧，可打 ZIP。');

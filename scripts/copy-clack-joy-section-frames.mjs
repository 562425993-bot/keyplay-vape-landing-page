/**
 * 将 replacement-images/详情切图 - 副本/05咔哒/动画帧 的前 16 帧复制到
 * public/images/clack-joy-section-frames/，供生产构建大区块背景（与卡片 hover 的 clack-joy-frames 区分）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const preferred = path.join(
  root,
  'replacement-images',
  '\u8be6\u60c5\u5207\u56fe - \u526f\u672c',
  '05\u5494\u54d2',
  '\u52a8\u753b\u5e27',
);
const dst = path.join(root, 'public', 'images', 'clack-joy-section-frames');

if (!fs.existsSync(preferred) || !fs.statSync(preferred).isDirectory()) {
  console.warn('[copy-clack-joy-section-frames] 未找到源目录，跳过复制');
  console.warn('  期望路径:', preferred);
  process.exit(0);
}

fs.mkdirSync(dst, { recursive: true });
let ok = 0;
for (let i = 1; i <= 16; i += 1) {
  const pad = String(i).padStart(2, '0');
  const candidates = [`${pad}.jpg`, `${pad}.jpeg`, `${pad}.png`, `${pad}.JPG`, `${pad}.JPEG`, `${pad}.PNG`];
  let copied = false;
  for (const name of candidates) {
    const sp = path.join(preferred, name);
    if (!fs.existsSync(sp)) continue;
    const lower = name.toLowerCase();
    const outName = lower.endsWith('.jpeg') ? `${pad}.jpg` : lower.endsWith('.png') ? `${pad}.png` : `${pad}.jpg`;
    fs.copyFileSync(sp, path.join(dst, outName));
    copied = true;
    ok += 1;
    break;
  }
  if (!copied) console.error('[copy-clack-joy-section-frames] 缺少帧:', pad);
}

console.log(`[copy-clack-joy-section-frames] 已复制 ${ok}/16 帧 → public/images/clack-joy-section-frames/`);

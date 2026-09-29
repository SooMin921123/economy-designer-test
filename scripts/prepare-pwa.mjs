import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'source', 'economy-designer-4.3.1.html');
const OUT = path.join(ROOT, 'public');

const html = await fs.readFile(SOURCE, 'utf8');
if (!html.includes("const BUILD='4.3.1-recovery.1'")) {
  throw new Error('Expected Economy Designer build 4.3.1-recovery.1 was not found.');
}
if (!html.includes("STORE='econverse431-guarded'")) {
  throw new Error('Expected localStorage key econverse431-guarded was not found.');
}

await fs.mkdir(OUT, { recursive: true });

const pwaHead = '<link rel="manifest" href="./manifest.webmanifest"><link rel="apple-touch-icon" href="./icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes">';
const index = html.includes('rel="manifest"')
  ? html
  : html.replace('</head>', pwaHead + '</head>');
await fs.writeFile(path.join(OUT, 'index.html'), index, 'utf8');

const swMatch = html.match(/const SW_CODE=`([\s\S]*?)`;\s*function iconPNG/);
if (!swMatch) throw new Error('SW_CODE could not be extracted from the 4.3.1 source.');
await fs.writeFile(path.join(OUT, 'sw.js'), swMatch[1], 'utf8');

const manifest = {
  id: './',
  name: '경제 설계자 4.3 · 도시의 두 번째 장부',
  short_name: '경제 설계자',
  description: '개념 강의와 시각적 퍼즐로 배우는 첫 세 경제 사건',
  lang: 'ko',
  start_url: './index.html',
  scope: './',
  display: 'standalone',
  background_color: '#eeeee4',
  theme_color: '#102f37',
  prefer_related_applications: false,
  icons: [
    { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
  ]
};
await fs.writeFile(path.join(OUT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}
function solidPng(size) {
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const row = Buffer.alloc(1 + size * 4);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    const o = 1 + x * 4;
    row[o] = 0x10;
    row[o + 1] = 0x2f;
    row[o + 2] = 0x37;
    row[o + 3] = 0xff;
  }
  const raw = Buffer.alloc(row.length * size);
  for (let y = 0; y < size; y++) row.copy(raw, y * row.length);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}
for (const size of [180, 192, 512]) {
  await fs.writeFile(path.join(OUT, `icon-${size}.png`), solidPng(size));
}

console.log('Prepared PWA from Economy Designer 4.3.1 source.');

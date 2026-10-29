import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const IGNORED = new Set([
  'node_modules',
  'dist',
  '.git',
  '.github',
  'test-out.txt',
  '.env',
  'package-lock.json',
]);

function getFiles(dir, base = dir) {
  const result = [];
  for (const item of readdirSync(dir)) {
    if (IGNORED.has(item) || item.startsWith('.')) continue;
    const full = join(dir, item);
    const rel = relative(base, full).replace(/\\/g, '/');
    const stat = statSync(full);
    if (stat.isDirectory()) {
      result.push(...getFiles(full, base));
    } else if (stat.isFile() && stat.size < 500_000) {
      const content = readFileSync(full);
      const isBinary = /\.(png|jpg|jpeg|wasm|ico|pdf)$/i.test(item);
      result.push({
        file: rel,
        data: isBinary ? content.toString('base64') : content.toString('utf8'),
        encoding: isBinary ? 'base64' : 'utf-8',
      });
    }
  }
  return result;
}

const files = getFiles(process.cwd());
console.log(JSON.stringify({ count: files.length, totalSize: files.reduce((a, f) => a + f.data.length, 0) }));

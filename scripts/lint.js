import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function getJsFiles(dir) {
  const files = [];
  try {
    for (const item of readdirSync(dir)) {
      const full = join(dir, item);
      if (statSync(full).isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          files.push(...getJsFiles(full));
        }
      } else if (/\.(js|mjs)$/.test(item)) {
        files.push(full);
      }
    }
  } catch {
    /* ignore missing dirs */
  }
  return files;
}

const targetFiles = [...getJsFiles('server'), ...getJsFiles('api')];
let hasError = false;

for (const file of targetFiles) {
  const res = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (res.status !== 0) {
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`✓ Sintaks ${targetFiles.length} berkas JS terverifikasi valid.`);
}

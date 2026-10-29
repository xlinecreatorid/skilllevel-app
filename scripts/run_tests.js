import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDir = path.resolve(__dirname, '../server/test');
const files = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => path.join(testDir, f));

const res = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
});

process.exit(res.status ?? 0);

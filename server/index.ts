import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { app } from './app.ts';

const envFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const PORT = Number(process.env.PORT) || 4000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Chapel of Glory API listening on http://localhost:${PORT}`);
});

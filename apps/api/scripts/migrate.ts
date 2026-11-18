import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../src/config/database.js';

const db = createDatabase();
const directory = fileURLToPath(new URL('../migrations/', import.meta.url));
try {
  await db.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const files = (await readdir(directory)).filter((name) => /^\d+_[\w-]+\.sql$/.test(name)).sort();
  const applied = await db.execute('SELECT name, checksum FROM schema_migrations');
  const known = new Map(applied.rows.map((row) => [String(row.name), String(row.checksum)]));
  for (const name of known.keys()) if (!files.includes(name)) throw new Error(`Falta la migración aplicada: ${name}`);
  for (const name of files) {
    const sql = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    if (known.has(name)) {
      if (known.get(name) !== checksum) throw new Error(`La migración aplicada cambió: ${name}`);
      continue;
    }
    const transaction = await db.transaction('write');
    try {
      await transaction.executeMultiple(sql);
      await transaction.execute({ sql: 'INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', args: [name, checksum] });
      await transaction.commit();
      console.log(`Aplicada: ${name}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally { transaction.close(); }
  }
  console.log('Migraciones al día');
} finally { db.close(); }

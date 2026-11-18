import { createClient, type Client } from '@libsql/client';
let client: Client | undefined;
export function createDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('Falta TURSO_DATABASE_URL');
  if (!url.startsWith('file:') && !process.env.TURSO_AUTH_TOKEN) throw new Error('Falta TURSO_AUTH_TOKEN');
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
}
export function database(): Client { return client ??= createDatabase(); }

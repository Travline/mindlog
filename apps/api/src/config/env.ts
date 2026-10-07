export const PORT = process.env.PORT || 8080;
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
export const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN
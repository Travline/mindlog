import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import { fail } from '../../shared/errors.js';
const scrypt = promisify(scryptCallback);
function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || Buffer.byteLength(value) < 32) throw new Error('JWT_SECRET debe tener al menos 32 bytes');
  return new TextEncoder().encode(value);
}
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(':');
  if (!salt || !hex || !/^[0-9a-f]{128}$/.test(hex)) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(expected, actual);
}
export async function signToken(userId: string): Promise<string> {
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setSubject(userId).setIssuedAt().setExpirationTime('7d').sign(secret());
}
export async function verifyToken(token: string): Promise<string> {
  const key = secret();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'], requiredClaims: ['sub', 'exp'] });
    if (!payload.sub) return fail(401, 'Sesión inválida');
    return payload.sub;
  } catch { return fail(401, 'Sesión inválida o vencida'); }
}

import { fail } from './errors.js';
export function text(value: unknown, name: string, max = 200): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, `${name} es obligatorio y debe tener como máximo ${max} caracteres`);
  return value.trim();
}
export function optionalText(value: unknown, name: string, max = 5000): string | null {
  if (value === undefined || value === null || value === '') return null;
  return text(value, name, max);
}
export function email(value: unknown): string {
  const result = text(value, 'Correo', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Correo inválido');
  return result;
}
export function id(value: unknown): number {
  const n = Number(value); if (!Number.isSafeInteger(n) || n < 1) fail(400, 'Identificador inválido'); return n;
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Datos inválidos');
  return value as Record<string, unknown>;
}

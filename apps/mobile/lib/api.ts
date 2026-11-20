const baseUrl = process.env.EXPO_PUBLIC_PROD_API_URL;
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function api<T>(path: string, token?: string, method = 'GET', body?: unknown): Promise<T> {
  if (!baseUrl) throw new Error('Configura la URL de la API y reinicia Expo.');
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch { throw new Error('No se pudo conectar con la API. Revisa la conexión y la URL.'); }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(typeof data.error === 'string' ? data.error : 'Ocurrió un error.', response.status);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export type User = { user_id: string; username: string; email: string };
export type Member = User & { is_owner: boolean | number };
export type Board = { board_id: number; title: string; description: string | null; owner_id: string; is_owner: boolean | number };
export type Column = { column_id: number; title: string };
export type Card = { card_id: number; column_id: number; title: string; description: string | null; priority: string; due_date: string | null };
export type BoardDetail = Board & { members: Member[]; columns: Column[]; cards: Card[]; assignments: { card_id: number; user_id: string }[] };

export type Notification = { notification_id: number; board_id: number; kind: 'board_member' | 'card_assigned' | 'join_requested' | 'join_accepted' | 'join_rejected'; message: string; created_at: string; read_at: string | null };

export type JoinRequest = { request_id:number; user_id:string; username:string; email:string; created_at:string };

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  transactionId: string;
}

// Almacén asíncrono aislado por cada petición HTTP
export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getTransactionId(): string | undefined {
  const store = asyncLocalStorage.getStore();
  return store?.transactionId;
}
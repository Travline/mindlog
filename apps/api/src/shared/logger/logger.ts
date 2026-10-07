import pino from 'pino';
import { getTransactionId } from '@/shared/context/async-context';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // En entorno local da formato legible; en producción emite JSON plano a stdout
  transport: isDevelopment
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
    : undefined,

  // Redacción de seguridad: oculta automáticamente claves sensibles en cualquier objeto logueado
  redact: {
    paths: ['req.headers.authorization', 'password', '*.password', 'creditCard'],
    censor: '[REDACTED]',
  },

  // Mixin: se ejecuta en cada log e inyecta dinámicamente el transactionId actual
  mixin() {
    const transactionId = getTransactionId();
    return transactionId ? { transactionId } : {};
  },
});

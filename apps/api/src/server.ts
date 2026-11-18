import app from './app.js';
import { logger } from './shared/logger.js';

const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
const server = app.listen(port);
server.once('listening', () => logger.info({ port }, 'API iniciada'));
server.once('error', (error) => {
  logger.error({ err: error, port }, 'No se pudo iniciar la API');
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { server.close(() => process.exit(0)); });
}

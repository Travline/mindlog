import express from 'express';
import { createRequire } from 'node:module';
import { openapi } from './config/openapi.js';
import { auth } from './modules/auth/auth.js';
import { boards } from './modules/boards/routes.js';
import { errorHandler } from './shared/error-handler.js';
const app = express();
const require = createRequire(import.meta.url);
const swaggerCss = require.resolve('swagger-ui-dist/swagger-ui.css');
const swaggerBundle = require.resolve('swagger-ui-dist/swagger-ui-bundle.js');
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *     - Sistema
 *     summary: Comprobar disponibilidad
 *     operationId: get_health
 *     security: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Health'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
/**
 * @openapi
 * /openapi.json:
 *   get:
 *     tags:
 *     - Documentación
 *     summary: Consultar especificación OpenAPI
 *     operationId: get_openapi_json
 *     security: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/openapi.json', (_req, res) => { res.json(openapi); });
/**
 * @openapi
 * /docs:
 *   get:
 *     tags:
 *     - Documentación
 *     summary: Abrir Swagger UI
 *     operationId: get_docs
 *     security: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/docs', (_req, res) => {
  res.type('html').send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mindlog API</title><link rel="stylesheet" href="/docs/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="/docs/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });</script></body></html>`);
});
// Se usan rutas explícitas para que los recursos también funcionen en Vercel,
// donde express.static no sirve archivos estáticos.
/**
 * @openapi
 * /docs/swagger-ui.css:
 *   get:
 *     tags:
 *     - Documentación
 *     summary: Obtener estilos de Swagger UI
 *     operationId: get_docs_swagger_ui_css
 *     security: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           text/css:
 *             schema:
 *               type: string
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/docs/swagger-ui.css', (_req, res) => { res.type('css').sendFile(swaggerCss, { dotfiles: 'allow' }); });
/**
 * @openapi
 * /docs/swagger-ui-bundle.js:
 *   get:
 *     tags:
 *     - Documentación
 *     summary: Obtener JavaScript de Swagger UI
 *     operationId: get_docs_swagger_ui_bundle_js
 *     security: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/javascript:
 *             schema:
 *               type: string
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/docs/swagger-ui-bundle.js', (_req, res) => { res.type('js').sendFile(swaggerBundle, { dotfiles: 'allow' }); });
app.use('/auth', auth);
app.use('/boards', boards);
app.use(errorHandler);
export default app;

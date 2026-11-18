import { Router } from 'express';
import { requireAuth } from '../auth/auth.js';
import { id } from '../../shared/validation.js';
import { notificationsService as service } from './service.js';
export const notifications = Router();
notifications.use(requireAuth);
/**
 * @openapi
 * /notifications/devices:
 *   put:
 *     tags: [Notificaciones]
 *     summary: Registrar o actualizar el dispositivo de la cuenta
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PushDeviceInput' }
 *     responses:
 *       '204': { description: Dispositivo registrado }
 *       '400': { description: Token inválido }
 *       '401': { description: Sesión inválida }
 *       '500': { description: Error interno }
 *   delete:
 *     tags: [Notificaciones]
 *     summary: Retirar un dispositivo de la cuenta
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PushDeviceInput' }
 *     responses:
 *       '204': { description: Dispositivo retirado }
 *       '400': { description: Token inválido }
 *       '401': { description: Sesión inválida }
 *       '500': { description: Error interno }
 */
notifications.put('/devices',async(req,res)=>{await service.register(res.locals.userId,req.body);res.status(204).end();});
notifications.delete('/devices',async(req,res)=>{await service.unregister(res.locals.userId,req.body);res.status(204).end();});
/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Listar el historial de notificaciones
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Notificaciones de la cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notification' }
 *       '401': { description: Sesión inválida }
 *       '500': { description: Error interno }
 */
notifications.get('/',async(_req,res)=>res.json(await service.list(res.locals.userId)));
/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   put:
 *     tags: [Notificaciones]
 *     summary: Marcar una notificación como leída
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '204': { description: Notificación marcada }
 *       '400': { description: Identificador inválido }
 *       '401': { description: Sesión inválida }
 *       '404': { description: Notificación no encontrada }
 *       '500': { description: Error interno }
 */
notifications.put('/:notificationId/read',async(req,res)=>{await service.read(res.locals.userId,id(req.params.notificationId));res.status(204).end();});

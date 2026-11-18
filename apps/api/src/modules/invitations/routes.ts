import { Router } from 'express';
import { requireAuth } from '../auth/auth.js';
import { id } from '../../shared/validation.js';
import { invitationService as service } from './service.js';
export const invitations=Router();
invitations.use(requireAuth);
/**
 * @openapi
 * /invitations/boards/{boardId}/code:
 *   get:
 *     tags: [Solicitudes]
 *     summary: Mostrar o crear el QR del dueño
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/InviteCode' }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.get('/boards/:boardId/code',async(req,res)=>res.json(await service.getCode(id(req.params.boardId),res.locals.userId)));
/**
 * @openapi
 * /invitations/boards/{boardId}/code:
 *   put:
 *     tags: [Solicitudes]
 *     summary: Regenerar el QR del dueño
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/InviteCode' }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.put('/boards/:boardId/code',async(req,res)=>res.json(await service.rotate(id(req.params.boardId),res.locals.userId)));
/**
 * @openapi
 * /invitations/preview:
 *   post:
 *     tags: [Solicitudes]
 *     summary: Consultar tablero mediante código QR
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InviteCode' }
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/InvitePreview' }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.post('/preview',async(req,res)=>res.json(await service.preview(res.locals.userId,req.body)));
/**
 * @openapi
 * /invitations/requests:
 *   post:
 *     tags: [Solicitudes]
 *     summary: Solicitar unión al tablero
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InviteCode' }
 *     responses:
 *       '204': { description: Operación exitosa }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.post('/requests',async(req,res)=>{await service.submit(res.locals.userId,req.body);res.status(204).end();});
/**
 * @openapi
 * /invitations/boards/{boardId}/requests:
 *   get:
 *     tags: [Solicitudes]
 *     summary: Listar solicitudes pendientes del tablero
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/JoinRequestArray' }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.get('/boards/:boardId/requests',async(req,res)=>res.json(await service.list(id(req.params.boardId),res.locals.userId)));
/**
 * @openapi
 * /invitations/boards/{boardId}/requests/{requestId}:
 *   put:
 *     tags: [Solicitudes]
 *     summary: Aceptar o rechazar una solicitud
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/JoinDecision' }
 *     responses:
 *       '204': { description: Operación exitosa }
 *       '400': { description: Datos inválidos }
 *       '401': { description: Sesión inválida }
 *       '403': { description: Acceso denegado }
 *       '404': { description: Recurso no encontrado o código inválido }
 *       '409': { description: Solicitud duplicada o ya resuelta }
 *       '500': { description: Error interno }
 */
invitations.put('/boards/:boardId/requests/:requestId',async(req,res)=>{await service.decide(id(req.params.boardId),id(req.params.requestId),res.locals.userId,req.body);res.status(204).end();});

import { Router } from 'express';
import { id } from '../../shared/validation.js';
import { requireAuth } from '../auth/auth.js';
import { boardService as service } from './service.js';
export const boards = Router();
boards.use(requireAuth);
/**
 * @openapi
 * /boards:
 *   get:
 *     tags:
 *     - Tableros
 *     summary: Listar tableros accesibles
 *     operationId: get_boards
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.get('/',async(_req,res)=>{res.json(await service.list(res.locals.userId));});
/**
 * @openapi
 * /boards:
 *   post:
 *     tags:
 *     - Tableros
 *     summary: Crear tablero
 *     operationId: post_boards
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardInput'
 *     responses:
 *       '201':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.post('/',async(req,res)=>{res.status(201).json(await service.create(res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}:
 *   get:
 *     tags:
 *     - Tableros
 *     summary: Consultar tablero y contenido
 *     operationId: get_boards__boardId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardDetail'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.get('/:boardId',async(req,res)=>{res.json(await service.detail(id(req.params.boardId),res.locals.userId));});
/**
 * @openapi
 * /boards/{boardId}:
 *   put:
 *     tags:
 *     - Tableros
 *     summary: Editar tablero (dueño)
 *     operationId: put_boards__boardId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardInput'
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '403':
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.put('/:boardId',async(req,res)=>{res.json(await service.update(id(req.params.boardId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}:
 *   delete:
 *     tags:
 *     - Tableros
 *     summary: Eliminar tablero (dueño)
 *     operationId: delete_boards__boardId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     responses:
 *       '204':
 *         description: Operación completada sin contenido
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '403':
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.delete('/:boardId',async(req,res)=>{await service.remove(id(req.params.boardId),res.locals.userId);res.status(204).end();});
/**
 * @openapi
 * /boards/{boardId}/members:
 *   post:
 *     tags:
 *     - Miembros
 *     summary: Agregar miembro por correo (dueño)
 *     description: Guarda una notificación para el integrante e intenta enviar un aviso push.
 *     operationId: post_boards__boardId__members
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberInput'
 *     responses:
 *       '201':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '403':
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '409':
 *         description: Ya existe un registro con estos datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.post('/:boardId/members',async(req,res)=>{res.status(201).json(await service.addMember(id(req.params.boardId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}/members/{userId}:
 *   delete:
 *     tags:
 *     - Miembros
 *     summary: Retirar miembro o abandonar tablero
 *     operationId: delete_boards__boardId__members__userId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *     responses:
 *       '204':
 *         description: Operación completada sin contenido
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '403':
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.delete('/:boardId/members/:userId',async(req,res)=>{await service.removeMember(id(req.params.boardId),res.locals.userId,req.params.userId);res.status(204).end();});
/**
 * @openapi
 * /boards/{boardId}/columns:
 *   post:
 *     tags:
 *     - Columnas
 *     summary: Crear columna
 *     operationId: post_boards__boardId__columns
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ColumnInput'
 *     responses:
 *       '201':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.post('/:boardId/columns',async(req,res)=>{res.status(201).json(await service.createColumn(id(req.params.boardId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}/columns/{columnId}:
 *   put:
 *     tags:
 *     - Columnas
 *     summary: Editar columna
 *     operationId: put_boards__boardId__columns__columnId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: columnId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ColumnInput'
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.put('/:boardId/columns/:columnId',async(req,res)=>{res.json(await service.updateColumn(id(req.params.boardId),id(req.params.columnId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}/columns/{columnId}:
 *   delete:
 *     tags:
 *     - Columnas
 *     summary: Eliminar columna y sus tickets
 *     operationId: delete_boards__boardId__columns__columnId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: columnId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     responses:
 *       '204':
 *         description: Operación completada sin contenido
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.delete('/:boardId/columns/:columnId',async(req,res)=>{await service.removeColumn(id(req.params.boardId),id(req.params.columnId),res.locals.userId);res.status(204).end();});
/**
 * @openapi
 * /boards/{boardId}/columns/{columnId}/cards:
 *   post:
 *     tags:
 *     - Tickets
 *     summary: Crear ticket
 *     operationId: post_boards__boardId__columns__columnId__cards
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: columnId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardInput'
 *     responses:
 *       '201':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.post('/:boardId/columns/:columnId/cards',async(req,res)=>{res.status(201).json(await service.createCard(id(req.params.boardId),id(req.params.columnId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}/cards/{cardId}:
 *   put:
 *     tags:
 *     - Tickets
 *     summary: Editar o mover ticket
 *     operationId: put_boards__boardId__cards__cardId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: cardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardUpdateInput'
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.put('/:boardId/cards/:cardId',async(req,res)=>{res.json(await service.updateCard(id(req.params.boardId),id(req.params.cardId),res.locals.userId,req.body));});
/**
 * @openapi
 * /boards/{boardId}/cards/{cardId}:
 *   delete:
 *     tags:
 *     - Tickets
 *     summary: Eliminar ticket
 *     operationId: delete_boards__boardId__cards__cardId
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: cardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     responses:
 *       '204':
 *         description: Operación completada sin contenido
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.delete('/:boardId/cards/:cardId',async(req,res)=>{await service.removeCard(id(req.params.boardId),id(req.params.cardId),res.locals.userId);res.status(204).end();});
/**
 * @openapi
 * /boards/{boardId}/cards/{cardId}/assignments:
 *   put:
 *     tags:
 *     - Tickets
 *     summary: Reemplazar responsables de ticket
 *     description: Notifica a los nuevos responsables, excepto a quien realizó la asignación.
 *     operationId: put_boards__boardId__cards__cardId__assignments
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: boardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     - name: cardId
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignmentsInput'
 *     responses:
 *       '204':
 *         description: Operación completada sin contenido
 *       '400':
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Credenciales o sesión inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recurso no encontrado o inaccesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
boards.put('/:boardId/cards/:cardId/assignments',async(req,res)=>{await service.assign(id(req.params.boardId),id(req.params.cardId),res.locals.userId,req.body);res.status(204).end();});

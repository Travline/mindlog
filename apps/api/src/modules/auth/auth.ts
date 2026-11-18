import { Router, type RequestHandler } from 'express';
import { fail } from '../../shared/errors.js';
import { authService as service } from './service.js';
export const requireAuth: RequestHandler = async (req,res,next) => { const header=req.header('authorization');if(!header?.startsWith('Bearer '))return fail(401,'Inicia sesión');res.locals.userId=await service.authenticate(header.slice(7));next(); };
export const auth=Router();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *     - Autenticación
 *     summary: Registrar usuario
 *     operationId: post_auth_register
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       '201':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResult'
 *       '400':
 *         description: Solicitud inválida
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
auth.post('/register',async(req,res)=>{res.status(201).json(await service.register(req.body));});
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *     - Autenticación
 *     summary: Iniciar sesión
 *     operationId: post_auth_login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResult'
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
auth.post('/login',async(req,res)=>{res.json(await service.login(req.body));});
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *     - Autenticación
 *     summary: Consultar perfil
 *     operationId: get_auth_me
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
auth.get('/me',requireAuth,async(_req,res)=>{res.json(await service.profile(res.locals.userId));});
/**
 * @openapi
 * /auth/me:
 *   put:
 *     tags:
 *     - Autenticación
 *     summary: Editar perfil
 *     operationId: put_auth_me
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       '200':
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
auth.put('/me',requireAuth,async(req,res)=>{res.json(await service.updateProfile(res.locals.userId,req.body));});

import { randomUUID } from 'node:crypto';
import { fail } from '../../shared/errors.js';
import { email, object, text } from '../../shared/validation.js';
import { authRepository as repo } from './repository.js';
import { hashPassword, signToken, verifyPassword, verifyToken } from './security.js';
export const authService = {
  async authenticate(token: string) { const id=await verifyToken(token);if(!await repo.findById(id))return fail(401,'Sesión inválida');return id; },
  async register(input: unknown) { const body=object(input);const username=text(body.username,'Nombre',100);const mail=email(body.email);const password=text(body.password,'Contraseña',128);if(password.length<8)return fail(400,'La contraseña debe tener al menos 8 caracteres');const userId=randomUUID();const token=await signToken(userId);await repo.create(userId,mail,username,await hashPassword(password));return {token,user:{user_id:userId,email:mail,username}}; },
  async login(input: unknown) { const body=object(input);const mail=email(body.email);const password=text(body.password,'Contraseña',128);const user=await repo.findByEmail(mail);if(!user||!await verifyPassword(password,String(user.password)))return fail(401,'Correo o contraseña incorrectos');return {token:await signToken(String(user.user_id)),user:{user_id:user.user_id,email:user.email,username:user.username}}; },
  async profile(id: string) { const user=await repo.findById(id);if(!user)return fail(401,'Sesión inválida');return user; },
  async updateProfile(id: string,input: unknown) {const body=object(input);const username=text(body.username,'Nombre',100);const mail=email(body.email);await repo.update(id,mail,username);return {user_id:id,email:mail,username};},
};

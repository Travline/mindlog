import { database } from '../../config/database.js';
export const authRepository = {
  async findById(id: string) { return (await database().execute({sql:'SELECT user_id,email,username FROM users WHERE user_id=?',args:[id]})).rows[0]; },
  async findByEmail(email: string) { return (await database().execute({sql:'SELECT user_id,email,username,password FROM users WHERE email=?',args:[email]})).rows[0]; },
  async create(id: string,email: string,username: string,password: string) { await database().execute({sql:'INSERT INTO users (user_id,email,username,password) VALUES (?,?,?,?)',args:[id,email,username,password]}); },
  async update(id: string,email: string,username: string) { await database().execute({sql:'UPDATE users SET username=?,email=? WHERE user_id=?',args:[username,email,id]}); },
};

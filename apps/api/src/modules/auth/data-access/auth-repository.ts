import { db } from "@/config/turso-connection";
import { UserEntity } from "@/modules/auth/domain/auth-entities";

export async function save(user: UserEntity): Promise<UserEntity> {
  const result = await db.execute({
    sql: `
        INSERT INTO users(user_id, email, username, password) 
        VALUES (:userId, :email, :username, :password) 
        RETURNING *;
        `,
    args: user
  });

  const insertedRow = result.rows.at(0)

  return {
    userId: String(insertedRow?.user_id),
    email: String(insertedRow?.email),
    password: String(insertedRow?.password),
    username: String(insertedRow?.username)
  }
}

export async function findByEmail(email: string): Promise<UserEntity | null> {
  const result = await db.execute({
    sql: `
        SELECT user_id, email, password, username
        FROM users 
        WHERE email = :email
        `,
    args: { email }
  });

  if (result.rows.length != 1) {
    return null;
  }

  const rowFound = result.rows.at(0)

  return {
    userId: String(rowFound?.user_id),
    email: String(rowFound?.email),
    password: String(rowFound?.password),
    username: String(rowFound?.username)
  }
}
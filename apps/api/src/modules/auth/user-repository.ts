import { db } from "@/config/turso-connection";
import { UserSchema } from "./user-schema";

export class UserRepository {
  save = async (user: UserSchema): Promise<number> => {
    try {
      const result = await db.execute({
        sql: `
        INSERT INTO users(user_id, email, username, password) 
        VALUES (:userId, :email, :username, :password)
        `,
        args: user
      });

      // Esto deberia retornar 1 lo que sería una unia fila afectada (1 dato insertado)
      return result.rowsAffected;
    } catch (error) {
      console.error(error);

      // Si hubo error se loggea y se retornan 0 filas afectadas
      return 0;
    }
  }

  existsByEmail = async (email: string): Promise<boolean> => {
    try {
      const result = await db.execute({
        sql: `
        SELECT user_id 
        FROM users 
        WHERE email = :email
        `,
        args: { email }
      });

      return result.rows.length === 1;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
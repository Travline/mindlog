import { Request, Response } from "express";
import { CreateUserReq, CreateUserRes } from "@mindlog/types";
import { UserRepository } from "./user-repository";

export class UserService {
  private repo = new UserRepository();

  create = async (req: Request<unknown, unknown, CreateUserReq>, res: Response<CreateUserRes>) => {
    return res; // not finished
    // const body = req.body;
    // verifica el email si ya está siendo usado

    // genera el uuid

    // hashea la contraseña
    // guarda el usuario
    // retorna la respuesta
  }
}
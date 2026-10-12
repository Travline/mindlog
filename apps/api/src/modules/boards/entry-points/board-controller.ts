import {
  CreateBoardReq,
  UpdateBoardReq,
  BoardRes,
  BoardFilterSchema,
  GetBoardsQuery,
} from "@mindlog/types";
import { NextFunction, Request, Response } from "express";
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
} from "@/modules/boards/domain/board-service";
import HttpCode from "@/shared/enums/http-code";
import { AppError } from "@/shared/error-handling/app-error";

function parseBoardId(raw: string, next: NextFunction): number | null {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) {
    next(
      new AppError(
        "INVALID_BOARD_ID",
        HttpCode.BAD_REQUEST,
        "El id del tablero debe ser un número entero positivo",
        true
      )
    );
    return null;
  }
  return id;
}

export async function handleCreate(
  req: Request<{}, BoardRes, CreateBoardReq>,
  res: Response<BoardRes>,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const { title, description } = req.body;

    const board = await createBoard({ title, description }, userId);

    res.status(HttpCode.CREATED).json({
      boardId: board.boardId as number,
      title: board.title,
      description: board.description ?? null,
      ownerId: board.ownerId,
      isOwner: true,
      createdAt: board.createdAt ?? null,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAll(
  req: Request<{}, BoardRes[], {}, GetBoardsQuery>,
  res: Response<BoardRes[]>,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const parseResult = BoardFilterSchema.safeParse(req.query.filter);
    const filter = parseResult.success ? parseResult.data : "all";

    const boards = await getBoards(userId, filter);

    res.status(HttpCode.OK).json(
      boards.map((board) => ({
        boardId: board.boardId as number,
        title: board.title,
        description: board.description ?? null,
        ownerId: board.ownerId,
        isOwner: board.isOwner ?? (board.ownerId === userId),
        createdAt: board.createdAt ?? null,
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function handleGetOne(
  req: Request<{ id: string }>,
  res: Response<BoardRes>,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const boardId = parseBoardId(req.params.id, next);
    if (boardId === null) return;

    const board = await getBoardById(boardId, userId);

    res.status(HttpCode.OK).json({
      boardId: board.boardId as number,
      title: board.title,
      description: board.description ?? null,
      ownerId: board.ownerId,
      isOwner: board.ownerId === userId,
      createdAt: board.createdAt ?? null,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdate(
  req: Request<{ id: string }, BoardRes, UpdateBoardReq>,
  res: Response<BoardRes>,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const boardId = parseBoardId(req.params.id, next);
    if (boardId === null) return;

    const { title, description } = req.body;

    const board = await updateBoard(boardId, userId, { title, description });

    res.status(HttpCode.OK).json({
      boardId: board.boardId as number,
      title: board.title,
      description: board.description ?? null,
      ownerId: board.ownerId,
      isOwner: board.ownerId === userId,
      createdAt: board.createdAt ?? null,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDelete(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const boardId = parseBoardId(req.params.id, next);
    if (boardId === null) return;

    await deleteBoard(boardId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


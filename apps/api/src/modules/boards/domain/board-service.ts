import { BoardEntity } from "@/modules/boards/domain/board-entities";
import {
  save,
  findAllByOwnerId,
  findAllByUser,
  findById,
  update,
  remove,
} from "@/modules/boards/data-access/board-repository";
import { AppError } from "@/shared/error-handling/app-error";
import HttpCode from "@/shared/enums/http-code";

export async function createBoard(
  data: Pick<BoardEntity, "title" | "description">,
  ownerId: string
): Promise<BoardEntity> {
  const savedBoard = await save({
    title: data.title,
    description: data.description ?? null,
    ownerId,
  });

  if (!savedBoard) {
    throw new AppError(
      "BOARD_NOT_PERSISTED",
      HttpCode.INTERNAL_SERVER_ERROR,
      "El tablero no pudo ser creado",
      false
    );
  }

  return savedBoard;
}

export async function getBoardsByOwner(ownerId: string): Promise<BoardEntity[]> {
  return findAllByOwnerId(ownerId);
}

export async function getBoards(
  userId: string,
  filter: "all" | "owned" | "shared" = "all"
): Promise<BoardEntity[]> {
  return findAllByUser(userId, filter);
}

export async function getBoardById(
  boardId: number,
  ownerId: string
): Promise<BoardEntity> {
  const board = await findById(boardId, ownerId);

  if (!board) {
    throw new AppError(
      "BOARD_NOT_FOUND",
      HttpCode.NOT_FOUND,
      "El tablero no fue encontrado",
      true
    );
  }

  return board;
}

export async function updateBoard(
  boardId: number,
  ownerId: string,
  data: Partial<Pick<BoardEntity, "title" | "description">>
): Promise<BoardEntity> {
  const updatedBoard = await update(boardId, ownerId, data);

  if (!updatedBoard) {
    throw new AppError(
      "BOARD_NOT_FOUND",
      HttpCode.NOT_FOUND,
      "El tablero no fue encontrado",
      true
    );
  }

  return updatedBoard;
}

export async function deleteBoard(boardId: number, ownerId: string): Promise<void> {
  const deleted = await remove(boardId, ownerId);

  if (!deleted) {
    throw new AppError(
      "BOARD_NOT_FOUND",
      HttpCode.NOT_FOUND,
      "El tablero no fue encontrado",
      true
    );
  }
}

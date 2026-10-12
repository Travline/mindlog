import { db } from "@/config/turso-connection";
import { BoardEntity } from "@/modules/boards/domain/board-entities";

export async function save(board: BoardEntity): Promise<BoardEntity> {
  const result = await db.execute({
    sql: `
        INSERT INTO boards(title, description, owner_id)
        VALUES (:title, :description, :ownerId)
        RETURNING board_id, title, description, owner_id, created_at;
        `,
    args: {
      title: board.title,
      description: board.description ?? null,
      ownerId: board.ownerId,
    },
  });

  const row = result.rows.at(0);

  return {
    boardId: Number(row?.board_id),
    title: String(row?.title),
    description: row?.description ? String(row.description) : null,
    ownerId: String(row?.owner_id),
    createdAt: row?.created_at ? String(row.created_at) : null,
  };
}

export async function findAllByOwnerId(ownerId: string): Promise<BoardEntity[]> {
  const result = await db.execute({
    sql: `
        SELECT board_id, title, description, owner_id, created_at
        FROM boards
        WHERE owner_id = :ownerId
        ORDER BY created_at DESC;
        `,
    args: { ownerId },
  });

  return result.rows.map((row) => ({
    boardId: Number(row.board_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    ownerId: String(row.owner_id),
    createdAt: row.created_at ? String(row.created_at) : null,
  }));
}

export async function findById(boardId: number, ownerId: string): Promise<BoardEntity | null> {
  const result = await db.execute({
    sql: `
        SELECT board_id, title, description, owner_id, created_at
        FROM boards
        WHERE board_id = :boardId AND owner_id = :ownerId;
        `,
    args: { boardId, ownerId },
  });

  if (result.rows.length !== 1) {
    return null;
  }

  const row = result.rows.at(0);

  return {
    boardId: Number(row?.board_id),
    title: String(row?.title),
    description: row?.description ? String(row.description) : null,
    ownerId: String(row?.owner_id),
    createdAt: row?.created_at ? String(row.created_at) : null,
  };
}

export async function update(
  boardId: number,
  ownerId: string,
  data: Partial<Pick<BoardEntity, "title" | "description">>
): Promise<BoardEntity | null> {
  const result = await db.execute({
    sql: `
        UPDATE boards
        SET
          title       = COALESCE(:title, title),
          description = COALESCE(:description, description)
        WHERE board_id = :boardId AND owner_id = :ownerId
        RETURNING board_id, title, description, owner_id, created_at;
        `,
    args: {
      boardId,
      ownerId,
      title: data.title ?? null,
      description: data.description ?? null,
    },
  });

  if (result.rows.length !== 1) {
    return null;
  }

  const row = result.rows.at(0);

  return {
    boardId: Number(row?.board_id),
    title: String(row?.title),
    description: row?.description ? String(row.description) : null,
    ownerId: String(row?.owner_id),
    createdAt: row?.created_at ? String(row.created_at) : null,
  };
}

export async function remove(boardId: number, ownerId: string): Promise<boolean> {
  const result = await db.execute({
    sql: `
        DELETE FROM boards
        WHERE board_id = :boardId AND owner_id = :ownerId;
        `,
    args: { boardId, ownerId },
  });

  return (result.rowsAffected ?? 0) > 0;
}

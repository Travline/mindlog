import { database } from '../../config/database.js';
import { fail } from '../../shared/errors.js';
export async function boardAccess(boardId: number, userId: string, owner = false) {
  const result = await database().execute({ sql: `SELECT b.board_id, b.owner_id, b.title, b.description, b.created_at FROM boards b WHERE b.board_id = ? AND (b.owner_id = ? OR EXISTS (SELECT 1 FROM board_members m WHERE m.board_id = b.board_id AND m.user_id = ?))`, args: [boardId, userId, userId] });
  const board = result.rows[0];
  if (!board) return fail(404, 'Tablero no encontrado');
  if (owner && board.owner_id !== userId) return fail(403, 'Solo el dueño puede realizar esta acción');
  return board;
}
export async function cardBoard(cardId: number): Promise<number> {
  const result = await database().execute({ sql: 'SELECT c.board_id FROM cards k JOIN board_columns c ON c.column_id = k.column_id WHERE k.card_id = ?', args: [cardId] });
  if (!result.rows[0]) return fail(404, 'Ticket no encontrado');
  return Number(result.rows[0].board_id);
}

// Eliminar explícitamente los hijos en una transacción no depende del ajuste
// de claves foráneas de una conexión remota de Turso.
export async function deleteBoardData(boardId: number) {
  const tx = await database().transaction('write');
  try {
    await tx.execute({sql: 'DELETE FROM card_assignments WHERE card_id IN (SELECT k.card_id FROM cards k JOIN board_columns c ON c.column_id=k.column_id WHERE c.board_id=?)', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM cards WHERE column_id IN (SELECT column_id FROM board_columns WHERE board_id=?)', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM board_columns WHERE board_id=?', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM join_requests WHERE board_id=?', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM board_invites WHERE board_id=?', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM board_members WHERE board_id=?', args:[boardId]});
    await tx.execute({sql: 'DELETE FROM boards WHERE board_id=?', args:[boardId]});
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}
export async function deleteColumnData(boardId: number, columnId: number) {
  const tx = await database().transaction('write');
  try {
    const existing = await tx.execute({sql: 'SELECT column_id FROM board_columns WHERE board_id=? AND column_id=?', args:[boardId,columnId]});
    if (!existing.rows.length) return fail(404, 'Columna no encontrada');
    await tx.execute({sql:'DELETE FROM card_assignments WHERE card_id IN (SELECT card_id FROM cards WHERE column_id=?)', args:[columnId]});
    await tx.execute({sql:'DELETE FROM cards WHERE column_id=?', args:[columnId]});
    await tx.execute({sql:'DELETE FROM board_columns WHERE column_id=? AND board_id=?', args:[columnId,boardId]});
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}
export async function deleteCardData(cardId: number) {
  const tx = await database().transaction('write');
  try {
    await tx.execute({sql:'DELETE FROM card_assignments WHERE card_id=?', args:[cardId]});
    await tx.execute({sql:'DELETE FROM cards WHERE card_id=?', args:[cardId]});
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}

export const boardRepository = {
  async list(userId: string) { return (await database().execute({sql:`SELECT b.*, CASE WHEN b.owner_id = ? THEN 1 ELSE 0 END AS is_owner FROM boards b WHERE b.owner_id = ? OR EXISTS (SELECT 1 FROM board_members m WHERE m.board_id = b.board_id AND m.user_id = ?) ORDER BY b.board_id`,args:[userId,userId,userId]})).rows; },
  async create(userId: string, title: string, description: string | null) { return (await database().execute({sql:'INSERT INTO boards (title,description,owner_id) VALUES (?,?,?) RETURNING *',args:[title,description,userId]})).rows[0]; },
  async update(boardId: number, title: string, description: string | null) { return (await database().execute({sql:'UPDATE boards SET title=?,description=? WHERE board_id=? RETURNING *',args:[title,description,boardId]})).rows[0]; },
  async detail(boardId: number) {
    const db=database(); const [members,columns,cards,assignments] = await Promise.all([
      db.execute({sql:`SELECT u.user_id,u.username,u.email, CASE WHEN u.user_id = b.owner_id THEN 1 ELSE 0 END AS is_owner FROM boards b JOIN users u ON u.user_id = b.owner_id OR EXISTS (SELECT 1 FROM board_members m WHERE m.board_id = b.board_id AND m.user_id = u.user_id) WHERE b.board_id = ? ORDER BY is_owner DESC, u.username`,args:[boardId]}),
      db.execute({sql:'SELECT * FROM board_columns WHERE board_id = ? ORDER BY column_id',args:[boardId]}),
      db.execute({sql:'SELECT k.* FROM cards k JOIN board_columns c ON c.column_id = k.column_id WHERE c.board_id = ? ORDER BY k.card_id',args:[boardId]}),
      db.execute({sql:'SELECT a.card_id,a.user_id FROM card_assignments a JOIN cards k ON k.card_id = a.card_id JOIN board_columns c ON c.column_id = k.column_id WHERE c.board_id = ?',args:[boardId]})
    ]); return {members:members.rows,columns:columns.rows,cards:cards.rows,assignments:assignments.rows};
  },
  async findUser(mail: string) { return (await database().execute({sql:'SELECT user_id,username,email FROM users WHERE email=?',args:[mail]})).rows[0]; },
  async addMember(boardId: number, userId: string) {
    const tx=await database().transaction('write');
    try {
      await tx.execute({sql:'INSERT INTO board_members (board_id,user_id) VALUES (?,?)',args:[boardId,userId]});
      const pending=await tx.execute({sql:"UPDATE join_requests SET status='accepted',resolved_at=CURRENT_TIMESTAMP WHERE board_id=? AND user_id=? AND status='pending'",args:[boardId,userId]});
      const result=await tx.execute({sql:`INSERT INTO notifications(user_id,board_id,kind,message) SELECT ?,board_id,?,? || title FROM boards WHERE board_id=? RETURNING notification_id`,args:[userId,pending.rowsAffected?'join_accepted':'board_member',pending.rowsAffected?'Aceptaron tu solicitud para ':'Te agregaron al tablero ',boardId]});
      await tx.commit(); return [Number(result.rows[0].notification_id)];
    } catch(e) { await tx.rollback(); throw e; } finally { tx.close(); }
  },
  async removeMember(boardId: number, target: string) {
    const tx=await database().transaction('write');
    try { const deleted=await tx.execute({sql:'DELETE FROM board_members WHERE board_id=? AND user_id=?',args:[boardId,target]}); if(!deleted.rowsAffected) return fail(404,'Miembro no encontrado');
      await tx.execute({sql:'DELETE FROM card_assignments WHERE user_id=? AND card_id IN (SELECT k.card_id FROM cards k JOIN board_columns c ON c.column_id=k.column_id WHERE c.board_id=?)',args:[target,boardId]}); await tx.commit();
    } catch(e) { await tx.rollback(); throw e; } finally { tx.close(); }
  },
  async createColumn(boardId: number, title: string) { return (await database().execute({sql:'INSERT INTO board_columns (board_id,title) VALUES (?,?) RETURNING *',args:[boardId,title]})).rows[0]; },
  async updateColumn(boardId: number, columnId: number, title: string) { return (await database().execute({sql:'UPDATE board_columns SET title=? WHERE board_id=? AND column_id=? RETURNING *',args:[title,boardId,columnId]})).rows[0]; },
  async createCard(boardId: number, columnId: number, data: CardData) { return (await database().execute({sql:'INSERT INTO cards (column_id,title,description,priority,due_date) SELECT column_id,?,?,?,? FROM board_columns WHERE column_id=? AND board_id=? RETURNING *',args:[data.title,data.description,data.priority,data.due,columnId,boardId]})).rows[0]; },
  async updateCard(boardId: number, cardId: number, columnId: number, data: CardData) { return (await database().execute({sql:'UPDATE cards SET title=?,description=?,priority=?,due_date=?,column_id=? WHERE card_id=? AND EXISTS (SELECT 1 FROM board_columns WHERE column_id=? AND board_id=?) RETURNING *',args:[data.title,data.description,data.priority,data.due,columnId,cardId,columnId,boardId]})).rows[0]; },
  async replaceAssignments(boardId: number, cardId: number, userIds: string[], actorId: string) {
    const tx=await database().transaction('write');
    try {
      for(const userId of userIds){ const r=await tx.execute({sql:'SELECT 1 FROM boards b WHERE b.board_id=? AND (b.owner_id=? OR EXISTS(SELECT 1 FROM board_members m WHERE m.board_id=b.board_id AND m.user_id=?))',args:[boardId,userId,userId]}); if(!r.rows.length) return fail(400,'El responsable no pertenece al tablero'); }
      const previous=await tx.execute({sql:'SELECT user_id FROM card_assignments WHERE card_id=?',args:[cardId]});
      const existing=new Set(previous.rows.map(row=>String(row.user_id)));
      await tx.execute({sql:'DELETE FROM card_assignments WHERE card_id=?',args:[cardId]});
      for(const userId of userIds) await tx.execute({sql:'INSERT INTO card_assignments (card_id,user_id) VALUES (?,?)',args:[cardId,userId]});
      const notificationIds: number[]=[];
      for(const userId of userIds.filter(userId=>userId!==actorId && !existing.has(userId))) {
        const result=await tx.execute({sql:`INSERT INTO notifications(user_id,board_id,kind,message) SELECT ?,?,'card_assigned','Te asignaron el ticket ' || title FROM cards WHERE card_id=? RETURNING notification_id`,args:[userId,boardId,cardId]});
        notificationIds.push(Number(result.rows[0].notification_id));
      }
      await tx.commit(); return notificationIds;
    } catch(e) { await tx.rollback(); throw e; } finally { tx.close(); }
  },
};
export type CardData = { title: string; description: string | null; priority: string; due: string | null };

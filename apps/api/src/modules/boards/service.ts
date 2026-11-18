import { fail } from '../../shared/errors.js';
import { email, id, object, optionalText, text } from '../../shared/validation.js';
import { boardAccess, boardRepository as repo, cardBoard, deleteBoardData, deleteColumnData, deleteCardData } from './repository.js';

function boardData(input: unknown) { const body=object(input); return {title:text(body.title,'Título'), description:optionalText(body.description,'Descripción')}; }
function cardData(body: Record<string, unknown>) {
  const priority=body.priority ?? 'Media'; if(!['Baja','Media','Alta'].includes(String(priority))) return fail(400,'Prioridad inválida');
  const due=optionalText(body.due_date,'Fecha límite',10);
  if(due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(due+'T00:00:00Z')) || new Date(due+'T00:00:00Z').toISOString().slice(0,10)!==due)) return fail(400,'Fecha límite inválida (AAAA-MM-DD)');
  return {title:text(body.title,'Título'),description:optionalText(body.description,'Descripción'),priority:String(priority),due};
}
async function checkCard(boardId: number, cardId: number, userId: string) { await boardAccess(boardId,userId); if(await cardBoard(cardId)!==boardId) return fail(404,'Ticket no encontrado'); }
export const boardService = {
  list: (userId: string) => repo.list(userId),
  create: (userId: string, input: unknown) => { const b=boardData(input); return repo.create(userId,b.title,b.description); },
  async detail(boardId: number, userId: string) { const board=await boardAccess(boardId,userId); return {...board,is_owner:board.owner_id===userId,...await repo.detail(boardId)}; },
  async update(boardId: number, userId: string, input: unknown) { await boardAccess(boardId,userId,true); const b=boardData(input); return repo.update(boardId,b.title,b.description); },
  async remove(boardId: number, userId: string) { await boardAccess(boardId,userId,true); await deleteBoardData(boardId); },
  async addMember(boardId: number,userId: string,input: unknown) { const board=await boardAccess(boardId,userId,true);const user=await repo.findUser(email(object(input).email));if(!user)return fail(404,'Usuario no encontrado');if(user.user_id===board.owner_id)return fail(409,'El dueño ya pertenece al tablero');await repo.addMember(boardId,String(user.user_id));return user; },
  async removeMember(boardId: number,userId: string,target: string) { const board=await boardAccess(boardId,userId);if(target===board.owner_id)return fail(400,'No se puede retirar al dueño');if(target!==userId&&board.owner_id!==userId)return fail(403,'Solo el dueño puede retirar a otros miembros');await repo.removeMember(boardId,target); },
  async createColumn(boardId: number,userId: string,input: unknown) { await boardAccess(boardId,userId);return repo.createColumn(boardId,text(object(input).title,'Título')); },
  async updateColumn(boardId: number,columnId: number,userId: string,input: unknown) { await boardAccess(boardId,userId);const row=await repo.updateColumn(boardId,columnId,text(object(input).title,'Título'));if(!row)return fail(404,'Columna no encontrada');return row; },
  async removeColumn(boardId: number,columnId: number,userId: string) { await boardAccess(boardId,userId);await deleteColumnData(boardId,columnId); },
  async createCard(boardId: number,columnId: number,userId: string,input: unknown) { await boardAccess(boardId,userId);const row=await repo.createCard(boardId,columnId,cardData(object(input)));if(!row)return fail(404,'Columna no encontrada');return row; },
  async updateCard(boardId: number,cardId: number,userId: string,input: unknown) { await checkCard(boardId,cardId,userId);const body=object(input);const row=await repo.updateCard(boardId,cardId,id(body.column_id),cardData(body));if(!row)return fail(400,'Columna inválida');return row; },
  async removeCard(boardId: number,cardId: number,userId: string) { await checkCard(boardId,cardId,userId);await deleteCardData(cardId); },
  async assign(boardId: number,cardId: number,userId: string,input: unknown) { await checkCard(boardId,cardId,userId);const users=object(input).user_ids;if(!Array.isArray(users)||users.some(u=>typeof u!=='string')||new Set(users).size!==users.length)return fail(400,'Responsables inválidos');await repo.replaceAssignments(boardId,cardId,users); },
};

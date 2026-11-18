import { randomBytes } from 'node:crypto';
import { database } from '../../config/database.js';
import { fail } from '../../shared/errors.js';
import { object } from '../../shared/validation.js';
import { boardAccess } from '../boards/repository.js';
import { sendNotifications } from '../notifications/service.js';

function codeFrom(input: unknown) {
  const value=object(input).code;
  if(typeof value!=='string' || !/^[a-f0-9]{64}$/.test(value)) return fail(400,'Código QR inválido');
  return value;
}
const createCode=()=>randomBytes(32).toString('hex');
export const invitationService = {
  async getCode(boardId:number, actor:string) {
    await boardAccess(boardId,actor,true);
    await database().execute({sql:'INSERT INTO board_invites(board_id,code) VALUES (?,?) ON CONFLICT(board_id) DO NOTHING',args:[boardId,createCode()]});
    const result=await database().execute({sql:'SELECT code FROM board_invites WHERE board_id=?',args:[boardId]});
    return {code:String(result.rows[0].code)};
  },
  async rotate(boardId:number, actor:string) {
    await boardAccess(boardId,actor,true); const code=createCode();
    await database().execute({sql:'INSERT INTO board_invites(board_id,code) VALUES (?,?) ON CONFLICT(board_id) DO UPDATE SET code=excluded.code',args:[boardId,code]});
    return {code};
  },
  async preview(actor:string,input:unknown) {
    const code=codeFrom(input);
    const result=await database().execute({sql:`SELECT b.board_id,b.title,b.owner_id,EXISTS(SELECT 1 FROM board_members m WHERE m.board_id=b.board_id AND m.user_id=?) AS member,EXISTS(SELECT 1 FROM join_requests r WHERE r.board_id=b.board_id AND r.user_id=? AND r.status='pending') AS pending FROM board_invites i JOIN boards b ON b.board_id=i.board_id WHERE i.code=?`,args:[actor,actor,code]});
    const row=result.rows[0];if(!row)return fail(404,'Código QR inválido o vencido');
    return {board_id:Number(row.board_id),title:String(row.title),status:row.owner_id===actor || Number(row.member) ? 'member' : Number(row.pending) ? 'pending' : 'available'};
  },
  async submit(actor:string,input:unknown) {
    const code=codeFrom(input),tx=await database().transaction('write');let notificationId:number;
    try {
      const result=await tx.execute({sql:`SELECT b.board_id,b.title,b.owner_id,u.username FROM board_invites i JOIN boards b ON b.board_id=i.board_id JOIN users u ON u.user_id=? WHERE i.code=?`,args:[actor,code]});
      const row=result.rows[0];if(!row)return fail(404,'Código QR inválido o vencido');
      if(row.owner_id===actor || (await tx.execute({sql:'SELECT 1 FROM board_members WHERE board_id=? AND user_id=?',args:[Number(row.board_id),actor]})).rows.length) return fail(409,'Ya perteneces al tablero');
      if((await tx.execute({sql:"SELECT 1 FROM join_requests WHERE board_id=? AND user_id=? AND status='pending'",args:[Number(row.board_id),actor]})).rows.length) return fail(409,'Ya tienes una solicitud pendiente');
      await tx.execute({sql:"INSERT INTO join_requests(board_id,user_id,status) VALUES (?,?,'pending')",args:[Number(row.board_id),actor]});
      const n=await tx.execute({sql:"INSERT INTO notifications(user_id,board_id,kind,message) VALUES (?,?,'join_requested',?) RETURNING notification_id",args:[String(row.owner_id),Number(row.board_id),`${row.username} solicita unirse a ${row.title}`]});
      notificationId=Number(n.rows[0].notification_id);await tx.commit();
    } catch(e) {await tx.rollback();throw e;} finally {tx.close();}
    await sendNotifications([notificationId]);
  },
  async list(boardId:number,actor:string) {
    await boardAccess(boardId,actor,true);
    return (await database().execute({sql:"SELECT r.request_id,r.user_id,u.username,u.email,r.created_at FROM join_requests r JOIN users u ON u.user_id=r.user_id WHERE r.board_id=? AND r.status='pending' ORDER BY r.request_id",args:[boardId]})).rows;
  },
  async decide(boardId:number,requestId:number,actor:string,input:unknown) {
    const action=object(input).decision;if(action!=='accept' && action!=='reject')return fail(400,'Decisión inválida');
    const tx=await database().transaction('write');let notificationId:number;
    try {
      const found=await tx.execute({sql:`SELECT r.user_id,b.title FROM join_requests r JOIN boards b ON b.board_id=r.board_id WHERE r.request_id=? AND r.board_id=? AND r.status='pending' AND b.owner_id=?`,args:[requestId,boardId,actor]});
      const row=found.rows[0];if(!row)return fail(404,'Solicitud no encontrada o ya resuelta');
      const updated=await tx.execute({sql:"UPDATE join_requests SET status=?,resolved_at=CURRENT_TIMESTAMP WHERE request_id=? AND status='pending'",args:[action==='accept'?'accepted':'rejected',requestId]});
      if(!updated.rowsAffected)return fail(409,'La solicitud ya fue resuelta');
      if(action==='accept') await tx.execute({sql:'INSERT INTO board_members(board_id,user_id) VALUES (?,?)',args:[boardId,String(row.user_id)]});
      const n=await tx.execute({sql:'INSERT INTO notifications(user_id,board_id,kind,message) VALUES (?,?,?,?) RETURNING notification_id',args:[String(row.user_id),boardId,action==='accept'?'join_accepted':'join_rejected',action==='accept'?`Aceptaron tu solicitud para ${row.title}`:`Rechazaron tu solicitud para ${row.title}`]});
      notificationId=Number(n.rows[0].notification_id);await tx.commit();
    } catch(e) {await tx.rollback();throw e;} finally {tx.close();}
    await sendNotifications([notificationId]);
  },
};

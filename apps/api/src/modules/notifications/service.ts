import { database } from '../../config/database.js';
import { fail } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import { object } from '../../shared/validation.js';

function pushToken(input: unknown) {
  const value = object(input).token;
  if (typeof value !== 'string' || !/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/.test(value) || value.length > 255) return fail(400, 'Token de dispositivo inválido');
  return value;
}
export const notificationsService = {
  async register(userId: string, input: unknown) {
    await database().execute({sql: `INSERT INTO push_devices(token,user_id) VALUES (?,?) ON CONFLICT(token) DO UPDATE SET user_id=excluded.user_id, updated_at=CURRENT_TIMESTAMP`, args:[pushToken(input),userId]});
  },
  async unregister(userId: string, input: unknown) {
    await database().execute({sql:'DELETE FROM push_devices WHERE token=? AND user_id=?',args:[pushToken(input),userId]});
  },
  async list(userId: string) {
    return (await database().execute({sql:'SELECT notification_id,board_id,kind,message,created_at,read_at FROM notifications WHERE user_id=? ORDER BY notification_id DESC',args:[userId]})).rows;
  },
  async read(userId: string, notificationId: number) {
    const result=await database().execute({sql:'UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE notification_id=? AND user_id=?',args:[notificationId,userId]});
    if (!result.rowsAffected) return fail(404,'Notificación no encontrada');
  },
};

// Se espera el intento antes de responder: Vercel puede detener tareas no esperadas.
export async function sendNotifications(notificationIds: number[]) {
  if (!notificationIds.length) return;
  try {
    const result=await database().execute({sql:`SELECT n.notification_id,n.board_id,d.token FROM notifications n JOIN push_devices d ON d.user_id=n.user_id WHERE n.notification_id IN (${notificationIds.map(()=>'?').join(',')})`,args:notificationIds});
    for (let i=0;i<result.rows.length;i+=100) {
      const rows=result.rows.slice(i,i+100);
      const response=await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rows.map(row=>({to:row.token,title:'Mindlog',body:'Tienes una nueva notificación.',sound:'default',data:{notificationId:Number(row.notification_id),boardId:Number(row.board_id)}}))),signal:AbortSignal.timeout(5000)});
      if (!response.ok) { logger.warn({status:response.status},'Falló el envío push'); continue; }
      const body=await response.json() as {data?: {status?:string;details?:{error?:string}}[]};
      if (!Array.isArray(body.data)) { logger.warn('Respuesta push inválida'); continue; }
      for (let j=0;j<body.data.length;j++) {
        if (body.data[j].status === 'error') {
          if (body.data[j].details?.error === 'DeviceNotRegistered' && rows[j]) await database().execute({sql:'DELETE FROM push_devices WHERE token=?',args:[String(rows[j].token)]});
          else logger.warn({reason:body.data[j].details?.error},'Expo rechazó una notificación');
        }
      }
    }
  } catch { logger.warn('No se pudo enviar la notificación push'); }
}

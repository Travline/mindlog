import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJSDoc from 'swagger-jsdoc';

const localRoot = dirname(dirname(fileURLToPath(import.meta.url)));
// En el build local se leen los .js compilados. En Vercel se incluyen los .ts
// originales porque los comentarios JSDoc se necesitan al iniciar la función.
const roots = [localRoot, join(process.cwd(), 'src'), join(process.cwd(), 'build')];
const source = roots.flatMap(root => ['ts', 'js'].map(extension => ({ root, extension })))
  .find(({ root, extension }) => existsSync(join(root, `app.${extension}`)));
if (!source) throw new Error('No se encontraron los archivos con documentación OpenAPI');

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const string = { type: 'string' };
const uuid = { type: 'string', format: 'uuid' };
const integer = { type: 'integer', minimum: 1 };
const nullableString = { type: 'string', nullable: true };
const title = { type: 'string', minLength: 1, maxLength: 200 };
const email = { type: 'string', format: 'email', maxLength: 254 };
const password = { type: 'string', minLength: 8, maxLength: 128, format: 'password' };
const object = (properties: Record<string, unknown>, required: string[] = []) => ({ type: 'object', properties, ...(required.length ? { required } : {}) });
const array = (items: unknown) => ({ type: 'array', items });
const boardFields = { board_id: integer, title, description: nullableString, owner_id: uuid, created_at: string, is_owner: { oneOf: [{type:'boolean'}, {type:'integer', enum:[0,1]}] } };
const cardFields = { title, description: nullableString, priority: { type: 'string', enum: ['Baja', 'Media', 'Alta'], default: 'Media' }, due_date: { type: 'string', format: 'date', nullable: true } };

export const openapi = swaggerJSDoc({
  failOnErrors: true,
  definition: {
    openapi: '3.0.3',
    info: { title: 'Mindlog API', version: '1.0.0', description: 'API para cuentas y tableros Kanban compartidos.' },
    servers: [{ url: '/', description: 'Servidor actual' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        Error: object({error: string}, ['error']),
        Health: object({status: {type:'string', enum:['ok']}}, ['status']),
        User: object({user_id:uuid, username:{type:'string',maxLength:100}, email}, ['user_id','username','email']),
        Member: object({user_id:uuid, username:string, email, is_owner:{type:'integer',enum:[0,1]}}, ['user_id','username','email','is_owner']),
        AuthResult: object({token:string, user:ref('User')}, ['token','user']),
        RegisterInput: object({username:{type:'string',maxLength:100},email,password}, ['username','email','password']),
        LoginInput: object({email,password:{...password,minLength:1}}, ['email','password']),
        ProfileInput: object({username:{type:'string',maxLength:100},email}, ['username','email']),
        Board: object(boardFields, ['board_id','title','description','owner_id','created_at']),
        BoardInput: object({title,description:nullableString}, ['title']),
        MemberInput: object({email}, ['email']),
        Column: object({column_id:integer,board_id:integer,title}, ['column_id','board_id','title']),
        ColumnInput: object({title}, ['title']),
        Card: object({card_id:integer,column_id:integer,...cardFields,created_at:string}, ['card_id','column_id','title','description','priority','due_date','created_at']),
        CardInput: object(cardFields, ['title']),
        CardUpdateInput: object({...cardFields,column_id:integer}, ['title','column_id']),
        AssignmentsInput: object({user_ids:array(uuid)}, ['user_ids']),
        Assignment: object({card_id:integer,user_id:uuid}, ['card_id','user_id']),
        BoardDetail: object({...boardFields, members:array(ref('Member')),columns:array(ref('Column')),cards:array(ref('Card')),assignments:array(ref('Assignment'))}, ['board_id','title','owner_id','is_owner','members','columns','cards','assignments']),
      },
    },
  },
  apis: [join(source.root, `**/*.${source.extension}`)],
});
const paths = (openapi as { paths?: Record<string, unknown> }).paths;
if (!paths || !paths['/health']) {
  throw new Error('No se pudo generar la especificación OpenAPI');
}

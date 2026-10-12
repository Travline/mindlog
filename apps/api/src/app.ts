import express from 'express';
import authRouter from '@/modules/auth';
import boardRouter from '@/modules/boards';
import { authenticate } from '@/shared/middlewares/auth-user';
import { httpContextMiddleware } from '@/shared/logger/http-logger.middleware';
import { expressErrorMiddleware } from './shared/error-handling/express-error-handling';

const app = express();

app.use(express.json());

app.use(httpContextMiddleware);

app.use('/auth', authRouter);
app.use('/boards', authenticate, boardRouter);

app.use(expressErrorMiddleware);

export default app;
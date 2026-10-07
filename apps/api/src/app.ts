import express from 'express';
import authRouter from '@/modules/auth';
import { httpContextMiddleware } from '@/shared/logger/http-logger.middleware';
import { expressErrorMiddleware } from './shared/error-handling/express-error-handling';

const app = express();

app.use(express.json());

app.use(httpContextMiddleware)

app.use('/auth', authRouter);

app.use(expressErrorMiddleware)

export default app;
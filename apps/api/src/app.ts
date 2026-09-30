import express from 'express';
import userRouter from '@/modules/auth/user-controller';

const app = express();

app.use(express.json());

app.use('/users', userRouter);

export default app;
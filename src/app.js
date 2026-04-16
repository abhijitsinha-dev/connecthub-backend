import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

/**@type {import('express').Application} */
const app = express();
const allowedOrigin = process.env.CORS_ORIGIN;

// Middlewares
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(/** @type {import('express').RequestHandler} */ (cookieParser()));

// Import and use the auth router
import authRouter from './modules/auth/auth.route.js';
import mediaRouter from './modules/media/media.route.js';
import userRouter from './modules/user/user.route.js';
import postRouter from './modules/post/post.route.js';
import interactionRouter from './modules/interaction/like.route.js';
import followRouter from './modules/follow/follow.route.js';
import commentRouter from './modules/comment/comment.route.js';
import seedRouter from './modules/seed/seed.route.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/interaction', interactionRouter);
app.use('/api/v1/follows', followRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/seed', seedRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

import errorHandler from './middlewares/errorHandler.js';
import healthCheck from './controllers/healthcheck.controller.js';
app.get('/api/v1/health', healthCheck);
app.use(errorHandler);

export default app;

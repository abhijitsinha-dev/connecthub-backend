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
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

import errorHandler from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;

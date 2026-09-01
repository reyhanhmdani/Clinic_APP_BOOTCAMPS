import express from 'express';
import { logger } from './middlewares/logger.js';
import mainRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

// pasang listener koneksi socket
io.on('connection', (socket) => {
  console.log('Client terhubung via socket', socket.id);
  socket.on('disconnect', () => {
    console.log('Client terputus', socket.id);
  });
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use('/api/v1', mainRouter);
app.use(errorMiddleware);

httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

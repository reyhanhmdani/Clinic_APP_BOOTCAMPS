import express from 'express';
import { logger } from './middlewares/logger.js';
import mainRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 3000;

// Daftar origin yang diizinkan (Lokal + Frontend Vercel nanti)
const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean) as string[];

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Izinkan akses tanpa origin (Postman/Curl) atau jika dari Vercel / Localhost
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use('/api/v1', mainRouter);
app.use(errorMiddleware);

// httpServer.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});

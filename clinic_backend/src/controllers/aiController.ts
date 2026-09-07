import { Request, Response, NextFunction } from 'express';
import { askReyAiService } from '../services/aiService.js';

export const customerAiChatController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        message: 'Pesan pertanyaan wajib diisi.',
      });
    }

    // Nama pasien bila tersedia di sesi login
    const patientName = (req as any).user?.name || (req as any).user?.username || undefined;

    const result = await askReyAiService({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      patientName,
    });

    return res.status(200).json({
      message: 'Berhasil mendapatkan respon dari ReyAI',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

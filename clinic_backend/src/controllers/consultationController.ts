import { Request, Response, NextFunction } from 'express';
import { getAllConsultationService } from '../services/consultationService.js';

export const getAllConsultationController = async (req: Request, res: Response, next: NextFunction) => {
  const consultations = await getAllConsultationService();

  return res.status(200).json({
    data: consultations,
  });
};

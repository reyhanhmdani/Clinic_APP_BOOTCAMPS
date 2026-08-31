import { Request, Response, NextFunction } from 'express';
import { getPharmacyQueueService, dispenseMedicineService } from '../services/pharmacyService.js';

export const getPharmacyQueueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPharmacyQueueService();
    return res.status(200).json({
      message: 'Berhasil mengambil antrian farmasi',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const dispenseMedicineController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consultationId } = req.params;
    const data = await dispenseMedicineService(Number(consultationId));

    return res.status(200).json({
      message: 'Obat berhasil di serahkan kepada pasien',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

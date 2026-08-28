import { Request, Response, NextFunction } from 'express';
import {
  bookCustomerVisitService,
  createVisitService,
  getActiveCustomerVisitService,
  getAllVisitService,
  getVisitByIdService,
  updateVisitService,
} from '../services/visitService.js';

export const getAllVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visits = await getAllVisitService();

    return res.status(200).json({
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

export const createVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createVisit = await createVisitService(req.body);

    return res.status(201).json({
      message: `Berhasil Membuat Data baru dengan Id ${createVisit.id}`,
      data: createVisit,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idVisit } = req.params;
    const getVisit = await getVisitByIdService(Number(idVisit));

    return res.status(200).json({
      message: `Berhasil mengambil data Visit dengan Id ${getVisit.id}`,
      data: getVisit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idVisit } = req.params;

    const updateVisit = await updateVisitService(Number(idVisit), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data Visit dengan Id ${updateVisit.id}`,
      data: updateVisit,
    });
  } catch (error) {
    next(error);
  }
};

// CUSTOMERS
export const bookCustomerVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'Silahkan pilih dokter yang bertugas' });
    }

    const visit = await bookCustomerVisitService(userId, Number(doctorId));
    return res.status(201).json({
      message: 'Berhasil mendaftarkan antrian dokter',
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveCustomerVisitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const activeData = await getActiveCustomerVisitService(userId);

    return res.status(200).json({
      message: activeData ? 'Antrian aktif ditemukan' : 'Tidak ada antrian aktif saat ini',
      data: activeData,
    });
  } catch (error) {
    next(error);
  }
};

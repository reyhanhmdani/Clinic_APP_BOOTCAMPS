import { Request, Response, NextFunction } from 'express';
import {
  checkNikService,
  createPatientService,
  deletePatientService,
  getAllPatientsService,
  getCustomerHistoryService,
  getMyProfileService,
  getPatientByIdService,
  getPatientHistoryService,
  registerPatientProfileService,
  updatePatientService,
} from '../services/patientService.js';

export const getAllPatientsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await getAllPatientsService();

    return res.status(200).json({
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const createPatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createPatient = await createPatientService(req.body);

    return res.status(201).json({
      message: `Data Pasien dengan Nama ${createPatient.name} Sudah Berhasil di Buat`,
      data: createPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const getPatientById = await getPatientByIdService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil mengambil data pasien dengan id ${getPatientById.id}`,
      data: getPatientById,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;
    const updatePatient = await updatePatientService(Number(idPatient), req.body);

    return res.status(200).json({
      message: `Berhasil mengUpdate data pasien dengan Id ${updatePatient.id}`,
      data: updatePatient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const deletePatient = await deletePatientService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil menghapus pasien dengan id ${deletePatient.id}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientHistoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;
    const history = await getPatientHistoryService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil mengambil riwayat rekam medis pasien`,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// CUSTOMERS

export const checkNikController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nik } = req.params;
    const result = await checkNikService(nik as string);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const registerPatientProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ambil user id dari token jtw yang sudah di decode oleh middleware authentication
    const userId = (req as any).user.id;

    const patient = await registerPatientProfileService(userId, req.body);

    return res.status(201).json({
      message: 'Profil data pasien berhasil didaftarkan dan terhubung ke akun anda',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getMyProfileService(userId);

    return res.status(200).json({
      message: profile ? 'Profile pasien berhasil diambil' : 'Profil pasien belum dilengkapi',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// CUSTOMERS
export const getCustomerHistoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const history = await getCustomerHistoryService(userId);

    return res.status(200).json({
      message: 'Berhasil mengambil riwayat kunjungan dan resep medis',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

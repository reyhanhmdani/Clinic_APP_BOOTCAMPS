import { Request, Response, NextFunction } from 'express';
import {
  createPatientService,
  deletePatientService,
  getAllPatientsService,
  getPatientByIdService,
  updatePatientService,
} from '../services/patientService.js';

export const getAllPatientsController = async (req: Request, res: Response, next: NextFunction) => {
  const patients = await getAllPatientsService();

  return res.status(200).json({
    data: patients,
  });
};

export const createPatientController = async (req: Request, res: Response, next: NextFunction) => {
  const createPatient = await createPatientService(req.body);

  return res.status(201).json({
    message: `Data Patient dengan Nama ${createPatient.name} Sudah Berhasil di Buat`,
    data: createPatient,
  });
};

export const getPatientByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const getPatiendById = await getPatientByIdService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil mengambil data pasien dengan id ${getPatiendById.id}`,
      data: getPatiendById,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;
    const updatePatient = await updatePatientService(Number(idPatient), req.body);

    return res.status(201).json({
      message:  `Berhasil mengUpdate data medicine dengan Id ${updatePatient.id}`,
      data: updatePatient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatienController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idPatient } = req.params;

    const deletePatient = await deletePatientService(Number(idPatient));

    return res.status(200).json({
      message: `Berhasil menghapus pasient dengan id ${deletePatient.id}`,
    });
  } catch (error) {
    next(error);
  }
};

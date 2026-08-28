import { getUserService, loginService, registerService } from '../services/authServices.js';
import { Request, Response, NextFunction } from 'express';

export const getUserControler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUserService();

    return res.status(200).json({
      message: 'Berhasil mengambil data User',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await registerService(req.body);

    return res.status(201).json({
      message: 'Berhasil mendaftart sebagai Customer',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

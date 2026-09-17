import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const sendSuccess = (
  res: Response,
  statusCode: StatusCodes,
  message: string,
  data?: any
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: StatusCodes,
  message: string,
  errors?: any
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
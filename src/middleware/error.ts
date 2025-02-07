import { Request, Response, NextFunction } from "express";
import { HttpException } from "../ultils/http-exception";

interface CustomError extends Error {
  statusCode?: number;
  stack?: string;
}

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof HttpException ? err.status : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };

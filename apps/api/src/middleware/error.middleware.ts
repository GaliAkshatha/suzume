import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
}

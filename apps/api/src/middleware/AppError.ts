export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Resource not found") {
    return new AppError(404, message, "NOT_FOUND");
  }
  static conflict(message: string) {
    return new AppError(409, message, "CONFLICT");
  }
}

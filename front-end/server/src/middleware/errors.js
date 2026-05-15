import { HttpError } from "../utils/http.js";

export function notFound(req, res, next) {
  next(new HttpError(404, "Not Found"));
}

export function errorHandler(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal Server Error";
  res.status(status).json({ ok: false, message });
}

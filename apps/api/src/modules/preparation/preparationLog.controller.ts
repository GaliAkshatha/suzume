import { Request, Response } from "express";
import * as service from "./preparationLog.service";

export async function listHandler(req: Request, res: Response) {
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const logs = await service.listLogs(req.user!.userId, from, to);
  res.json({ logs });
}

export async function createHandler(req: Request, res: Response) {
  const log = await service.createLog(req.user!.userId, req.body);
  res.status(201).json({ log });
}

export async function updateHandler(req: Request, res: Response) {
  const log = await service.updateLog(req.user!.userId, req.params.id, req.body);
  res.json({ log });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteLog(req.user!.userId, req.params.id);
  res.status(204).send();
}

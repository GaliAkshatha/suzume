import { Request, Response } from "express";
import * as service from "./actionItem.service";

export async function createHandler(req: Request, res: Response) {
  const item = await service.createActionItem(req.user!.userId, req.params.learningId, req.body);
  res.status(201).json({ actionItem: item });
}

export async function updateHandler(req: Request, res: Response) {
  const item = await service.updateActionItem(req.user!.userId, req.params.id, req.body);
  res.json({ actionItem: item });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteActionItem(req.user!.userId, req.params.id);
  res.status(204).send();
}

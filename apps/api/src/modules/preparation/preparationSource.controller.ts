import { Request, Response } from "express";
import * as service from "./preparationSource.service";

export async function listHandler(req: Request, res: Response) {
  const sources = await service.listSources(req.user!.userId);
  res.json({ sources });
}

export async function createHandler(req: Request, res: Response) {
  const source = await service.addSource(req.user!.userId, req.body);
  res.status(201).json({ source });
}

export async function refreshHandler(req: Request, res: Response) {
  const source = await service.syncSource(req.user!.userId, req.params.id);
  res.json({ source });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.removeSource(req.user!.userId, req.params.id);
  res.status(204).send();
}

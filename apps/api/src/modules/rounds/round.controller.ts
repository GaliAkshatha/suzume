import { Request, Response } from "express";
import * as service from "./round.service";

export async function listHandler(req: Request, res: Response) {
  const rounds = await service.listRounds(req.user!.userId, req.params.applicationId);
  res.json({ rounds });
}

export async function createHandler(req: Request, res: Response) {
  const round = await service.createRound(req.user!.userId, req.params.applicationId, req.body);
  res.status(201).json({ round });
}

export async function getHandler(req: Request, res: Response) {
  const round = await service.getRound(req.user!.userId, req.params.id);
  res.json({ round });
}

export async function updateHandler(req: Request, res: Response) {
  const round = await service.updateRound(req.user!.userId, req.params.id, req.body);
  res.json({ round });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteRound(req.user!.userId, req.params.id);
  res.status(204).send();
}

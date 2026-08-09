import { Request, Response } from "express";
import * as service from "./experience.service";

export async function createHandler(req: Request, res: Response) {
  const experience = await service.createExperience(req.user!.userId, req.params.roundId, req.body);
  res.status(201).json({ experience });
}

export async function listHandler(req: Request, res: Response) {
  const experiences = await service.listExperiences(req.user!.userId);
  res.json({ experiences });
}

export async function getHandler(req: Request, res: Response) {
  const experience = await service.getExperience(req.user!.userId, req.params.id);
  res.json({ experience });
}

export async function updateHandler(req: Request, res: Response) {
  const experience = await service.updateExperience(req.user!.userId, req.params.id, req.body);
  res.json({ experience });
}

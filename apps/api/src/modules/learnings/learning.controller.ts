import { Request, Response } from "express";
import * as service from "./learning.service";

export async function listHandler(req: Request, res: Response) {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const learnings = await service.listLearnings(req.user!.userId, category);
  res.json({ learnings });
}

export async function getHandler(req: Request, res: Response) {
  const learning = await service.getLearning(req.user!.userId, req.params.id);
  res.json({ learning });
}

export async function createHandler(req: Request, res: Response) {
  const learning = await service.createLearning(req.user!.userId, req.body);
  res.status(201).json({ learning });
}

export async function updateHandler(req: Request, res: Response) {
  const learning = await service.updateLearning(req.user!.userId, req.params.id, req.body);
  res.json({ learning });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteLearning(req.user!.userId, req.params.id);
  res.status(204).send();
}

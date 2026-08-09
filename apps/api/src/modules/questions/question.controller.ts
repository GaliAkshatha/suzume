import { Request, Response } from "express";
import * as service from "./question.service";

export async function createHandler(req: Request, res: Response) {
  const question = await service.createQuestion(req.user!.userId, req.params.experienceId, req.body);
  res.status(201).json({ question });
}

export async function updateHandler(req: Request, res: Response) {
  const question = await service.updateQuestion(req.user!.userId, req.params.id, req.body);
  res.json({ question });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteQuestion(req.user!.userId, req.params.id);
  res.status(204).send();
}

import { Request, Response } from "express";
import * as service from "./application.service";

export async function listHandler(req: Request, res: Response) {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const applications = await service.listApplications(req.user!.userId, status);
  res.json({ applications });
}

export async function getHandler(req: Request, res: Response) {
  const application = await service.getApplication(req.user!.userId, req.params.id);
  res.json({ application });
}

export async function createHandler(req: Request, res: Response) {
  const application = await service.createApplication(req.user!.userId, req.body);
  res.status(201).json({ application });
}

export async function updateHandler(req: Request, res: Response) {
  const application = await service.updateApplication(req.user!.userId, req.params.id, req.body);
  res.json({ application });
}

export async function deleteHandler(req: Request, res: Response) {
  await service.deleteApplication(req.user!.userId, req.params.id);
  res.status(204).send();
}

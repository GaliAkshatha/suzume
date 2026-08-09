import { Request, Response } from "express";
import * as service from "./preparation.service";
import * as activityService from "./preparationActivity.service";

export async function listHandler(req: Request, res: Response) {
  const preparation = await service.listPreparation(req.user!.userId);
  res.json({ preparation });
}

export async function activityHandler(req: Request, res: Response) {
  const activity = await activityService.getActivity(req.user!.userId);
  res.json(activity);
}

export async function updateHandler(req: Request, res: Response) {
  const preparation = await service.updatePreparation(req.user!.userId, req.params.topicId, req.body);
  res.json({ preparation });
}

export async function createTopicHandler(req: Request, res: Response) {
  const topic = await service.createTopic(req.user!.userId, req.body);
  res.status(201).json({ topic });
}

export async function deleteTopicHandler(req: Request, res: Response) {
  await service.deleteTopic(req.user!.userId, req.params.topicId);
  res.status(204).send();
}

export async function setupHandler(req: Request, res: Response) {
  await service.completeSetup(req.user!.userId, req.body);
  res.status(200).json({ message: "Preparation setup saved" });
}

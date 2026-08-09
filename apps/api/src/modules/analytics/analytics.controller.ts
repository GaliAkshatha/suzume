import { Request, Response } from "express";
import * as service from "./analytics.service";

export async function overviewHandler(req: Request, res: Response) {
  const overview = await service.getAnalyticsOverview(req.user!.userId);
  res.json(overview);
}

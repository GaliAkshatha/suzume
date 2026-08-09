import { Request, Response } from "express";
import * as service from "./dashboard.service";

export async function summaryHandler(req: Request, res: Response) {
  const summary = await service.getDashboardSummary(req.user!.userId);
  res.json(summary);
}

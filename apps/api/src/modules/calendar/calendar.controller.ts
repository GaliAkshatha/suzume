import { Request, Response } from "express";
import * as service from "./calendar.service";

export async function listHandler(req: Request, res: Response) {
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const events = await service.getCalendarEvents(req.user!.userId, from, to);
  res.json({ events });
}

import { Request, Response } from "express";
import * as service from "./extraction.service";

export async function parseHandler(req: Request, res: Response) {
  const result = await service.extractFromText(req.user!.userId, req.body.text);
  res.json({ result });
}

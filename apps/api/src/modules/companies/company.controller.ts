import { Request, Response } from "express";
import * as service from "./company.service";

export async function listHandler(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const companies = await service.listCompanies(search);
  res.json({ companies });
}

export async function getHandler(req: Request, res: Response) {
  const company = await service.getCompany(req.params.id);
  res.json({ company });
}

export async function createHandler(req: Request, res: Response) {
  const company = await service.createCompany(req.body);
  res.status(201).json({ company });
}

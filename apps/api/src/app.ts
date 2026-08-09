import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

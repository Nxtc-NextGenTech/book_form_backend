import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("combined"));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

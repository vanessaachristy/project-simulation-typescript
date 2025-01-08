import Fastify from "fastify";
import { ApiResponse } from "./types";
import routes from "./routes";

export const buildApp = (opts = {}) => {
  const app = Fastify(opts);

  app.get("/", async (_request, reply) => {
    return { success: true } as ApiResponse<null>;
  });

  app.register(routes);

  return app;
};

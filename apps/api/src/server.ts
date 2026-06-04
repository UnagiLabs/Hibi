import cors from "@fastify/cors";
import Fastify from "fastify";

import { config } from "./config.js";
import { checkDatabase } from "./db.js";
import { registerAlbumRoutes } from "./routes/albums.js";
import { registerMemoryViewRoutes } from "./routes/memory-views.js";
import { registerMessageRoutes } from "./routes/messages.js";

export function buildServer() {
  const server = Fastify({
    logger: {
      level: config.nodeEnv === "test" ? "silent" : "info"
    }
  });

  server.register(cors, {
    origin: true
  });

  server.get("/api/health", async () => {
    return {
      ok: true,
      service: "hibi-api",
      db: await checkDatabase()
    };
  });

  server.register(registerAlbumRoutes);
  server.register(registerMessageRoutes);
  server.register(registerMemoryViewRoutes);

  return server;
}

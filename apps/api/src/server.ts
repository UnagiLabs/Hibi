import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";

import { config } from "./config.js";
import { checkDatabase } from "./db.js";
import { checkMemWal } from "./memwal/client.js";
import { registerAlbumRoutes } from "./routes/albums.js";
import { registerMediaRoutes } from "./routes/media.js";
import { registerMemoryViewRoutes } from "./routes/memory-views.js";
import { registerMessageRoutes } from "./routes/messages.js";
import { registerRecallRoutes } from "./routes/recall.js";
import { registerAuthContextRoutes } from "./routes/auth-context.js";
import { checkSuiContract } from "./sui/client.js";

export function buildServer() {
  const server = Fastify({
    logger: {
      level: config.nodeEnv === "test" ? "silent" : "info"
    }
  });

  server.register(cors, {
    origin: true
  });
  server.register(multipart, {
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 1,
      fields: 4
    }
  });

  server.get("/api/health", async () => {
    return {
      ok: true,
      service: "hibi-api",
      db: await checkDatabase(),
      memwal: await checkMemWal(),
      sui: await checkSuiContract()
    };
  });

  server.register(registerAlbumRoutes);
  server.register(registerMediaRoutes);
  server.register(registerMessageRoutes);
  server.register(registerRecallRoutes);
  server.register(registerMemoryViewRoutes);
  server.register(registerAuthContextRoutes);

  return server;
}

import { config } from "./config.js";
import { buildServer } from "./server.js";

const server = buildServer();

try {
  const address = await server.listen({
    host: config.host,
    port: config.port
  });

  server.log.info({ address }, "Hibi API is listening");
} catch (error) {
  server.log.error(error, "Failed to start Hibi API");
  process.exit(1);
}

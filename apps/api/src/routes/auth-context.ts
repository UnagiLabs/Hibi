import type { FastifyInstance } from "fastify";

import { resolveFamilyContext } from "../family-context.js";

export async function registerAuthContextRoutes(server: FastifyInstance) {
  server.get<{ Querystring: { walletAddress?: string } }>(
    "/api/auth/context",
    async (request, reply) => {
      const contextResult = await resolveFamilyContext(request);

      if (!contextResult.ok) {
        return reply.status(contextResult.status).send({
          ok: false,
          error: contextResult.error
        });
      }

      return {
        ok: true,
        context: contextResult.context
      };
    }
  );
}

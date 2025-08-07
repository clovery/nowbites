import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import prisma from "../utils/prisma";

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result: {
      openid: string;
      nickName: string;
      iat: number;
      exp: number;
    } = await request.jwtVerify();
    if (result) {
      const userId = result.openid;

      // Find user by openid
      const user = await prisma.user.findUnique({
        where: { openid: userId },
      });

      request.user = {
        id: user?.id,
      };

      if (!user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
    }
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
}

export default fp(async function (fastify: FastifyInstance) {
  // 注册JWT认证中间件
  fastify.decorate("authenticate", authenticate);
});

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async function (fastify: FastifyInstance) {
  // 注册JWT认证中间件
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    // 开发模式下，如果没有Authorization头，使用默认用户
    const authHeader = request.headers.authorization;

    console.log('authHeader', authHeader);
    
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
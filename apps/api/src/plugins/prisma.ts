import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../utils/prisma.js';

export default fp(async function (fastify: FastifyInstance) {
  // Decorate fastify with prisma
  fastify.decorate('prisma', prisma);

  // Graceful shutdown
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
});

// Extend FastifyInstance to include prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
} 
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../utils/prisma';
import favoriteRoutes from './favorites';

// Get my recipes
export const getMyRecipes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.id;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    console.log('user', user);
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            nickName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send(recipes);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Route registration
export default async function myRoutes(fastify: FastifyInstance) {
  // Get user's recipes (authenticated)
  fastify.get(
    '/recipes',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get current user\'s recipes',
        tags: ['my']
      }
    },
    getMyRecipes
  );

  // Register favorite routes
  await fastify.register(favoriteRoutes);
}

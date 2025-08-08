import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../utils/prisma';

// Get user's favorite recipes
export const getMyFavorites = async (
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

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        recipe: {
          include: {
            user: {
              select: {
                id: true,
                nickName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send(favorites);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Remove a recipe from favorites
export const removeFavorite = async (
  request: FastifyRequest<{ Params: { recipeId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { recipeId } = request.params;
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

    // Check if the favorite exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId
        }
      }
    });

    if (!existingFavorite) {
      return reply.code(404).send({ error: 'Favorite not found' });
    }

    // Delete the favorite
    await prisma.userFavorite.delete({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId
        }
      }
    });

    return reply.send({ message: 'Favorite removed successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Route registration
export default async function favoriteRoutes(fastify: FastifyInstance) {
  // Get user's favorites (authenticated)
  fastify.get(
    '/favorites',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get current user\'s favorite recipes',
        tags: ['my'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                createdAt: { type: 'string' },
                recipe: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    coverImage: { type: 'string' },
                    cookingTime: { type: 'number' },
                    servings: { type: 'number' },
                    difficulty: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        nickName: { type: 'string' },
                        avatarUrl: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    getMyFavorites
  );

  // Remove a recipe from favorites (authenticated)
  fastify.delete(
    '/favorites/:recipeId',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Remove a recipe from user\'s favorites',
        tags: ['my'],
        params: {
          type: 'object',
          properties: {
            recipeId: { type: 'string' }
          },
          required: ['recipeId']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    },
    removeFavorite
  );
}

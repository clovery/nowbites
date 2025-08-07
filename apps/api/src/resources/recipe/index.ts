import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { parseMarkdownRecipe } from '@nowbites/parse-markdown-recipe';
import { prisma } from '../../utils/prisma';
import favoriteRecipe, { FavoriteRecipeParams } from './favorite';

// Recipe creation request interface
interface CreateRecipeRequest {
  title: string;
  description?: string;
  ingredients: any[];
  sauce: any[];
  steps: any[];
  tips: any[];
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  coverImage?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Recipe update request interface
interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  ingredients?: any[];
  sauce?: any[];
  steps?: any[];
  tips?: any[];
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  coverImage?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Create recipe
export const createRecipe = async (
  request: FastifyRequest<{ Body: CreateRecipeRequest }>,
  reply: FastifyReply
) => {
  try {
    const recipeData = request.body;
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Find user by openid
    const user = await prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        userId: user.id,
        ingredients: recipeData.ingredients,
        sauce: recipeData.sauce,
        steps: recipeData.steps,
        tips: recipeData.tips,
        tags: recipeData.tags || []
      },
      include: {
        user: {
          select: {
            id: true,
            nickName: true,
            avatarUrl: true
          }
        }
      }
    });

    return reply.code(201).send(recipe);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get all recipes (with pagination and filtering)
export const getRecipes = async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      search?: string;
      tags?: string;
      difficulty?: string;
      userId?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { page = '1', limit = '10', search, tags, difficulty, userId } = request.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.RecipeWhereInput = {
      isPublic: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',');
      where.tags = {
        hasSome: tagArray
      };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (userId) {
      where.userId = userId;
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickName: true,
              avatarUrl: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.recipe.count({ where })
    ]);

    return reply.send({
      recipes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get recipe by ID
export const getRecipe = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickName: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!recipe) {
      return reply.code(404).send({ error: 'Recipe not found' });
    }

    // Check if user can access private recipe
    if (!recipe.isPublic) {
      const userId = (request.user as any)?.openid;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { openid: userId }
      });

      if (!user || recipe.userId !== user.id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
    }

    return reply.send(recipe);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Update recipe
export const updateRecipe = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateRecipeRequest;
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updateData = request.body;
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Find user and recipe
    const [user, recipe] = await Promise.all([
      prisma.user.findUnique({
        where: { openid: userId }
      }),
      prisma.recipe.findUnique({
        where: { id }
      })
    ]);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    if (!recipe) {
      return reply.code(404).send({ error: 'Recipe not found' });
    }

    if (recipe.userId !== user.id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...updateData,
        ingredients: updateData.ingredients,
        sauce: updateData.sauce,
        steps: updateData.steps,
        tips: updateData.tips,
        tags: updateData.tags
      },
      include: {
        user: {
          select: {
            id: true,
            nickName: true,
            avatarUrl: true
          }
        }
      }
    });

    return reply.send(updatedRecipe);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Delete recipe
export const deleteRecipe = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Find user and recipe
    const [user, recipe] = await Promise.all([
      prisma.user.findUnique({
        where: { openid: userId }
      }),
      prisma.recipe.findUnique({
        where: { id }
      })
    ]);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    if (!recipe) {
      return reply.code(404).send({ error: 'Recipe not found' });
    }

    if (recipe.userId !== user.id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    await prisma.recipe.delete({
      where: { id }
    });

    return reply.code(204).send();
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get user's recipes
export const getUserRecipes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

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
export default async function recipeRoutes(fastify: FastifyInstance) {
  // Create recipe (authenticated)
  fastify.post<{ Body: CreateRecipeRequest }>(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Create a new recipe',
        tags: ['recipes'],
        body: {
          type: 'object',
          required: ['title', 'ingredients', 'sauce', 'steps', 'tips'],
          properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            ingredients: { type: 'array' },
            sauce: { type: 'array' },
            steps: { type: 'array' },
            tips: { type: 'array' },
            cookingTime: { type: 'number', minimum: 1 },
            servings: { type: 'number', minimum: 1 },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            imageUrl: { type: 'string' },
            coverImage: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean' }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              ingredients: { type: 'array' },
              sauce: { type: 'array' },
              steps: { type: 'array' },
              tips: { type: 'array' },
              cookingTime: { type: 'number' },
              servings: { type: 'number' },
              difficulty: { type: 'string' },
              imageUrl: { type: 'string' },
              coverImage: { type: 'string' },
              tags: { type: 'array' },
              isPublic: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
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
    },
    createRecipe
  );

  // Get all recipes (public)
  fastify.get<{ Querystring: any }>(
    '/',
    {
      schema: {
        description: 'Get all public recipes with pagination and filtering',
        tags: ['recipes'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'string' },
            limit: { type: 'string' },
            search: { type: 'string' },
            tags: { type: 'string' },
            difficulty: { type: 'string' },
            userId: { type: 'string' }
          }
        }
      }
    },
    getRecipes
  );

  // Get recipe by ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        description: 'Get recipe by ID',
        tags: ['recipes'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    getRecipe
  );

  // Update recipe (authenticated)
  fastify.put<{ Params: { id: string }; Body: UpdateRecipeRequest }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Update recipe',
        tags: ['recipes'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            ingredients: { type: 'array' },
            sauce: { type: 'array' },
            steps: { type: 'array' },
            tips: { type: 'array' },
            cookingTime: { type: 'number', minimum: 1 },
            servings: { type: 'number', minimum: 1 },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            imageUrl: { type: 'string' },
            coverImage: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            isPublic: { type: 'boolean' }
          }
        }
      }
    },
    updateRecipe
  );

  // Delete recipe (authenticated)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Delete recipe',
        tags: ['recipes'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    deleteRecipe
  );

  // Get user's recipes (authenticated)
  fastify.get(
    '/my',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get current user\'s recipes',
        tags: ['recipes']
      }
    },
    getUserRecipes
  );

  fastify.post<{ Params: FavoriteRecipeParams }>('/:id/favorite', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Favorite a recipe',
      tags: ['recipes']
    }
  }, favoriteRecipe);



  // Parse markdown recipe (authenticated)
  fastify.post<{ Body: { markdown: string } }>(
    '/parse-markdown',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Parse markdown recipe content',
        tags: ['recipes'],
        body: {
          type: 'object',
          required: ['markdown'],
          properties: {
            markdown: { type: 'string', minLength: 1 }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              recipe: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  ingredients: { type: 'object' },
                  sauce: { type: 'array' },
                  steps: { type: 'array' },
                  tips: { type: 'array' },
                  cookingTime: { type: 'number' },
                  servings: { type: 'number' },
                  difficulty: { type: 'string' },
                  tags: { type: 'array' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { markdown } = request.body;
        
       
        // Parse the markdown
        const parser = await parseMarkdownRecipe(markdown);
        const recipeData = parser.toJson();
        
        return reply.code(200).send({
          success: true,
          recipe: recipeData
        });
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({
          success: false,
          error: 'Failed to parse markdown recipe'
        });
      }
    }
  );
} 
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';

// Plan creation request interface
interface CreatePlanRequest {
  name: string;
  description?: string;
  date: string; // ISO date string
}

// Plan update request interface
interface UpdatePlanRequest {
  name?: string;
  description?: string;
  date?: string;
}

// Meal plan item creation request interface
interface CreateMealPlanItemRequest {
  title: string;
  cookTime: string;
  recipeId?: string;
  order?: number;
}

// Meal plan item update request interface
interface UpdateMealPlanItemRequest {
  title?: string;
  cookTime?: string;
  completed?: boolean;
  order?: number;
  recipeId?: string;
}

// Create plan
export const createPlan = async (
  request: FastifyRequest<{ Body: CreatePlanRequest }>,
  reply: FastifyReply
) => {
  try {
    const planData = request.body;
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Find user by openid
    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const plan = await request.server.prisma.plan.create({
      data: {
        name: planData.name,
        description: planData.description,
        date: new Date(planData.date),
        userId: user.id
      },
      include: {
        mealPlanItems: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return reply.code(201).send(plan);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get all plans for a user
export const getPlans = async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      date?: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    console.log('getPlans', request.user);
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const page = parseInt(request.query.page || '1', 10);
    const limit = parseInt(request.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.PlanWhereInput = {
      userId: user.id
    };

    if (request.query.date) {
      const targetDate = new Date(request.query.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: targetDate,
        lt: nextDay
      };
    }

    const [plans, total] = await Promise.all([
      request.server.prisma.plan.findMany({
        where,
        include: {
          mealPlanItems: {
            orderBy: { order: 'asc' },
            include: {
              recipe: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true,
                  cookingTime: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      request.server.prisma.plan.count({ where })
    ]);

    return reply.send({
      plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get a specific plan
export const getPlan = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const plan = await request.server.prisma.plan.findFirst({
      where: {
        id: request.params.id,
        userId: user.id
      },
      include: {
        mealPlanItems: {
          orderBy: { order: 'asc' },
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                cookingTime: true,
                difficulty: true
              }
            }
          }
        }
      }
    });

    if (!plan) {
      return reply.code(404).send({ error: 'Plan not found' });
    }

    return reply.send(plan);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Update plan
export const updatePlan = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdatePlanRequest;
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const updateData: any = {};
    if (request.body.name !== undefined) updateData.name = request.body.name;
    if (request.body.description !== undefined) updateData.description = request.body.description;
    if (request.body.date !== undefined) updateData.date = new Date(request.body.date);

    const plan = await request.server.prisma.plan.updateMany({
      where: {
        id: request.params.id,
        userId: user.id
      },
      data: updateData
    });

    if (plan.count === 0) {
      return reply.code(404).send({ error: 'Plan not found' });
    }

    const updatedPlan = await request.server.prisma.plan.findFirst({
      where: {
        id: request.params.id,
        userId: user.id
      },
      include: {
        mealPlanItems: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return reply.send(updatedPlan);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Delete plan
export const deletePlan = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const plan = await request.server.prisma.plan.deleteMany({
      where: {
        id: request.params.id,
        userId: user.id
      }
    });

    if (plan.count === 0) {
      return reply.code(404).send({ error: 'Plan not found' });
    }

    return reply.send({ message: 'Plan deleted successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Add meal plan item to plan
export const addMealPlanItem = async (
  request: FastifyRequest<{
    Params: { planId: string };
    Body: CreateMealPlanItemRequest;
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Verify plan exists and belongs to user
    const plan = await request.server.prisma.plan.findFirst({
      where: {
        id: request.params.planId,
        userId: user.id
      }
    });

    if (!plan) {
      return reply.code(404).send({ error: 'Plan not found' });
    }

    // Get the next order number
    const lastItem = await request.server.prisma.mealPlanItem.findFirst({
      where: { planId: request.params.planId },
      orderBy: { order: 'desc' }
    });

    const order = request.body.order || (lastItem ? lastItem.order + 1 : 1);

    const mealPlanItem = await request.server.prisma.mealPlanItem.create({
      data: {
        title: request.body.title,
        cookTime: request.body.cookTime,
        recipeId: request.body.recipeId,
        order,
        planId: request.params.planId
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            cookingTime: true
          }
        }
      }
    });

    return reply.code(201).send(mealPlanItem);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Update meal plan item
export const updateMealPlanItem = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateMealPlanItemRequest;
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Verify meal plan item belongs to user's plan
    const mealPlanItem = await request.server.prisma.mealPlanItem.findFirst({
      where: {
        id: request.params.id,
        plan: {
          userId: user.id
        }
      }
    });

    if (!mealPlanItem) {
      return reply.code(404).send({ error: 'Meal plan item not found' });
    }

    const updateData: any = {};
    if (request.body.title !== undefined) updateData.title = request.body.title;
    if (request.body.cookTime !== undefined) updateData.cookTime = request.body.cookTime;
    if (request.body.completed !== undefined) updateData.completed = request.body.completed;
    if (request.body.order !== undefined) updateData.order = request.body.order;
    if (request.body.recipeId !== undefined) updateData.recipeId = request.body.recipeId;

    const updatedItem = await request.server.prisma.mealPlanItem.update({
      where: { id: request.params.id },
      data: updateData,
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            cookingTime: true
          }
        }
      }
    });

    return reply.send(updatedItem);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Get plan summaries for date range
export const getPlanSummaries = async (
  request: FastifyRequest<{
    Querystring: {
      startDate: string;
      endDate: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const { startDate, endDate } = request.query;

    // Get plans with meal counts for the date range
    const plans = await request.server.prisma.plan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        _count: {
          select: {
            mealPlanItems: true
          }
        }
      }
    });

    // Group by date and calculate summaries
    const summaries = plans.reduce((acc, plan) => {
      const dateKey = plan.date.toISOString().split('T')[0];
      const existing = acc.find(s => s.date === dateKey);
      
      if (existing) {
        existing.planCount += 1;
        existing.mealCount += plan._count.mealPlanItems;
      } else {
        acc.push({
          date: dateKey,
          planCount: 1,
          mealCount: plan._count.mealPlanItems
        });
      }
      
      return acc;
    }, [] as Array<{ date: string; planCount: number; mealCount: number }>);

    return reply.send({ summaries });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

// Delete meal plan item
export const deleteMealPlanItem = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request.user as any)?.openid;

    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = await request.server.prisma.user.findUnique({
      where: { openid: userId }
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Verify meal plan item belongs to user's plan
    const mealPlanItem = await request.server.prisma.mealPlanItem.findFirst({
      where: {
        id: request.params.id,
        plan: {
          userId: user.id
        }
      }
    });

    if (!mealPlanItem) {
      return reply.code(404).send({ error: 'Meal plan item not found' });
    }

    await request.server.prisma.mealPlanItem.delete({
      where: { id: request.params.id }
    });

    return reply.send({ message: 'Meal plan item deleted successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
};

export default async function mealPlanRoutes(fastify: FastifyInstance) {
  // Plan routes
  fastify.post<{ Body: CreatePlanRequest }>('/', {
    preHandler: [fastify.authenticate]
  }, createPlan);
  fastify.get<{ Querystring: { page?: string; limit?: string; date?: string } }>('/', {
    preHandler: [fastify.authenticate]
  }, getPlans);
  fastify.get<{ Querystring: { startDate: string; endDate: string } }>('/summaries', {
    preHandler: [fastify.authenticate]
  }, getPlanSummaries);
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate]
  }, getPlan);
  fastify.put<{ Params: { id: string }; Body: UpdatePlanRequest }>('/:id', {
    preHandler: [fastify.authenticate]
  }, updatePlan);
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate]
  }, deletePlan);

  // Meal plan item routes
  fastify.post<{ Params: { planId: string }; Body: CreateMealPlanItemRequest }>('/:planId/items', {
    preHandler: [fastify.authenticate]
  }, addMealPlanItem);
  fastify.put<{ Params: { id: string }; Body: UpdateMealPlanItemRequest }>('/items/:id', {
    preHandler: [fastify.authenticate]
  }, updateMealPlanItem);
  fastify.delete<{ Params: { id: string } }>('/items/:id', {
    preHandler: [fastify.authenticate]
  }, deleteMealPlanItem);
} 
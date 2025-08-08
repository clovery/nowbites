import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";

export interface FavoriteRecipeParams {
    id: string
}

export default async function favoriteRecipe(request: FastifyRequest<{ Params: FavoriteRecipeParams }>, reply: FastifyReply) {
    const { id } = request.params;
    const { id: userId } = request.user as { id: string };

    const recipe = await prisma.recipe.findUnique({
        where: {
            id
        }
    });
    if (!recipe) {
        return reply.status(404).send({ error: "Recipe not found" });
    }

    const favorite = await prisma.userFavorite.create({
        data: {
            recipeId: id,
            userId
        }
    });

    return reply.status(200).send(favorite);
}
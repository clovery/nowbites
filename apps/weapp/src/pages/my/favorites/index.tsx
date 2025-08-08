import { View, Text, Image, Button, ScrollView } from "@tarojs/components";
import { useLoad, usePullDownRefresh } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import { Recipe } from "@nowbites/types";
import { useState } from "react";
import { AtIcon } from "taro-ui";
import { get, del } from "../../../utils/request";

interface FavoriteRecipe {
  id: string;
  createdAt: string;
  recipe: Recipe;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLoad(() => {
    fetchFavorites();
  });

  usePullDownRefresh(() => {
    fetchFavorites();
  });

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await get("/my/favorites");
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId: string) => {
    try {
      await del(`/recipes/${recipeId}/favorite`);

      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.recipe.id !== recipeId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove favorite"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-center">
          <View className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></View>
          <Text className="mt-4 text-gray-600">Loading favorites...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-center">
          <View className="text-red-500 text-xl mb-4">
            <AtIcon value="alert-circle" size="24" color="#ef4444"></AtIcon>
          </View>
          <Text className="text-gray-600">{error}</Text>
          <Button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={fetchFavorites}
          >
            Try Again
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b">
        <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <View className="flex items-center justify-between h-16">
            <View className="flex items-center">
              <View className="text-2xl mr-3">
                <AtIcon value="heart" size="30" color="#F00"></AtIcon>
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                My Favorites
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              {favorites.length} recipe{favorites.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" scrollY>
        <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {favorites.length === 0 ? (
            <View className="text-center py-12">
              <View className="text-6xl mb-4">
                <AtIcon value="clock" size="30" color="#F00"></AtIcon>
              </View>
              <Text className="text-lg font-medium text-gray-900 mb-2">
                No favorites yet
              </Text>
              <Text className="text-gray-500 mb-6">
                Start exploring recipes and add them to your favorites!
              </Text>
              <Button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                onClick={() => Taro.navigateBack()}
              >
                Browse Recipes
              </Button>
            </View>
          ) : (
            <View className="grid grid-cols-1 gap-6">
              {favorites.map((favorite) => (
                <View
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Recipe Image */}
                  <View className="relative h-48 bg-gray-200">
                    <Image
                      src={
                        favorite.recipe.coverImage ||
                        require("../../../assets/cover-image.png")
                      }
                      className="w-full h-full object-cover"
                      mode="aspectFill"
                    />

                    {/* Remove Favorite Button */}
                    <Button
                      className="absolute top-3 right-3  h-6 w-6 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors flex items-center justify-center"
                      onClick={() => removeFavorite(favorite.recipe.id)}
                    >
                      <AtIcon value="trash" size="16" color="#F00"></AtIcon>
                    </Button>

                    {/* Favorite Badge */}
                    <View className="absolute top-3 left-3">
                      <View className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <View className="mr-1">
                          <AtIcon
                            value="heart"
                            size="12"
                            color="#ffffff"
                          ></AtIcon>
                        </View>
                        <Text className="text-xs font-medium">Favorited</Text>
                      </View>
                    </View>
                  </View>

                  {/* Recipe Content */}
                  <View className="p-4">
                    <Text
                      className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
                      numberOfLines={2}
                    >
                      {favorite.recipe.title}
                    </Text>

                    {favorite.recipe.description && (
                      <Text
                        className="text-gray-600 text-sm mb-3 line-clamp-2"
                        numberOfLines={2}
                      >
                        {favorite.recipe.description}
                      </Text>
                    )}

                    {/* Recipe Meta */}
                    <View className="flex items-center justify-between mb-3">
                      <View className="flex items-center space-x-4 text-sm text-gray-500">
                        {favorite.recipe.cookingTime && (
                          <View className="flex items-center">
                            <View className="mr-1">
                              <AtIcon
                                value="clock"
                                size="16"
                                color="#6B7280"
                              ></AtIcon>
                            </View>
                            <Text className="text-sm text-gray-500">
                              {favorite.recipe.cookingTime} min
                            </Text>
                          </View>
                        )}
                        {favorite.recipe.servings && (
                          <View className="flex items-center">
                            <View className="mr-1">
                              <AtIcon
                                value="user"
                                size="16"
                                color="#6B7280"
                              ></AtIcon>
                            </View>
                            <Text className="text-sm text-gray-500">
                              {favorite.recipe.servings} servings
                            </Text>
                          </View>
                        )}
                      </View>

                      {favorite.recipe.difficulty && (
                        <Text
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(favorite.recipe.difficulty)}`}
                        >
                          {favorite.recipe.difficulty}
                        </Text>
                      )}
                    </View>

                    {/* Tags */}
                    {favorite.recipe.tags &&
                      favorite.recipe.tags.length > 0 && (
                        <View className="flex flex-wrap gap-1 mb-3">
                          {favorite.recipe.tags
                            .slice(0, 3)
                            .map((tag, index) => (
                              <Text
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </Text>
                            ))}
                          {favorite.recipe.tags.length > 3 && (
                            <Text className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{favorite.recipe.tags.length - 3}
                            </Text>
                          )}
                        </View>
                      )}

                    {/* Author and Date */}
                    <View className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <View className="flex items-center">
                        {favorite.recipe.user?.avatarUrl ? (
                          <Image
                            src={favorite.recipe.user.avatarUrl}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        ) : (
                          <View className="h-6 w-6 bg-gray-300 rounded-full mr-2"></View>
                        )}
                        <Text className="text-sm text-gray-600">
                          {favorite.recipe.user?.nickName || "Anonymous"}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {formatDate(favorite.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

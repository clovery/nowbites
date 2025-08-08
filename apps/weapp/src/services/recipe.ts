import { BaseService } from "./base"
import { Recipe } from "@nowbites/types"

interface RecipeListResponse {
  recipes: Recipe[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class RecipeService extends BaseService {

  // 获取菜谱列表
  async getRecipes(params?: {
    page?: number
    limit?: number
    search?: string
    tags?: string
    difficulty?: string
    userId?: string
  }): Promise<RecipeListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.tags) queryParams.append("tags", params.tags)
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty)
    if (params?.userId) queryParams.append("userId", params.userId)

    const url = `/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    console.log("url", url)
    const response = await this.request<RecipeListResponse>(url)

    if (response.statusCode !== 200) {
      throw new Error("获取菜谱列表失败")
    }

    return response.data
  }

  // 获取单个菜谱详情
  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.request<Recipe>(`/recipes/${id}`)

    if (response.statusCode !== 200) {
      throw new Error("获取菜谱详情失败")
    }

    return response.data
  }

  // 获取用户自己的菜谱
  async getUserRecipes(): Promise<Recipe[]> {
    const response = await this.request<Recipe[]>("/my/recipes")

    if (response.statusCode !== 200) {
      throw new Error("获取用户菜谱失败")
    }

    return response.data
  }

  // 解析Markdown菜谱
  async parseMarkdownRecipe(markdown: string): Promise<{
    success: boolean
    recipe?: Recipe
    error?: string
  }> {
    const response = await this.request<{
      success: boolean
      recipe?: Recipe
      error?: string
    }>("/recipes/parse-markdown", {
      method: "POST",
      data: { markdown },
    })

    if (response.statusCode !== 200) {
      return {
        success: false,
        error: "解析菜谱失败",
      }
    }

    return response.data
  }

  // 收藏菜谱
  async favoriteRecipe(id: string) {
    const response = await this.request<Recipe>(`/recipes/${id}/favorite`, {
      method: "POST",
    })

    if (response.statusCode !== 200) {
      throw new Error("收藏菜谱失败")
    }

    return response.data
  }
}

export const recipeService = new RecipeService()
export type { RecipeListResponse }

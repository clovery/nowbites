import Taro from "@tarojs/taro"
import config from "../config"

interface ApiResponse<T = any> {
  data: T
  statusCode: number
  header: any
}

interface LoginResponse {
  token: string
  userInfo: {
    openid: string
    nickName: string
    avatarUrl: string
    gender?: number
    country?: string
    province?: string
    city?: string
    language?: string
  }
}

interface LoginRequest {
  code: string
  userInfo: {
    nickName: string
    avatarUrl: string
    gender?: number
    country?: string
    province?: string
    city?: string
    language?: string
  }
}

interface Recipe {
  id: string
  title: string
  description?: string
  ingredients:
    | {
        main?: Array<{
          name: string
          amount: string
          unit?: string
          note?: string
        }>
        auxiliary?: Array<{
          name: string
          amount: string
          unit?: string
          note?: string
        }>
      }
    | Array<
        | {
            name: string
            amount: string
            unit?: string
            note?: string
          }
        | string
      >
  sauce?: Array<{
    name: string
    amount: string
    unit?: string
    note?: string
  }>
  steps: Array<{
    title: string
    content: string[]
    time?: number
  }>
  tips: Array<
    | {
        content: string
      }
    | string
  >
  cookingTime?: number | null
  servings?: number | null
  difficulty?: string | null
  imageUrl?: string | null
  coverImage?: string | null
  tags?: string[]
  isPublic?: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickName: string
    avatarUrl: string
  }
}

interface RecipeListResponse {
  recipes: Recipe[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface Plan {
  id: string
  name: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
  mealPlanItems: Array<{
    id: string
    title: string
    cookTime: string
    completed: boolean
    order: number
    recipeId?: string
    recipe?: {
      id: string
      title: string
      coverImage?: string
      cookingTime?: number
    }
  }>
}

interface PlanListResponse {
  plans: Plan[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface CreatePlanRequest {
  name: string
  description?: string
  date: string
}

class ApiService {
  public baseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  private async request<T>(
    url: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE"
      data?: any
      header?: any
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", data, header = {} } = options

    // 添加认证token到请求头
    const token = Taro.getStorageSync("token")
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    return Taro.request({
      url: `${this.baseUrl}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header,
      },
    })
  }

  async wechatLogin(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      "/api/auth/wechat-login",
      {
        method: "POST",
        data: loginData,
      }
    )

    if (response.statusCode !== 200) {
      throw new Error(response.statusCode + " " + "登录失败")
    }

    return response.data
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.request("/api/auth/verify")
      return response.statusCode === 200
    } catch (error) {
      return false
    }
  }

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

    const url = `/api/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    console.log("url", url)
    const response = await this.request<RecipeListResponse>(url)

    if (response.statusCode !== 200) {
      throw new Error("获取菜谱列表失败")
    }

    return response.data
  }

  // 获取单个菜谱详情
  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.request<Recipe>(`/api/recipes/${id}`)

    if (response.statusCode !== 200) {
      throw new Error("获取菜谱详情失败")
    }

    return response.data
  }

  // 获取用户自己的菜谱
  async getUserRecipes(): Promise<Recipe[]> {
    const response = await this.request<Recipe[]>("/api/recipes/my")

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
    }>("/api/recipes/parse-markdown", {
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

  // 获取计划列表
  async getPlans(params?: {
    page?: number
    limit?: number
    date?: string
  }): Promise<PlanListResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.date) queryParams.append("date", params.date)

    const url = `/api/meal-plans${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await this.request<PlanListResponse>(url)

    if (response.statusCode !== 200) {
      throw new Error("获取计划列表失败")
    }

    return response.data
  }

  // 获取单个计划详情
  async getPlan(id: string): Promise<Plan> {
    const response = await this.request<Plan>(`/api/meal-plans/${id}`)

    if (response.statusCode !== 200) {
      throw new Error("获取计划详情失败")
    }

    return response.data
  }

  // 创建计划
  async createPlan(planData: CreatePlanRequest): Promise<Plan> {
    const response = await this.request<Plan>("/api/meal-plans", {
      method: "POST",
      data: planData,
    })

    if (response.statusCode !== 201) {
      throw new Error("创建计划失败")
    }

    return response.data
  }

  // 更新计划
  async updatePlan(id: string, planData: Partial<CreatePlanRequest>): Promise<Plan> {
    const response = await this.request<Plan>(`/api/meal-plans/${id}`, {
      method: "PUT",
      data: planData,
    })

    if (response.statusCode !== 200) {
      throw new Error("更新计划失败")
    }

    return response.data
  }

  // 删除计划
  async deletePlan(id: string): Promise<void> {
    const response = await this.request(`/api/meal-plans/${id}`, {
      method: "DELETE",
    })

    if (response.statusCode !== 200) {
      throw new Error("删除计划失败")
    }
  }
}

export const apiService = new ApiService()
export type { LoginResponse, LoginRequest, Recipe, RecipeListResponse, Plan, PlanListResponse, CreatePlanRequest }

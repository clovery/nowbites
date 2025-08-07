import { get, post, put, del } from '../utils/request'

export interface MealPlanItem {
  id: string
  title: string
  cookTime: string
  completed?: boolean
  planId: string
  order: number
  recipeId?: string
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  name: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
  mealPlanItems: MealPlanItem[]
  creator?: {
    id: string
    nickName: string
    avatarUrl: string
  }
}

export interface CreatePlanRequest {
  name: string
  description?: string
  date: string
}

export interface CreateMealPlanItemRequest {
  title: string
  cookTime: string
  recipeId?: string
  order?: number
}

export interface UpdateMealPlanItemRequest {
  title?: string
  cookTime?: string
  completed?: boolean
  order?: number
  recipeId?: string
}

export interface PlanSummary {
  date: string
  planCount: number
  mealCount: number
}

export interface PlanSummaryResponse {
  summaries: PlanSummary[]
}

export type PlanResponse = Plan

export interface OrderRequest {
  planId: string
  user: { 
    id: string
  }
  selectedItems: string[]
}

export interface OrderResponse {
  id: string
  planId: string
  visitorName: string
  visitorPhone: string
  selectedItems: string[]
  createdAt: string
}

export interface Recipe {
  id: string
  title: string
  description?: string
  coverImage?: string
  cookingTime?: number
  difficulty?: string
  tags?: string[]
}

export interface PlanRecipesResponse {
  recipes: Recipe[]
}

class MealPlanService {
  // 获取分享的计划详情（公开访问）
  async getPlan(planId: string): Promise<PlanResponse> {
    try {
      return await get(`/meal-plans/${planId}`)
    } catch (error) {
      throw error
    }
  }

  // 提交点餐订单
  async submitOrder(data: OrderRequest): Promise<OrderResponse> {
    try {
      return await post(`/meal-plans/${data.planId}/orders`, data)
    } catch (error) {
      console.error('提交点餐失败:', error)
      throw error
    }
  }

  // 获取计划的点餐统计
  async getPlanOrders(planId: string): Promise<OrderResponse[]> {
    try {
      return await get(`/meal-plans/${planId}/orders`)
    } catch (error) {
      console.error('获取点餐统计失败:', error)
      throw error
    }
  }

  // 获取当前用户的菜谱库
  async getMyRecipes(): Promise<Recipe[]> {
    try {
      return await get(`/my/recipes`, undefined, true)
    } catch (error) {
      console.error('获取我的菜谱失败:', error)
      throw error
    }
  }

  // 创建计划
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    try {
      return await post(`/meal-plans`, data, true)
    } catch (error) {
      console.error('创建计划失败:', error)
      throw error
    }
  }

  // 获取用户的计划列表
  async getPlans(params?: { page?: number; limit?: number; date?: string }): Promise<{ plans: Plan[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.date) queryParams.append('date', params.date)

      const url = `/meal-plans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      return await get(url, undefined, true)
    } catch (error) {
      console.error('获取计划列表失败:', error)
      throw error
    }
  }

  // 获取计划汇总数据（按日期统计）
  async getPlanSummaries(startDate: string, endDate: string): Promise<PlanSummaryResponse> {
    try {
      const url = `/meal-plans/summaries?startDate=${startDate}&endDate=${endDate}`
      const response = await get(url, undefined, true)
      console.log('getPlanSummaries response:', response)
      return response
    } catch (error) {
      console.error('获取计划汇总失败:', error)
      throw error
    }
  }

  // 获取指定日期的计划详情
  async getPlansByDate(date: string): Promise<Plan[]> {
    try {
      const response = await get(`/meal-plans?date=${date}`, undefined, true)
      return response.plans
    } catch (error) {
      console.error('获取日期计划失败:', error)
      throw error
    }
  }

  // 添加菜谱到计划
  async addMealToPlan(planId: string, data: CreateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      return await post(`/meal-plans/${planId}/items`, data, true)
    } catch (error) {
      console.error('添加菜谱到计划失败:', error)
      throw error
    }
  }

  // 更新菜谱完成状态
  async updateMealPlanItem(itemId: string, data: UpdateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      return await put(`/meal-plans/items/${itemId}`, data, true)
    } catch (error) {
      console.error('更新菜谱状态失败:', error)
      throw error
    }
  }

  // 从计划中移除菜谱
  async removeMealFromPlan(itemId: string): Promise<void> {
    try {
      await del(`/meal-plans/items/${itemId}`, undefined, true)
    } catch (error) {
      console.error('移除菜谱失败:', error)
      throw error
    }
  }

  // 删除计划
  async deletePlan(planId: string): Promise<void> {
    try {
      await del(`/meal-plans/${planId}`, undefined, true)
    } catch (error) {
      console.error('删除计划失败:', error)
      throw error
    }
  }

  // 更新计划
  async updatePlan(planId: string, data: Partial<CreatePlanRequest>): Promise<Plan> {
    try {
      return await put(`/meal-plans/${planId}`, data, true)
    } catch (error) {
      console.error('更新计划失败:', error)
      throw error
    }
  }
}

export default new MealPlanService()  
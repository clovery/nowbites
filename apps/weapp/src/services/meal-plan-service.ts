import Taro from '@tarojs/taro'
import { get, post, put, del } from '../utils/request'

const API_BASE_URL = '/api'

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

class MealPlanService {
  // 创建计划
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    try {
      return await post(`${API_BASE_URL}/meal-plans`, data, true)
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

      const url = `${API_BASE_URL}/meal-plans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      return await get(url, undefined, true)
    } catch (error) {
      console.error('获取计划列表失败:', error)
      throw error
    }
  }

  // 获取计划汇总数据（按日期统计）
  async getPlanSummaries(startDate: string, endDate: string): Promise<PlanSummaryResponse> {
    try {
      const url = `${API_BASE_URL}/meal-plans/summaries?startDate=${startDate}&endDate=${endDate}`
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
      const response = await get(`${API_BASE_URL}/meal-plans?date=${date}`, undefined, true)
      return response.plans
    } catch (error) {
      console.error('获取日期计划失败:', error)
      throw error
    }
  }

  // 添加菜谱到计划
  async addMealToPlan(planId: string, data: CreateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      return await post(`${API_BASE_URL}/meal-plans/${planId}/items`, data, true)
    } catch (error) {
      console.error('添加菜谱到计划失败:', error)
      throw error
    }
  }

  // 更新菜谱完成状态
  async updateMealPlanItem(itemId: string, data: UpdateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      return await put(`${API_BASE_URL}/meal-plans/items/${itemId}`, data, true)
    } catch (error) {
      console.error('更新菜谱状态失败:', error)
      throw error
    }
  }

  // 从计划中移除菜谱
  async removeMealFromPlan(itemId: string): Promise<void> {
    try {
      await del(`${API_BASE_URL}/meal-plans/items/${itemId}`, undefined, true)
    } catch (error) {
      console.error('移除菜谱失败:', error)
      throw error
    }
  }

  // 删除计划
  async deletePlan(planId: string): Promise<void> {
    try {
      await del(`${API_BASE_URL}/meal-plans/${planId}`, undefined, true)
    } catch (error) {
      console.error('删除计划失败:', error)
      throw error
    }
  }

  // 更新计划
  async updatePlan(planId: string, data: Partial<CreatePlanRequest>): Promise<Plan> {
    try {
      return await put(`${API_BASE_URL}/meal-plans/${planId}`, data, true)
    } catch (error) {
      console.error('更新计划失败:', error)
      throw error
    }
  }
}

export default new MealPlanService() 
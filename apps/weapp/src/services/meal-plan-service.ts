import Taro from '@tarojs/taro'

const API_BASE_URL = 'http://localhost:3100/api'

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
  private getAuthHeader() {
    const token = Taro.getStorageSync('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // 创建计划
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        data
      })

      if (response.statusCode === 201) {
        return response.data
      } else {
        throw new Error(response.data?.error || '创建计划失败')
      }
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

      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans?${queryParams.toString()}`,
        method: 'GET',
        header: this.getAuthHeader()
      })

      if (response.statusCode === 200) {
        return response.data
      } else {
        throw new Error(response.data?.error || '获取计划列表失败')
      }
    } catch (error) {
      console.error('获取计划列表失败:', error)
      throw error
    }
  }

  // 获取计划汇总数据（按日期统计）
  async getPlanSummaries(startDate: string, endDate: string): Promise<PlanSummaryResponse> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/summaries?startDate=${startDate}&endDate=${endDate}`,
        method: 'GET',
        header: this.getAuthHeader()
      })

      console.log('getPlanSummaries response:', response)

      if (response.statusCode === 200) {
        return response.data
      } else {
        throw new Error(response.data?.error || '获取计划汇总失败')
      }
    } catch (error) {
      console.error('获取计划汇总失败:', error)
      throw error
    }
  }

  // 获取指定日期的计划详情
  async getPlansByDate(date: string): Promise<Plan[]> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans?date=${date}`,
        method: 'GET',
        header: this.getAuthHeader()
      })

      if (response.statusCode === 200) {
        return response.data.plans
      } else {
        throw new Error(response.data?.error || '获取日期计划失败')
      }
    } catch (error) {
      console.error('获取日期计划失败:', error)
      throw error
    }
  }

  // 添加菜谱到计划
  async addMealToPlan(planId: string, data: CreateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/${planId}/items`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        data
      })

      if (response.statusCode === 201) {
        return response.data
      } else {
        throw new Error(response.data?.error || '添加菜谱到计划失败')
      }
    } catch (error) {
      console.error('添加菜谱到计划失败:', error)
      throw error
    }
  }

  // 更新菜谱完成状态
  async updateMealPlanItem(itemId: string, data: UpdateMealPlanItemRequest): Promise<MealPlanItem> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/items/${itemId}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        data
      })

      if (response.statusCode === 200) {
        return response.data
      } else {
        throw new Error(response.data?.error || '更新菜谱状态失败')
      }
    } catch (error) {
      console.error('更新菜谱状态失败:', error)
      throw error
    }
  }

  // 从计划中移除菜谱
  async removeMealFromPlan(itemId: string): Promise<void> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/items/${itemId}`,
        method: 'DELETE',
        header: this.getAuthHeader()
      })

      if (response.statusCode !== 200) {
        throw new Error(response.data?.error || '移除菜谱失败')
      }
    } catch (error) {
      console.error('移除菜谱失败:', error)
      throw error
    }
  }

  // 删除计划
  async deletePlan(planId: string): Promise<void> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/${planId}`,
        method: 'DELETE',
        header: this.getAuthHeader()
      })

      if (response.statusCode !== 200) {
        throw new Error(response.data?.error || '删除计划失败')
      }
    } catch (error) {
      console.error('删除计划失败:', error)
      throw error
    }
  }

  // 更新计划
  async updatePlan(planId: string, data: Partial<CreatePlanRequest>): Promise<Plan> {
    try {
      const response = await Taro.request({
        url: `${API_BASE_URL}/meal-plans/${planId}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        data
      })

      if (response.statusCode === 200) {
        return response.data
      } else {
        throw new Error(response.data?.error || '更新计划失败')
      }
    } catch (error) {
      console.error('更新计划失败:', error)
      throw error
    }
  }
}

export default new MealPlanService() 
import Taro from '@tarojs/taro'
import config from '../config'

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
  ingredients: {
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
    sauce?: Array<{
      name: string
      amount: string
      unit?: string
      note?: string
    }>
  } | Array<{
    name: string
    amount: string
    unit?: string
    note?: string
  } | string>
  steps: Array<{
    title: string
    content: string[]
    time?: number
  }>
  tips: Array<{
    content: string
  } | string>
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

class ApiService {
  public baseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  private async request<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      data?: any
      header?: any
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', data, header = {} } = options

    // 添加认证token到请求头
    const token = Taro.getStorageSync('token')
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    return Taro.request({
      url: `${this.baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    })
  }

  async wechatLogin(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/wechat-login', {
      method: 'POST',
      data: loginData
    })

    if (response.statusCode !== 200) {
      throw new Error(response.statusCode + ' ' + '登录失败')
    }

    return response.data
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.request('/api/auth/verify')
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
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.tags) queryParams.append('tags', params.tags)
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty)
    if (params?.userId) queryParams.append('userId', params.userId)

    const url = `/api/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    console.log('url', url)
    const response = await this.request<RecipeListResponse>(url)

    if (response.statusCode !== 200) {
      throw new Error('获取菜谱列表失败')
    }

    return response.data
  }

  // 获取单个菜谱详情
  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.request<Recipe>(`/api/recipes/${id}`)

    if (response.statusCode !== 200) {
      throw new Error('获取菜谱详情失败')
    }

    return response.data
  }

  // 获取用户自己的菜谱
  async getUserRecipes(): Promise<Recipe[]> {
    const response = await this.request<Recipe[]>('/api/recipes/my')

    if (response.statusCode !== 200) {
      throw new Error('获取用户菜谱失败')
    }

    return response.data
  }
}

export const apiService = new ApiService()
export type { LoginResponse, LoginRequest, Recipe, RecipeListResponse } 
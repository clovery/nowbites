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
}

export const apiService = new ApiService()
export type { LoginResponse, LoginRequest } 
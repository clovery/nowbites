import { BaseService } from "./base"

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

class AuthService extends BaseService {

  async wechatLogin(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      "/auth/wechat-login",
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
      const response = await this.request("/auth/verify")
      return response.statusCode === 200
    } catch (error) {
      return false
    }
  }
}

export const authService = new AuthService()
export type { LoginResponse, LoginRequest }

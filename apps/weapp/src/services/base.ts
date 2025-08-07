import Taro from "@tarojs/taro"
import config from "../config"

interface ApiResponse<T = any> {
  data: T
  statusCode: number
  header: any
}

export class BaseService {
  public baseUrl: string

  constructor() {
    this.baseUrl = config.apiBaseUrl
  }

  protected async request<T>(
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
}

export type { ApiResponse }

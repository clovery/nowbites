import Taro from '@tarojs/taro'
import { apiService } from '../utils/api'

export interface UserInfo {
  openid?: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  country?: string;
  province?: string;
  city?: string;
  language?: string;
}

export interface LoginState {
  userInfo: UserInfo | null;
  isLogin: boolean;
  isLoading: boolean;
}

export interface LoginOptions {
  onStart?: () => void;
  onSuccess?: (userInfo: UserInfo) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
  showSuccessToast?: boolean;
  autoNavigateBack?: boolean;
  successToastDuration?: number;
  navigateBackDelay?: number;
}

export class LoginService {
  /**
   * 检查登录状态
   * @returns Promise<{isLogin: boolean, userInfo: UserInfo | null}>
   */
  static async checkLoginStatus(): Promise<{isLogin: boolean, userInfo: UserInfo | null}> {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      const token = Taro.getStorageSync('token')
      
      if (userInfo && token) {
        // 验证token是否有效
        const isValid = await apiService.verifyToken()
        if (isValid) {
          return { isLogin: true, userInfo }
        } else {
          // token无效，清除本地存储
          await this.clearLoginData()
          return { isLogin: false, userInfo: null }
        }
      }
      
      return { isLogin: false, userInfo: null }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return { isLogin: false, userInfo: null }
    }
  }

  /**
   * 执行微信登录
   * @param options 登录选项配置
   */
  static async wechatLogin(options: LoginOptions = {}): Promise<UserInfo> {
    const {
      onStart,
      onSuccess,
      onError,
      onFinally,
      showSuccessToast = true,
      autoNavigateBack = false,
      successToastDuration = 1500,
      navigateBackDelay = 1500
    } = options

    try {
      // 开始登录
      onStart?.()

      // 第一步：获取用户信息（必须由点击直接触发）
      const userProfileRes = await Taro.getUserProfile({
        desc: '用于完善会员资料'
      })
      const userInfo = userProfileRes.userInfo

      // 第二步：获取微信登录code
      const loginRes = await Taro.login()
      if (!loginRes.code) {
        throw new Error('获取微信登录code失败')
      }

      // 第三步：发送到后端API
      const loginResponse = await apiService.wechatLogin({
        code: loginRes.code,
        userInfo: userInfo
      })

      // 保存登录信息到本地存储
      await this.saveLoginData(loginResponse.token, loginResponse.userInfo)

      // 显示成功提示
      if (showSuccessToast) {
        Taro.showToast({ 
          title: '登录成功', 
          icon: 'success',
          duration: successToastDuration
        })
      }

      // 成功回调
      onSuccess?.(loginResponse.userInfo)

      // 自动跳转回上一页
      if (autoNavigateBack) {
        setTimeout(() => {
          Taro.navigateBack()
        }, navigateBackDelay)
      }

      return loginResponse.userInfo

    } catch (error: any) {
      console.error('微信登录失败:', error)
      
      const errorMessage = error.message || '登录失败: ' + (error.errMsg || '网络错误，请重试')
      
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })

      // 错误回调
      onError?.(error)
      
      throw error
    } finally {
      // 完成回调
      onFinally?.()
    }
  }

  /**
   * 退出登录
   * @param options 退出选项
   */
  static async logout(options: {
    showConfirm?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
  } = {}): Promise<void> {
    const { showConfirm = true, onSuccess, onCancel } = options

    const performLogout = async () => {
      await this.clearLoginData()
      
      Taro.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      
      onSuccess?.()
    }

    if (showConfirm) {
      Taro.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            performLogout()
          } else {
            onCancel?.()
          }
        }
      })
    } else {
      await performLogout()
    }
  }

  /**
   * 保存登录数据到本地存储
   */
  private static async saveLoginData(token: string, userInfo: UserInfo): Promise<void> {
    try {
      Taro.setStorageSync('token', token)
      Taro.setStorageSync('userInfo', userInfo)
    } catch (error) {
      console.error('保存登录数据失败:', error)
      throw new Error('保存登录信息失败')
    }
  }

  /**
   * 清除登录数据
   */
  private static async clearLoginData(): Promise<void> {
    try {
      Taro.removeStorageSync('userInfo')
      Taro.removeStorageSync('token')
    } catch (error) {
      console.error('清除登录数据失败:', error)
    }
  }

  /**
   * 获取当前登录用户信息
   */
  static getCurrentUser(): UserInfo | null {
    try {
      return Taro.getStorageSync('userInfo')
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 获取当前登录token
   */
  static getCurrentToken(): string | null {
    try {
      return Taro.getStorageSync('token')
    } catch (error) {
      console.error('获取token失败:', error)
      return null
    }
  }

  /**
   * 检查是否需要登录，如果未登录则提示用户登录
   * @param message 提示信息
   * @param autoLogin 是否自动触发登录
   */
  static async requireLogin(
    message: string = '请先登录后再使用此功能',
    autoLogin: boolean = false
  ): Promise<boolean> {
    const { isLogin } = await this.checkLoginStatus()
    
    if (!isLogin) {
      if (autoLogin) {
        try {
          await this.wechatLogin()
          return true
        } catch (error) {
          return false
        }
      } else {
        Taro.showModal({
          title: '提示',
          content: message,
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              // 可以导航到登录页面或直接触发登录
              this.wechatLogin().catch(() => {})
            }
          }
        })
        return false
      }
    }
    
    return true
  }
}

export default LoginService

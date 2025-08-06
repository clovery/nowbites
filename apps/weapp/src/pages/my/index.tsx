import { Component } from 'react'
import { View, Text, ScrollView, Button, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService, LoginResponse } from '../../utils/api'
import './index.scss'

interface UserInfo {
  openid?: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  country?: string;
  province?: string;
  city?: string;
  language?: string;
}

interface State {
  userInfo: UserInfo | null
  isLogin: boolean
  isLoading: boolean
}

export default class MyPage extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      userInfo: null,
      isLogin: false,
      isLoading: false
    }
  }

  componentDidMount() {
    this.checkLoginStatus()
  }

  checkLoginStatus = async () => {
    // 检查本地存储中是否有用户信息和token
    const userInfo = Taro.getStorageSync('userInfo')
    const token = Taro.getStorageSync('token')
    
    if (userInfo && token) {
      // 验证token是否有效
      const isValid = await apiService.verifyToken()
      if (isValid) {
        this.setState({ 
          userInfo,
          isLogin: true
        })
      } else {
        // token无效，清除本地存储
        Taro.removeStorageSync('userInfo')
        Taro.removeStorageSync('token')
      }
    }
  }

  handleGetUserInfo = async () => {
    this.setState({ isLoading: true })
    
    try {
      // 第一步：先获取用户信息（必须由点击直接触发）
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

      Taro.setStorageSync('token', loginResponse.token)
      Taro.setStorageSync('userInfo', loginResponse.userInfo)

      this.setState({
        userInfo: loginResponse.userInfo,
        isLogin: true,
        isLoading: false
      })

      Taro.showToast({ title: '登录成功', icon: 'success' })

    } catch (error: any) {
      this.setState({ isLoading: false })
      Taro.showToast({
        title: error.message || '登录失败: ' + apiService.baseUrl +  ' ' + error.errMsg,
        icon: 'none'
      })
    }
  }

  handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          Taro.removeStorageSync('userInfo')
          Taro.removeStorageSync('token')
          
          this.setState({
            userInfo: null,
            isLogin: false
          })
          
          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }

  navigateToRecipeUpload = () => {
    if (!this.state.isLogin) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再上传菜谱',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.handleGetUserInfo()
          }
        }
      })
      return
    }
    
    Taro.navigateTo({
      url: '/pages/recipe-upload/index'
    })
  }

  render() {
    const { userInfo, isLogin, isLoading } = this.state

    return (
      <View className='my-page'>
        {/* Profile Header Section */}
        <View className='profile-header'>
          {isLogin ? (
            <View className='user-profile'>
              <Image 
                className='profile-avatar' 
                src={userInfo?.avatarUrl || '/assets/default-avatar.png'}
              />
              <View className='profile-info'>
                <Text className='profile-name'>{userInfo?.nickName || '用户'}</Text>
                <Text className='profile-id'>微信号: {userInfo?.openid?.substring(0, 8) || 'unknown'}</Text>
                <View className='status-buttons'>
                  <View className='status-btn'>+ 状态</View>
                  <View className='status-btn-circle'></View>
                </View>
              </View>
              <View className='qr-code-icon'>📱</View>
              <View className='nav-arrow'>›</View>
            </View>
          ) : (
            <View className='login-profile'>
              <View className='default-avatar'>👤</View>
              <View className='profile-info'>
                <Text className='profile-name'>未登录</Text>
                <Text className='profile-id'>点击登录获取更多功能</Text>
              </View>
              <Button 
                className='login-btn' 
                onClick={this.handleGetUserInfo}
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </View>
          )}
        </View>

        {/* Functional List */}
        <View className='function-list'>
          <View className='function-item' onClick={this.navigateToRecipeUpload}>
            <View className='function-icon service-icon'>💬</View>
            <Text className='function-text'>上传菜谱</Text>
            <View className='arrow'>›</View>
          </View>
          
          <View className='function-item'>
            <View className='function-icon favorites-icon'>📦</View>
            <Text className='function-text'>我的收藏</Text>
            <View className='arrow'>›</View>
          </View>
          
          <View className='function-item'>
            <View className='function-icon moments-icon'>🏔️</View>
            <Text className='function-text'>我的菜谱</Text>
            <View className='arrow'>›</View>
          </View>
          
          <View className='function-item'>
            <View className='function-icon cards-icon'>💳</View>
            <Text className='function-text'>我的计划</Text>
            <View className='arrow'>›</View>
          </View>
          
          <View className='function-item'>
            <View className='function-icon stickers-icon'>😊</View>
            <Text className='function-text'>设置</Text>
            <View className='arrow'>›</View>
          </View>
          
          <View className='function-item' onClick={() => Taro.navigateTo({ url: '/pages/tools/index' })}>
            <View className='function-icon tools-icon'>🔧</View>
            <Text className='function-text'>配方计算器器</Text>
            <View className='arrow'>›</View>
          </View>
        </View>

        {/* Logout Section */}
        {isLogin && (
          <View className='logout-section'>
            <Button className='logout-button' onClick={this.handleLogout}>
              退出登录
            </Button>
          </View>
        )}
      </View>
    )
  }
}
import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import LoginService from '../../services/login'
import './index.scss'

interface State {
  isLoading: boolean
}

export default class LoginPage extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  componentDidMount() {
    // 检查是否已经登录，如果已登录则跳转回上一页或首页
    this.checkLoginStatus()
  }

  checkLoginStatus = async () => {
    const { isLogin } = await LoginService.checkLoginStatus()
    if (isLogin) {
      // 已登录，跳转回上一页
      Taro.navigateBack()
    }
  }

  handleWechatLogin = async () => {
    await LoginService.wechatLogin({
      onStart: () => {
        this.setState({ isLoading: true })
      },
      onSuccess: (userInfo) => {
        console.log('登录成功:', userInfo)
      },
      onError: (error) => {
        console.error('登录失败:', error)
      },
      onFinally: () => {
        this.setState({ isLoading: false })
      },
      showSuccessToast: true,
      autoNavigateBack: true,
      successToastDuration: 1500,
      navigateBackDelay: 1500
    })
  }

  render() {
    const { isLoading } = this.state

    return (
      <View className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 gradient-bg flex flex-col items-center justify-between px-5 py-12 box-border">
        {/* Logo 区域 */}
        <View className="text-center mt-8">
          <View className="text-6xl mb-6 drop-shadow-lg">🍜</View>
          <Text className="block text-2xl font-bold text-white mb-3 drop-shadow-md">
            现在吃什么
          </Text>
          <Text className="block text-sm text-white/80 font-light">
            美食计划，从这里开始
          </Text>
        </View>

        {/* 功能介绍 */}
        <View className="flex flex-col gap-4 w-full max-w-xs my-12">
          <View className="flex items-center bg-white/15 backdrop-blur-sm glass-effect rounded-2xl px-6 py-4 border border-white/20">
            <View className="text-lg mr-4">📱</View>
            <Text className="text-sm text-white font-medium">个人菜谱管理</Text>
          </View>
          <View className="flex items-center bg-white/15 backdrop-blur-sm glass-effect rounded-2xl px-6 py-4 border border-white/20">
            <View className="text-lg mr-4">📅</View>
            <Text className="text-sm text-white font-medium">餐饮计划制定</Text>
          </View>
          <View className="flex items-center bg-white/15 backdrop-blur-sm glass-effect rounded-2xl px-6 py-4 border border-white/20">
            <View className="text-lg mr-4">💫</View>
            <Text className="text-sm text-white font-medium">美食分享交流</Text>
          </View>
        </View>

        {/* 登录按钮区域 */}
        <View className="w-full max-w-xs text-center">
          <Button
            className={`wechat-login-btn w-full bg-wechat-primary rounded-3xl border-0 p-0 mb-6 shadow-wechat enhanced-shadow transition-all duration-300 ${
              isLoading ? 'opacity-70' : 'active:translate-y-0.5 active:shadow-wechat-active'
            }`}
            onClick={this.handleWechatLogin}
            disabled={isLoading}
          >
            <View className="flex items-center justify-center py-5">
              <View className={`text-lg mr-3 ${isLoading ? 'animate-spin custom-spin' : ''}`}>
                💬
              </View>
              <Text className="text-base font-semibold text-white">
                {isLoading ? '登录中...' : '微信快速登录'}
              </Text>
            </View>
          </Button>
          
          <Text className="text-xs text-white/70 leading-relaxed">
            登录即表示同意用户协议和隐私政策
          </Text>
        </View>

        {/* 底部装饰 */}
        <View className="mt-auto">
          <Text className="text-xs text-white/50 font-light">Version 0.0.0</Text>
        </View>
      </View>
    )
  }
}

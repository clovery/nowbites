import { Component } from 'react'
import { View, Text, ScrollView, Button, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface State {
  userInfo: Taro.UserInfo | null
  isLogin: boolean
  showLoginModal: boolean
}

export default class MyPage extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      userInfo: null,
      isLogin: false,
      showLoginModal: false
    }
  }

  componentDidMount() {
    this.checkLoginStatus()
  }

  checkLoginStatus = () => {
    // 检查本地存储中是否有用户信息
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo) {
      this.setState({ 
        userInfo,
        isLogin: true
      })
    }
  }

  handleLogin = () => {
    // 显示登录模态框，让用户点击授权按钮
    this.setState({
      showLoginModal: true
    });
  }

  handleCloseLoginModal = () => {
    this.setState({
      showLoginModal: false
    });
  }

  handleGetUserInfo = () => {
    // 使用getUserProfile替代getUserInfo
    Taro.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          Taro.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
            success: (userRes) => {
              const userInfo = userRes.userInfo
              console.log('userInfo', userInfo)
              
              // 将code和用户信息一起发送到后端，用于获取openid和session_key
              Taro.request({
                url: 'http://localhost:3100/api/auth/wechat-login',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: userInfo
                },
                success: (res) => {
                  // 保存后端返回的token和用户信息
                  const { token, userInfo: serverUserInfo } = res.data
                  Taro.setStorageSync('token', token)
                  
                  // 合并本地用户信息和服务器返回的用户信息
                  const combinedUserInfo = {
                    ...userInfo,
                    openid: serverUserInfo.openid
                  }
                  
                  this.setState({ 
                    userInfo: combinedUserInfo,
                    isLogin: true,
                    showLoginModal: false
                  })
                  Taro.setStorageSync('userInfo', combinedUserInfo)
                  
                  Taro.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                },
                fail: (err) => {
                  console.error('登录请求失败:', err)
                  
                  // 如果API服务器未启动或连接失败，使用本地存储作为备选方案
                  this.setState({ 
                    userInfo,
                    isLogin: true,
                    showLoginModal: false
                  })
                  Taro.setStorageSync('userInfo', userInfo)
                  
                  Taro.showToast({
                    title: '登录成功（本地模式）',
                    icon: 'success'
                  })
                }
              })
            },
            fail: (err) => {
              Taro.showToast({
                title: '获取用户信息失败',
                icon: 'none'
              })
              console.log('获取用户信息失败', err)
            }
          })
        } else {
          Taro.showToast({
            title: '登录失败: ' + loginRes.errMsg,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: '微信登录失败',
          icon: 'none'
        })
        console.error('微信登录失败:', err)
      }
    })
  }

  handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('userInfo')
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
            this.setState({
              showLoginModal: true
            })
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
    const { userInfo, isLogin, showLoginModal } = this.state

    return (
      <View className='my-page'>
        <View className='user-card'>
          {isLogin ? (
            <View className='user-info'>
              <Image 
                className='avatar' 
                src={userInfo?.avatarUrl || '/assets/default-avatar.png'}
              />
              <View className='user-details'>
                <Text className='nickname'>{userInfo?.nickName || '用户'}</Text>
                <Text className='user-id'>ID: {userInfo?.nickName}123</Text>
              </View>
              <Button className='logout-btn' onClick={this.handleLogout}>
                退出登录
              </Button>
            </View>
          ) : (
            <View className='login-prompt'>
              <View className='default-avatar'>👤</View>
              <Text className='login-text'>登录获取更多功能</Text>
              <Button 
                className='login-btn' 
                onClick={this.handleGetUserInfo}
              >
                微信登录
              </Button>
            </View>
          )}
        </View>

        <View className='feature-section'>
          <View className='section-title'>我的功能</View>
          
          <View className='feature-grid'>
            <View className='feature-item' onClick={this.navigateToRecipeUpload}>
              <View className='feature-icon'>📝</View>
              <Text className='feature-name'>上传菜谱</Text>
            </View>
            
            <View className='feature-item'>
              <View className='feature-icon'>❤️</View>
              <Text className='feature-name'>我的收藏</Text>
            </View>
            
            <View className='feature-item'>
              <View className='feature-icon'>🍽️</View>
              <Text className='feature-name'>我的菜谱</Text>
            </View>
            
            <View className='feature-item'>
              <View className='feature-icon'>📅</View>
              <Text className='feature-name'>我的计划</Text>
            </View>
          </View>
        </View>

        {showLoginModal && (
          <View className='login-modal'>
            <View className='modal-content'>
              <View className='modal-header'>
                <Text className='modal-title'>微信登录</Text>
                <Text 
                  className='modal-close'
                  onClick={() => this.setState({ showLoginModal: false })}
                >
                  ×
                </Text>
              </View>
              
              <View className='modal-body'>
                <Text className='modal-message'>授权获取您的公开信息（昵称、头像等）</Text>
                <Button 
                  className='auth-btn' 
                  onClick={this.handleGetUserInfo}
                >
                  确认授权
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
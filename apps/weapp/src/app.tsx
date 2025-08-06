import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.css'

class App extends Component<PropsWithChildren> {

  componentDidMount () {
    this.setNavBarInfo()
  }

  componentDidShow () {}

  componentDidHide () {}

  /**
   * @description 设置导航栏信息
   */
  setNavBarInfo () {
    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()
    // 胶囊按钮位置信息
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
    
    const statusBarHeight = systemInfo.statusBarHeight || 0
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height + statusBarHeight
    const menuBottom = menuButtonInfo.top - statusBarHeight
    const menuRight = systemInfo.screenWidth - menuButtonInfo.right
    const menuHeight = menuButtonInfo.height
    
    // 存储到全局数据中
    const app = Taro.getApp()
    app.globalData = {
      ...app.globalData,
      navBarHeight,
      menuBottom,
      menuRight,
      menuHeight,
      statusBarHeight
    }
  }

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
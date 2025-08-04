import { Component } from 'react'
import { View, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Props {
  showSearch?: boolean
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  backgroundColor?: string
  children?: React.ReactNode
}

interface State {
  navBarHeight: number
  menuRight: number
  menuBottom: number
  menuHeight: number
  statusBarHeight: number
}

export default class CustomNavigation extends Component<Props, State> {
  
  constructor(props: Props) {
    super(props)
    
    const app = Taro.getApp()
    const globalData = app.globalData || {}
    
    this.state = {
      navBarHeight: globalData.navBarHeight || 0,
      menuRight: globalData.menuRight || 0,
      menuBottom: globalData.menuBottom || 0,
      menuHeight: globalData.menuHeight || 0,
      statusBarHeight: globalData.statusBarHeight || 0
    }
  }

  onSearchInput = (e: any) => {
    const { onSearchChange } = this.props
    if (onSearchChange) {
      onSearchChange(e.detail.value)
    }
  }

  render() {
    const { 
      showSearch = false, 
      searchValue = '', 
      searchPlaceholder = '搜索...', 
      backgroundColor = '#fff',
      children 
    } = this.props
    
    const { navBarHeight, menuRight, menuBottom, menuHeight, statusBarHeight } = this.state

    return (
      <View 
        className='custom-nav' 
        style={{
          height: `${navBarHeight}px`,
          backgroundColor
        }}
      >
        {/* 状态栏占位 */}
        <View 
          className='status-bar' 
          style={{
            height: `${statusBarHeight}px`
          }}
        />
        
        {/* 导航内容区域 */}
        <View 
          className='nav-content'
          style={{
            height: `${menuHeight}px`,
            minHeight: `${menuHeight}px`,
            lineHeight: `${menuHeight}px`,
            bottom: `${menuBottom}px`,
            left: `${menuRight}px`,
            right: `${menuRight}px`
          }}
        >
          {showSearch ? (
            <View className='nav-search-container'>
              <Input
                className='nav-search-input'
                placeholder={searchPlaceholder}
                value={searchValue}
                onInput={this.onSearchInput}
              />
            </View>
          ) : (
            children
          )}
        </View>
      </View>
    )
  }
}
import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Index extends Component {

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  navigateToRecipeList = () => {
    Taro.switchTab({
      url: '/pages/recipe-list/index'
    })
  }

  navigateToUpload = () => {
    Taro.navigateTo({
      url: '/pages/recipe-upload/index'
    })
  }

  navigateToMealPlan = () => {
    Taro.switchTab({
      url: '/pages/meal-plan/index'
    })
  }

  render () {
    return (
      <View className='index'>
        <View className='header'>
          <Text className='title'>今食刻</Text>
          <Text className='subtitle'>让每一餐都有温度</Text>
        </View>
        
        <View className='feature-grid'>
          <View className='feature-card' onClick={this.navigateToRecipeList}>
            <View className='feature-icon'>📖</View>
            <Text className='feature-title'>浏览菜谱</Text>
            <Text className='feature-desc'>查看所有收藏的菜谱</Text>
          </View>
          
          <View className='feature-card' onClick={this.navigateToUpload}>
            <View className='feature-icon'>📝</View>
            <Text className='feature-title'>上传菜谱</Text>
            <Text className='feature-desc'>批量导入Markdown菜谱</Text>
          </View>
          
          <View className='feature-card' onClick={this.navigateToMealPlan}>
            <View className='feature-icon'>📅</View>
            <Text className='feature-title'>用餐计划</Text>
            <Text className='feature-desc'>安排每天要做的菜</Text>
          </View>
          
          <View className='feature-card'>
            <View className='feature-icon'>👥</View>
            <Text className='feature-title'>群组分享</Text>
            <Text className='feature-desc'>邀请朋友一起分享菜谱</Text>
          </View>
        </View>
        
        <View className='quick-actions'>
          <Button className='btn btn-primary' onClick={this.navigateToUpload}>
            快速上传菜谱
          </Button>
        </View>
      </View>
    )
  }
}
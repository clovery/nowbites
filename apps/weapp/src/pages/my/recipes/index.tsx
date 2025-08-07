import { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService, Recipe } from '../../../utils/api'

interface State {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
  loadingMore: boolean
}

export default class MyRecipes extends Component<{}, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      recipes: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
      loadingMore: false
    }
  }

  componentDidMount() {
    this.loadMyRecipes()
  }

  loadMyRecipes = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        this.setState({ loadingMore: true })
      } else {
        this.setState({ loading: true, error: null, page: 1 })
      }

      const { page } = this.state
      const response = await apiService.getUserRecipes()

      if (isLoadMore) {
        this.setState(prevState => ({
          recipes: [...prevState.recipes, ...response],
          page: prevState.page + 1,
          hasMore: response.length === 20,
          loadingMore: false
        }))
      } else {
        this.setState({
          recipes: response,
          page: 1,
          hasMore: response.length === 20,
          loading: false
        })
      }
    } catch (error) {
      console.error('加载我的菜谱失败:', error)
      this.setState({
        error: '加载我的菜谱失败，请稍后重试',
        loading: false,
        loadingMore: false
      })

      Taro.showToast({
        title: '加载菜谱失败',
        icon: 'none',
        duration: 2000
      })
    }
  }

  onScrollToLower = () => {
    const { hasMore, loadingMore } = this.state
    if (hasMore && !loadingMore) {
      this.loadMyRecipes(true)
    }
  }

  navigateToDetail = (recipe: Recipe) => {
    Taro.navigateTo({
      url: `/pages/recipes/detail/index?id=${recipe.id}`
    })
  }

  navigateToUpload = () => {
    Taro.navigateTo({
      url: '/pages/recipe-upload/index'
    })
  }

  render() {
    const { recipes, loading, error, hasMore, loadingMore } = this.state

    if (loading) {
      return (
        <View className="min-h-screen bg-white">
          <View className="flex justify-center items-center min-h-60vh flex-col">
            <Text className="text-sm text-gray-500 mt-6">加载中...</Text>
          </View>
        </View>
      )
    }

    if (error) {
      return (
        <View className="min-h-screen bg-white">
          <View className="flex justify-center items-center min-h-60vh flex-col text-center p-10">
            <Text className="text-sm text-red-500 mb-6 leading-relaxed">{error}</Text>
            <View 
              className="bg-gradient-to-r from-red-400 to-red-600 text-white border-none rounded-full px-12 py-6 text-sm font-bold"
              onClick={() => this.loadMyRecipes()}
            >
              重试
            </View>
          </View>
        </View>
      )
    }

    return (
      <View className="">
        <View className="flex-1 overflow-hidden flex flex-col">
          {recipes.length === 0 ? (
            <View className="text-center p-30 bg-white m-10 rounded-6 shadow-sm">
              <View className="text-30 mb-8 opacity-80">📝</View>
              <Text className="block text-11 font-semibold text-gray-800 mb-5 tracking-wide">还没有菜谱</Text>
              <Text className="text-sm text-gray-500 mb-8 leading-relaxed">点击下方按钮开始上传你的第一个菜谱吧</Text>
              <View 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-8 py-4 text-sm font-bold inline-block"
                onClick={this.navigateToUpload}
              >
                上传菜谱
              </View>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              scrollY
              onScrollToLower={this.onScrollToLower}
              lowerThreshold={100}
            >
              <View className="grid grid-cols-2 gap-4 p-4">
                {recipes.map(recipe => (
                  <View
                    key={recipe.id}
                    className="bg-white rounded-5 overflow-hidden shadow-sm transition-all duration-300 border border-gray-100 flex flex-col relative"
                    onClick={() => this.navigateToDetail(recipe)}
                  >
                    <View className="relative w-full h-45 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <Image
                        className="w-full h-full rounded-none transition-transform duration-300 min-h-24"
                        src={recipe.coverImage || recipe.imageUrl || 'https://via.placeholder.com/300x200/f0f0f0/999?text=Recipe'}
                        mode='aspectFill'
                      />
                    </View>

                    <View className="p-4 flex-1 flex flex-col justify-between">
                      <Text className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2 leading-tight tracking-wide">
                        {recipe.title}
                      </Text>
                      <Text className="text-xs text-gray-500 font-medium">
                        {recipe.cookingTime ? `${recipe.cookingTime}分钟` : '未知时间'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {loadingMore && (
                <View className="flex justify-center items-center py-4">
                  <Text className="text-sm text-gray-500">加载更多...</Text>
                </View>
              )}

              {!hasMore && recipes.length > 0 && (
                <View className="flex justify-center items-center py-4">
                  <Text className="text-sm text-gray-400">没有更多菜谱了</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    )
  }
}

import { Component } from 'react'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService, Recipe } from '../../utils/api'
import './index.scss'

interface State {
  recipes: Recipe[]
  searchText: string
  filteredRecipes: Recipe[]
  planId?: string // 如果从计划页面跳转过来，会有计划ID
  addedRecipeIds: string[] // 已添加到计划的菜谱ID列表
  loading: boolean
  error: string | null
}

export default class RecipeList extends Component<{}, State> {

  constructor(props: any) {
    super(props)
    this.state = {
      recipes: [],
      searchText: '',
      filteredRecipes: [],
      addedRecipeIds: [],
      loading: false,
      error: null
    }
  }

  componentDidMount() {
    this.loadRecipes()
    this.checkPlanId()
  }

  checkPlanId = () => {
    // 从全局存储中检查是否有计划ID
    const planId = Taro.getStorageSync('currentPlanId')
    
    if (planId) {
      this.setState({ planId }, () => {
        // 在设置planId后，更新已添加的菜谱列表
        this.updateAddedRecipes()
      })
      Taro.setNavigationBarTitle({
        title: '选择菜谱'
      })
      // 清除存储的计划ID，避免影响后续使用
      Taro.removeStorageSync('currentPlanId')
    }
  }

  loadRecipes = async () => {
    try {
      this.setState({ loading: true, error: null })
      
      const response = await apiService.getRecipes({
        page: 1,
        limit: 50 // 获取前50个菜谱
      })
      
      this.setState({
        recipes: response.recipes,
        filteredRecipes: response.recipes,
        loading: false
      })
    } catch (error) {
      console.error('加载菜谱失败:', error)
      this.setState({
        error: '加载菜谱失败，请稍后重试',
        loading: false
      })
      
      Taro.showToast({
        title: '加载菜谱失败',
        icon: 'none',
        duration: 2000
      })
    }
  }

  onSearchChange = (e: any) => {
    const searchText = e.detail.value
    const { recipes } = this.state
    const filteredRecipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
    )
    
    this.setState({
      searchText,
      filteredRecipes
    })
  }

  navigateToDetail = (recipe: Recipe) => {
    Taro.navigateTo({
      url: `/pages/recipe-detail/index?id=${recipe.id}`
    })
  }

  addToPlan = (recipe: Recipe) => {
    const { planId } = this.state
    
    if (!planId) {
      // 如果没有planId，跳转到详情页
      this.navigateToDetail(recipe)
      return
    }

    // 将菜谱添加到计划中
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const planMeals = mealPlans[planId] || []
    
    // 检查是否已经添加过这个菜谱
    const existingMeal = planMeals.find((meal: any) => meal.id === recipe.id)
    if (existingMeal) {
      Taro.showToast({
        title: '该菜谱已在计划中',
        icon: 'none'
      })
      return
    }

    // 创建新的菜谱项
    const newMeal = {
      id: recipe.id,
      title: recipe.title,
      cookTime: recipe.cookingTime ? `${recipe.cookingTime}分钟` : '未知',
      completed: false,
      planId: planId
    }

    planMeals.push(newMeal)
    mealPlans[planId] = planMeals
    Taro.setStorageSync('mealPlans', mealPlans)

    Taro.showToast({
      title: '已添加到计划',
      icon: 'success',
      duration: 1000
    })

    // 不返回上一页，让用户可以继续添加
    // 更新已添加的菜谱列表，避免重复添加
    this.updateAddedRecipes()
  }

  updateAddedRecipes = () => {
    const { planId } = this.state
    if (!planId) return

    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const planMeals = mealPlans[planId] || []
    const addedRecipeIds = planMeals.map((meal: any) => meal.id)

    // 更新状态，标记已添加的菜谱
    this.setState({
      addedRecipeIds: addedRecipeIds
    })
  }

  navigateToUpload = () => {
    Taro.navigateTo({
      url: '/pages/recipe-upload/index'
    })
  }

  render() {
    const { filteredRecipes, searchText, planId, addedRecipeIds, loading, error } = this.state

    if (loading) {
      return (
        <View className='recipe-list'>
          <View className='loading-state'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        </View>
      )
    }

    if (error) {
      return (
        <View className='recipe-list'>
          <View className='error-state'>
            <Text className='error-text'>{error}</Text>
            <Button className='retry-btn' onClick={this.loadRecipes}>
              重试
            </Button>
          </View>
        </View>
      )
    }

    return (
      <View className='recipe-list'>
        <View className='search-bar'>
          <Input
            className='search-input'
            placeholder='搜索菜谱...'
            value={searchText}
            onInput={this.onSearchChange}
          />
        </View>

        {filteredRecipes.length === 0 ? (
          <View className='empty-state'>
            <View className='empty-icon'>📝</View>
            <Text className='empty-title'>还没有菜谱</Text>
            <Text className='empty-desc'>点击下方按钮开始上传你的第一个菜谱吧</Text>
            <View className='empty-action' onClick={this.navigateToUpload}>
              <Text className='upload-btn'>上传菜谱</Text>
            </View>
          </View>
        ) : (
          <ScrollView className='recipe-scroll' scrollY>
            {filteredRecipes.map(recipe => {
              const isAdded = addedRecipeIds.includes(recipe.id)
              return (
                <View 
                  key={recipe.id} 
                  className={`recipe-card ${isAdded ? 'added' : ''}`}
                  onClick={() => this.addToPlan(recipe)}
                >
                  <View className='recipe-header'>
                    <Text className='recipe-title'>{recipe.title}</Text>
                    <View className='recipe-meta'>
                      <Text className='cook-time'>⏱ {recipe.cookingTime ? `${recipe.cookingTime}分钟` : '未知'}</Text>
                      <Text className='difficulty'>🔥 {recipe.difficulty || '未知'}</Text>
                    </View>
                  </View>
                  
                  {recipe.description && (
                    <Text className='recipe-description'>{recipe.description}</Text>
                  )}
                  
                  {recipe.tags && recipe.tags.length > 0 && (
                    <View className='recipe-tags'>
                      {recipe.tags.map((tag, index) => (
                        <Text key={index} className='tag'>#{tag}</Text>
                      ))}
                    </View>
                  )}
                  
                  {planId && (
                    <View className='add-to-plan-btn'>
                      <Text className={`add-btn-text ${isAdded ? 'added' : ''}`}>
                        {isAdded ? '✓ 已添加' : '+ 添加到计划'}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </ScrollView>
        )}

        {/* 当有计划ID时显示完成按钮 */}
        {planId && (
          <View className='done-section'>
            <Button 
              className='done-btn' 
              onClick={() => {
                Taro.switchTab({
                  url: '/pages/meal-plan/index'
                })
              }}
            >
              完成添加
            </Button>
          </View>
        )}
      </View>
    )
  }
}
import { Component } from 'react'
import { View, Text, ScrollView, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService, Recipe } from '../../utils/api'
import CustomNavigation from '../../components/custom-navigation'
import './index.scss'

interface State {
  recipes: Recipe[]
  searchText: string
  filteredRecipes: Recipe[]
  planId?: string
  addedRecipeIds: string[]
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
  loadingMore: boolean
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
      error: null,
      page: 1,
      hasMore: true,
      loadingMore: false
    }
  }

  componentDidMount() {
    this.loadRecipes()
    this.checkPlanId()
  }

  checkPlanId = () => {
    const planId = Taro.getStorageSync('currentPlanId')

    if (planId) {
      this.setState({ planId }, () => {
        this.updateAddedRecipes()
      })
      Taro.setNavigationBarTitle({
        title: '选择菜谱'
      })
      Taro.removeStorageSync('currentPlanId')
    }
  }

  loadRecipes = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        this.setState({ loadingMore: true })
      } else {
        this.setState({ loading: true, error: null, page: 1 })
      }

      const { page } = this.state
      const response = await apiService.getRecipes({
        page: isLoadMore ? page + 1 : 1,
        limit: 20
      })

      if (isLoadMore) {
        this.setState(prevState => ({
          recipes: [...prevState.recipes, ...response.recipes],
          filteredRecipes: [...prevState.filteredRecipes, ...response.recipes],
          page: prevState.page + 1,
          hasMore: response.recipes.length === 20,
          loadingMore: false
        }))
      } else {
        this.setState({
          recipes: response.recipes,
          filteredRecipes: response.recipes,
          page: 1,
          hasMore: response.recipes.length === 20,
          loading: false
        })
      }
    } catch (error) {
      console.error('加载菜谱失败:', error)
      this.setState({
        error: '加载菜谱失败，请稍后重试',
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
    const { hasMore, loadingMore, searchText } = this.state

    if (hasMore && !loadingMore && !searchText) {
      this.loadRecipes(true)
    }
  }

  navigateToDetail = (recipe: Recipe) => {
    Taro.navigateTo({
      url: `/pages/recipes/detail/index?id=${recipe.id}`
    })
  }

  addToPlan = (recipe: Recipe) => {
    const { planId } = this.state

    if (!planId) {
      this.navigateToDetail(recipe)
      return
    }

    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const planMeals = mealPlans[planId] || []

    const existingMeal = planMeals.find((meal: any) => meal.id === recipe.id)
    if (existingMeal) {
      Taro.showToast({
        title: '该菜谱已在计划中',
        icon: 'none'
      })
      return
    }

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

    this.updateAddedRecipes()
  }

  updateAddedRecipes = () => {
    const { planId } = this.state
    if (!planId) return

    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const planMeals = mealPlans[planId] || []
    const addedRecipeIds = planMeals.map((meal: any) => meal.id)

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
    const { filteredRecipes, searchText, planId, addedRecipeIds, loading, error, hasMore, loadingMore } = this.state

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
            <Button className='retry-btn' onClick={() => this.loadRecipes()}>
              重试
            </Button>
          </View>
        </View>
      )
    }

    return (
      <View className='recipe-list'>
        <View className='navigation-fixed'>
          <CustomNavigation
            showSearch={true}
            searchValue={searchText}
            searchPlaceholder='搜索菜谱...'
            onSearchChange={(value) => {
              const { recipes } = this.state
              const filteredRecipes = recipes.filter(recipe =>
                recipe.title.toLowerCase().includes(value.toLowerCase()) ||
                (recipe.description && recipe.description.toLowerCase().includes(value.toLowerCase())) ||
                (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase())))
              )

              this.setState({
                searchText: value,
                filteredRecipes
              })
            }}
          />
        </View>

        <View className='recipe-content'>
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
            <ScrollView
              className='recipe-scroll'
              scrollY
              onScrollToLower={this.onScrollToLower}
              lowerThreshold={100}
            >
              <View className='recipe-grid'>
                {filteredRecipes.map(recipe => {
                  const isAdded = addedRecipeIds.includes(recipe.id)
                  return (
                    <View
                      key={recipe.id}
                      className={`recipe-card ${isAdded ? 'added' : ''}`}
                      onClick={() => this.addToPlan(recipe)}
                    >
                      <View className='recipe-image-container'>
                        <Image
                          className='recipe-image single'
                          src={recipe.coverImage || recipe.imageUrl || 'https://via.placeholder.com/300x200/f0f0f0/999?text=Recipe'}
                          mode='aspectFill'
                        />
                        {isAdded && (
                          <View className='added-overlay'>
                            <Text className='added-text'>✓ 已添加</Text>
                          </View>
                        )}
                      </View>

                      <View className='recipe-content'>
                        <Text className='recipe-title'>{recipe.title}</Text>
                        <Text className='recipe-count'>{recipe.cookingTime ? `${recipe.cookingTime}分钟` : '未知时间'}</Text>
                      </View>
                    </View>
                  )
                })}
              </View>

              {loadingMore && (
                <View className='loading-more'>
                  <Text className='loading-more-text'>加载更多...</Text>
                </View>
              )}

              {!hasMore && filteredRecipes.length > 0 && (
                <View className='no-more'>
                  <Text className='no-more-text'>没有更多菜谱了</Text>
                </View>
              )}
            </ScrollView>
          )}

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
      </View>
    )
  }
}

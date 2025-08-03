import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService, Recipe } from '../../../utils/api'
import './index.scss'

interface State {
  recipe: Recipe | null
  loading: boolean
  error: string | null
}

export default class RecipeDetail extends Component<{}, State> {

  constructor(props: any) {
    super(props)
    this.state = {
      recipe: null,
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    const params = Taro.getCurrentInstance().router?.params
    const id = params?.id
    if (id) {
      this.loadRecipe(id)
    } else {
      Taro.showToast({
        title: '参数错误',
        icon: 'error'
      })
      Taro.navigateBack()
    }
  }

  loadRecipe = async (id: string) => {
    try {
      this.setState({ loading: true, error: null })
      
      const recipe = await apiService.getRecipe(id)
      
      this.setState({
        recipe,
        loading: false
      })
      
      Taro.setNavigationBarTitle({
        title: recipe.title
      })
    } catch (error) {
      console.error('Failed to load recipe:', error)
      this.setState({
        loading: false,
        error: '加载菜谱失败'
      })
      
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  }

  addToMealPlan = () => {
    const { recipe } = this.state
    if (!recipe) return

    Taro.showActionSheet({
      itemList: ['今天', '明天', '后天', '选择其他日期'],
      success: (res) => {
        let targetDate = new Date()
        
        switch (res.tapIndex) {
          case 0:
            // 今天
            break
          case 1:
            // 明天
            targetDate.setDate(targetDate.getDate() + 1)
            break
          case 2:
            // 后天
            targetDate.setDate(targetDate.getDate() + 2)
            break
          case 3:
            // 选择其他日期
            this.showDatePicker()
            return
        }
        
        this.saveMealPlan(recipe, targetDate)
      }
    })
  }

  showDatePicker = () => {
    const { recipe } = this.state
    if (!recipe) return

    Taro.showModal({
      title: '选择日期',
      content: '请在用餐计划页面选择具体日期',
      confirmText: '去计划页面',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({
            url: '/pages/meal-plan/index'
          })
        }
      }
    })
  }

  saveMealPlan = (recipe: Recipe, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    
    console.log('添加菜谱到计划:', {
      recipe: recipe.title,
      date: dateStr,
      existingPlans: mealPlans
    })
    
    if (!mealPlans[dateStr]) {
      mealPlans[dateStr] = []
    }
    
    // 检查是否已经添加过
    const exists = mealPlans[dateStr].some((plan: any) => plan.id === recipe.id)
    if (exists) {
      Taro.showToast({
        title: '该菜谱已在计划中',
        icon: 'none'
      })
      return
    }
    
    mealPlans[dateStr].push({
      id: recipe.id,
      title: recipe.title,
      cookTime: recipe.cookingTime || 0
    })
    
    Taro.setStorageSync('mealPlans', mealPlans)
    
    console.log('保存后的用餐计划:', mealPlans)
    
    Taro.showToast({
      title: '已添加到用餐计划',
      icon: 'success'
    })
  }

  shareRecipe = () => {
    const { recipe } = this.state
    if (!recipe) return

    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  // 处理食材显示
  renderIngredient = (ingredient: any) => {
    if (typeof ingredient === 'string') {
      return ingredient
    }
    
    if (ingredient && typeof ingredient === 'object') {
      const { name, amount, unit, note } = ingredient
      if (name && amount) {
        let text = `${name} ${amount}${unit || ''}`
        if (note) {
          text += ` (${note})`
        }
        return text
      }
      return name || '未知食材'
    }
    
    return '未知食材'
  }

  // 处理主要食材
  renderMainIngredients = (ingredients: any) => {
    if (!ingredients || !Array.isArray(ingredients)) return null

    return (
      <View className='ingredient-group'>
        <Text className='ingredient-group-title'>主要食材</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} className='ingredient-item'>
            <Text className='ingredient-text'>
              {this.renderIngredient(ingredient)}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // 处理辅助食材
  renderAuxiliaryIngredients = (ingredients: any) => {
    if (!ingredients || !Array.isArray(ingredients)) return null

    return (
      <View className='ingredient-group'>
        <Text className='ingredient-group-title'>辅助食材</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} className='ingredient-item'>
            <Text className='ingredient-text'>
              {this.renderIngredient(ingredient)}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // 处理调味料
  renderSauceIngredients = (sauce: any) => {
    if (!sauce || !Array.isArray(sauce)) return null

    return (
      <View className='ingredient-group'>
        <Text className='ingredient-group-title'>调味料</Text>
        {sauce.map((ingredient, index) => (
          <View key={index} className='ingredient-item'>
            <Text className='ingredient-text'>
              {this.renderIngredient(ingredient)}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // 处理食材清单显示
  renderIngredients = (ingredients: any) => {
    if (!ingredients) return null

    // 如果是新的结构化格式
    if (ingredients.main || ingredients.auxiliary || ingredients.sauce) {
      return (
        <View className='ingredients'>
          {this.renderMainIngredients(ingredients.main)}
          {this.renderAuxiliaryIngredients(ingredients.auxiliary)}
          {this.renderSauceIngredients(ingredients.sauce)}
        </View>
      )
    }

    // 如果是旧的数组格式
    if (Array.isArray(ingredients)) {
      return (
        <View className='ingredients'>
          {ingredients.map((ingredient, index) => (
            <View key={index} className='ingredient-item'>
              <Text className='ingredient-text'>
                {this.renderIngredient(ingredient)}
              </Text>
            </View>
          ))}
        </View>
      )
    }

    return null
  }

  // 处理步骤显示
  renderStep = (step: any, index: number) => {
    if (!step) return null

    const title = step.title || `步骤 ${index + 1}`
    const time = step.time || 0
    const content = step.content || []

    return (
      <View key={index} className='step-item'>
        <View className='step-number'>{index + 1}</View>
        <View className='step-content'>
          <Text className='step-title'>{title}</Text>
          {time > 0 && <Text className='step-time'>⏱ {time}分钟</Text>}
          {Array.isArray(content) ? content.map((contentItem: string, contentIndex: number) => (
            <Text key={contentIndex} className='step-text'>• {contentItem}</Text>
          )) : (
            <Text className='step-text'>• {content}</Text>
          )}
        </View>
      </View>
    )
  }

  // 处理小贴士显示
  renderTip = (tip: any, index: number) => {
    if (typeof tip === 'string') {
      return <View><Text key={index} className='tip-text'>• {tip}</Text></View>
    }
    
    if (tip && typeof tip === 'object' && tip.content) {
      return <View><Text key={index} className='tip-text'>• {tip.content}</Text></View>
    }
    
    return null
  }

  render() {
    const { recipe, loading, error } = this.state

    if (loading) {
      return (
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      )
    }

    if (error || !recipe) {
      return (
        <View className='error'>
          <Text>{error || '菜谱不存在'}</Text>
        </View>
      )
    }

    return (
      <View className='recipe-detail'>
        <ScrollView className='content' scrollY>
          <View className='header'>
            <Text className='title'>{recipe.title}</Text>
            <Text className='description'>{recipe.description}</Text>
            
            <View className='meta-info'>
              {recipe.cookingTime && (
                <View className='meta-item'>
                  <Text className='meta-label'>⏱ 烹饪时间</Text>
                  <Text className='meta-value'>{recipe.cookingTime}分钟</Text>
                </View>
              )}
              {recipe.difficulty && (
                <View className='meta-item'>
                  <Text className='meta-label'>🔥 难度</Text>
                  <Text className='meta-value'>{recipe.difficulty}</Text>
                </View>
              )}
              {recipe.servings && (
                <View className='meta-item'>
                  <Text className='meta-label'>👥 份量</Text>
                  <Text className='meta-value'>{recipe.servings}人份</Text>
                </View>
              )}
            </View>
            
            {recipe.tags && recipe.tags.length > 0 && (
              <View className='tags'>
                {recipe.tags.map((tag, index) => (
                  <Text key={index} className='tag'>#{tag}</Text>
                ))}
              </View>
            )}
          </View>

          <View className='section'>
            <Text className='section-title'>🥘 食材清单</Text>
            {this.renderIngredients(recipe.ingredients)}
          </View>

          <View className='section'>
            <Text className='section-title'>👩‍🍳 制作步骤</Text>
            <View className='steps'>
              {Array.isArray(recipe.steps) && recipe.steps.map((step, index) => 
                this.renderStep(step, index)
              )}
            </View>
          </View>

          {recipe.tips && recipe.tips.length > 0 && (
            <View className='section'>
              <Text className='section-title'>💡 小贴士</Text>
              <View className='tips'>
                {recipe.tips.map((tip, index) => 
                  this.renderTip(tip, index)
                )}
              </View>
            </View>
          )}
        </ScrollView>

        <View className='actions'>
          <Button className='action-btn secondary' onClick={this.shareRecipe}>
            分享菜谱
          </Button>
          <Button className='action-btn primary' onClick={this.addToMealPlan}>
            加入计划
          </Button>
        </View>
      </View>
    )
  }
}
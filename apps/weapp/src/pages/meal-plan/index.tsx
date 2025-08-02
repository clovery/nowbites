import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface MealPlanItem {
  id: string
  title: string
  cookTime: string
  completed?: boolean
  planId: string // 归属于哪个计划
}

interface Plan {
  id: string
  name: string
  description?: string
  date: string // 关联的日期
  createdAt: string
  updatedAt: string
}

interface State {
  currentDate: string
  selectedDate: string
  plans: Plan[]
  weekDates: string[]
}

export default class MealPlan extends Component<{}, State> {

  constructor(props: any) {
    super(props)
    
    const today = new Date()
    const currentDate = this.formatDateString(today)
    
    this.state = {
      currentDate,
      selectedDate: currentDate,
      plans: [],
      weekDates: []
    }
  }

  componentDidMount() {
    this.loadPlans()
    this.generateWeekDates()
    
    // 监听计划创建事件
    Taro.eventCenter.on('planCreated', this.handlePlanCreated)
    
    // 添加测试数据（仅在开发环境）
    this.addTestData()
  }

  componentWillUnmount() {
    Taro.eventCenter.off('planCreated', this.handlePlanCreated)
  }

  // 统一的日期格式化函数
  formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  loadPlans = () => {
    const plans = Taro.getStorageSync('plans') || []
    this.setState({ plans })
  }

  handlePlanCreated = (newPlan: Plan) => {
    this.loadPlans()
  }

  generateWeekDates = () => {
    const dates = []
    const today = new Date()
    
    // 生成今天开始的7天
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(this.formatDateString(date))
    }
    
    console.log('生成的周日期:', dates)
    this.setState({ weekDates: dates })
  }

  formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const targetDate = dateStr
    const todayStr = this.formatDateString(today)
    const tomorrowStr = this.formatDateString(tomorrow)
    
    if (targetDate === todayStr) {
      return '今天'
    } else if (targetDate === tomorrowStr) {
      return '明天'
    } else {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
      return `${month}/${day} 周${weekDay}`
    }
  }

  selectDate = (date: string) => {
    console.log('选择日期:', date, '当前选中日期:', this.state.selectedDate)
    this.setState({ selectedDate: date }, () => {
      console.log('日期选择后状态:', this.state.selectedDate)
    })
  }

  // 获取指定日期的所有计划
  getPlansForDate = (date: string) => {
    return this.state.plans.filter(plan => plan.date === date)
  }

  // 获取指定计划的菜谱
  getMealsForPlan = (planId: string) => {
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    return mealPlans[planId] || []
  }

  toggleMealCompletion = (planId: string, mealId: string) => {
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const planMeals = mealPlans[planId] || []
    
    const updatedMeals = planMeals.map(meal => 
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    )
    
    const newMealPlans = {
      ...mealPlans,
      [planId]: updatedMeals
    }
    
    Taro.setStorageSync('mealPlans', newMealPlans)
    
    Taro.showToast({
      title: updatedMeals.find(m => m.id === mealId)?.completed ? '已完成' : '取消完成',
      icon: 'success',
      duration: 1000
    })

    // 强制重新渲染
    this.forceUpdate()
  }

  removeMealFromPlan = (planId: string, mealId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要从计划中移除这道菜吗？',
      success: (res) => {
        if (res.confirm) {
          const mealPlans = Taro.getStorageSync('mealPlans') || {}
          const planMeals = mealPlans[planId] || []
          const updatedMeals = planMeals.filter(meal => meal.id !== mealId)
          
          const newMealPlans = {
            ...mealPlans,
            [planId]: updatedMeals
          }
          
          Taro.setStorageSync('mealPlans', newMealPlans)
          
          Taro.showToast({
            title: '已移除',
            icon: 'success'
          })

          // 强制重新渲染
          this.forceUpdate()
        }
      }
    })
  }

  createNewPlan = () => {
    Taro.navigateTo({
      url: '/pages/plan-create/index'
    })
  }

  viewRecipeDetail = (mealId: string) => {
    Taro.navigateTo({
      url: `/pages/recipes/detail/index?id=${mealId}`
    })
  }

  addMealToPlan = (planId: string) => {
    // 由于菜谱列表是tabbar页面，无法直接传递参数
    // 使用全局存储来传递计划ID
    Taro.setStorageSync('currentPlanId', planId)
    Taro.switchTab({
      url: '/pages/recipe-list/index'
    })
  }

  getTotalCookTime = (meals: MealPlanItem[]) => {
    let totalMinutes = 0
    meals.forEach(meal => {
      const timeStr = meal.cookTime
      const minutes = parseInt(timeStr.replace(/[^0-9]/g, '')) || 0
      if (timeStr.includes('小时')) {
        totalMinutes += minutes * 60
      } else {
        totalMinutes += minutes
      }
    })
    
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
    }
    return `${totalMinutes}分钟`
  }

  // 添加测试数据
  addTestData = () => {
    const plans = Taro.getStorageSync('plans') || []
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    const today = this.formatDateString(new Date())
    const tomorrow = this.formatDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))
    
    let hasChanges = false
    
    // 如果今天没有计划，添加测试计划
    if (!plans.find(p => p.date === today)) {
      const testPlan = {
        id: 'plan1',
        name: '今日菜单',
        description: '今天的用餐计划',
        date: today,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      plans.push(testPlan)
      hasChanges = true
    }
    
    // 如果明天没有计划，添加测试计划
    if (!plans.find(p => p.date === tomorrow)) {
      const testPlan = {
        id: 'plan2',
        name: '明日菜单',
        description: '明天的用餐计划',
        date: tomorrow,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      plans.push(testPlan)
      hasChanges = true
    }
    
    // 添加测试菜谱数据
    if (!mealPlans['plan1']) {
      mealPlans['plan1'] = [
        {
          id: 'test1',
          title: '红烧肉',
          cookTime: '45分钟',
          completed: false,
          planId: 'plan1'
        },
        {
          id: 'test2',
          title: '清炒小白菜',
          cookTime: '15分钟',
          completed: true,
          planId: 'plan1'
        }
      ]
      hasChanges = true
    }
    
    if (!mealPlans['plan2']) {
      mealPlans['plan2'] = [
        {
          id: 'test3',
          title: '糖醋里脊',
          cookTime: '30分钟',
          completed: false,
          planId: 'plan2'
        }
      ]
      hasChanges = true
    }
    
    // 只有在有变化时才更新存储和状态
    if (hasChanges) {
      Taro.setStorageSync('plans', plans)
      Taro.setStorageSync('mealPlans', mealPlans)
      this.setState({ plans })
    }
  }

  render() {
    const { selectedDate, weekDates, currentDate, plans } = this.state
    const datePlans = this.getPlansForDate(selectedDate)

    console.log('渲染状态:', {
      selectedDate,
      datePlans: datePlans.length,
      plansKeys: Object.keys(plans),
      weekDates,
      currentDate
    })

    return (
      <View className='meal-plan'>
        <View className='header'>
          <Text className='title'>用餐计划</Text>
          <Text className='subtitle'>安排每天要做的菜</Text>
          <Button 
            className='debug-btn' 
            onClick={() => {
              console.log('当前状态:', this.state)
              console.log('存储中的计划:', Taro.getStorageSync('plans'))
              console.log('存储中的菜谱:', Taro.getStorageSync('mealPlans'))
              Taro.showToast({
                title: `选中: ${this.state.selectedDate}`,
                icon: 'none'
              })
            }}
            style={{
              position: 'absolute',
              top: '20rpx',
              right: '20rpx',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '24rpx',
              padding: '8rpx 16rpx',
              borderRadius: '20rpx'
            }}
          >
            调试
          </Button>
        </View>

        <View className='date-selector'>
          <ScrollView className='date-scroll' scrollX>
            {weekDates.map(date => {
              const datePlans = this.getPlansForDate(date)
              const totalMeals = datePlans.reduce((total, plan) => {
                const meals = this.getMealsForPlan(plan.id)
                return total + meals.length
              }, 0)
              
              return (
                <View 
                  key={date}
                  className={`date-item ${selectedDate === date ? 'active' : ''} ${date === currentDate ? 'today' : ''}`}
                  onClick={() => this.selectDate(date)}
                >
                  <Text className='date-text'>{this.formatDate(date)}</Text>
                  {totalMeals > 0 && (
                    <View className='meal-count'>{totalMeals}</View>
                  )}
                </View>
              )
            })}
          </ScrollView>
        </View>

        <View className='plan-content'>
          <View className='plan-header'>
            <Text className='plan-title'>{this.formatDate(selectedDate)}的计划</Text>
          </View>

          {datePlans.length === 0 ? (
            <View className='empty-plan'>
              <View className='empty-icon'>📅</View>
              <Text className='empty-title'>今天还没有创建计划</Text>
              <Text className='empty-desc'>创建一个计划来安排今天的菜谱吧</Text>
              <Button className='add-btn' onClick={this.createNewPlan}>
                创建计划
              </Button>
            </View>
          ) : (
            <ScrollView className='plans-list' scrollY>
              {datePlans.map(plan => {
                const planMeals = this.getMealsForPlan(plan.id)
                const completedCount = planMeals.filter(meal => meal.completed).length
                
                return (
                  <View key={plan.id} className='plan-section'>
                    <View className='plan-info'>
                      <Text className='plan-name'>{plan.name}</Text>
                      {plan.description && (
                        <Text className='plan-description'>{plan.description}</Text>
                      )}
                      {planMeals.length > 0 && (
                        <Text className='plan-stats'>
                          {completedCount}/{planMeals.length} 已完成 | 预计 {this.getTotalCookTime(planMeals)}
                        </Text>
                      )}
                    </View>

                    {planMeals.length === 0 ? (
                      <View className='empty-meals'>
                        <Text className='empty-meals-text'>暂无菜谱</Text>
                      </View>
                    ) : (
                      <View className='meal-list'>
                        {planMeals.map((meal, index) => (
                          <View key={meal.id} className={`meal-item ${meal.completed ? 'completed' : ''}`}>
                            <View className='meal-info' onClick={() => this.viewRecipeDetail(meal.id)}>
                              <View className='meal-number'>{index + 1}</View>
                              <View className='meal-details'>
                                <Text className='meal-title'>{meal.title}</Text>
                                <Text className='meal-time'>⏱ {meal.cookTime}</Text>
                              </View>
                            </View>
                            
                            <View className='meal-actions'>
                              <View 
                                className={`action-btn complete-btn ${meal.completed ? 'completed' : ''}`}
                                onClick={() => this.toggleMealCompletion(plan.id, meal.id)}
                              >
                                <Text className='action-text'>{meal.completed ? '✓' : '○'}</Text>
                              </View>
                              <View 
                                className='action-btn remove-btn'
                                onClick={() => this.removeMealFromPlan(plan.id, meal.id)}
                              >
                                <Text className='action-text'>×</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 始终显示添加菜谱按钮 */}
                    <View className='add-meal-section'>
                      <Button 
                        className='add-meal-btn' 
                        onClick={() => this.addMealToPlan(plan.id)}
                      >
                        + 添加菜谱
                      </Button>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          )}

          {/* 当有计划时显示创建计划按钮 */}
          {datePlans.length > 0 && (
            <View className='add-more'>
              <Button className='add-more-btn' onClick={this.createNewPlan}>
                + 创建计划
              </Button>
            </View>
          )}
        </View>
      </View>
    )
  }
}
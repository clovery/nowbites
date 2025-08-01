import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface MealPlanItem {
  id: string
  title: string
  cookTime: string
  completed?: boolean
}

interface State {
  currentDate: string
  selectedDate: string
  mealPlans: { [date: string]: MealPlanItem[] }
  weekDates: string[]
}

export default class MealPlan extends Component<{}, State> {

  constructor(props) {
    super(props)
    
    const today = new Date()
    const currentDate = today.toISOString().split('T')[0]
    
    this.state = {
      currentDate,
      selectedDate: currentDate,
      mealPlans: {},
      weekDates: []
    }
  }

  componentDidMount() {
    this.loadMealPlans()
    this.generateWeekDates()
  }

  loadMealPlans = () => {
    const mealPlans = Taro.getStorageSync('mealPlans') || {}
    this.setState({ mealPlans })
  }

  generateWeekDates = () => {
    const dates = []
    const today = new Date()
    
    // 生成今天开始的7天
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    this.setState({ weekDates: dates })
  }

  formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const targetDate = dateStr
    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
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
    this.setState({ selectedDate: date })
  }

  toggleMealCompletion = (date: string, mealId: string) => {
    const { mealPlans } = this.state
    const dayPlans = mealPlans[date] || []
    
    const updatedPlans = dayPlans.map(meal => 
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    )
    
    const newMealPlans = {
      ...mealPlans,
      [date]: updatedPlans
    }
    
    this.setState({ mealPlans: newMealPlans })
    Taro.setStorageSync('mealPlans', newMealPlans)
    
    Taro.showToast({
      title: updatedPlans.find(m => m.id === mealId)?.completed ? '已完成' : '取消完成',
      icon: 'success',
      duration: 1000
    })
  }

  removeMealFromPlan = (date: string, mealId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要从计划中移除这道菜吗？',
      success: (res) => {
        if (res.confirm) {
          const { mealPlans } = this.state
          const dayPlans = mealPlans[date] || []
          const updatedPlans = dayPlans.filter(meal => meal.id !== mealId)
          
          const newMealPlans = {
            ...mealPlans,
            [date]: updatedPlans
          }
          
          this.setState({ mealPlans: newMealPlans })
          Taro.setStorageSync('mealPlans', newMealPlans)
          
          Taro.showToast({
            title: '已移除',
            icon: 'success'
          })
        }
      }
    })
  }

  addMealToPlan = () => {
    Taro.switchTab({
      url: '/pages/recipe-list/index'
    })
  }

  viewRecipeDetail = (mealId: string) => {
    Taro.navigateTo({
      url: `/pages/recipe-detail/index?id=${mealId}`
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

  render() {
    const { selectedDate, mealPlans, weekDates, currentDate } = this.state
    const selectedMeals = mealPlans[selectedDate] || []
    const completedCount = selectedMeals.filter(meal => meal.completed).length

    return (
      <View className='meal-plan'>
        <View className='header'>
          <Text className='title'>用餐计划</Text>
          <Text className='subtitle'>安排每天要做的菜</Text>
        </View>

        <View className='date-selector'>
          <ScrollView className='date-scroll' scrollX>
            {weekDates.map(date => (
              <View 
                key={date}
                className={`date-item ${selectedDate === date ? 'active' : ''} ${date === currentDate ? 'today' : ''}`}
                onClick={() => this.selectDate(date)}
              >
                <Text className='date-text'>{this.formatDate(date)}</Text>
                {mealPlans[date] && mealPlans[date].length > 0 && (
                  <View className='meal-count'>{mealPlans[date].length}</View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View className='plan-content'>
          <View className='plan-header'>
            <Text className='plan-title'>{this.formatDate(selectedDate)}的计划</Text>
            {selectedMeals.length > 0 && (
              <View className='plan-stats'>
                <Text className='stats-text'>
                  {completedCount}/{selectedMeals.length} 已完成 | 预计 {this.getTotalCookTime(selectedMeals)}
                </Text>
              </View>
            )}
          </View>

          {selectedMeals.length === 0 ? (
            <View className='empty-plan'>
              <View className='empty-icon'>📅</View>
              <Text className='empty-title'>今天还没有安排菜谱</Text>
              <Text className='empty-desc'>去菜谱页面选择想做的菜吧</Text>
              <Button className='add-btn' onClick={this.addMealToPlan}>
                添加菜谱到计划
              </Button>
            </View>
          ) : (
            <ScrollView className='meal-list' scrollY>
              {selectedMeals.map((meal, index) => (
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
                      onClick={() => this.toggleMealCompletion(selectedDate, meal.id)}
                    >
                      <Text className='action-text'>{meal.completed ? '✓' : '○'}</Text>
                    </View>
                    <View 
                      className='action-btn remove-btn'
                      onClick={() => this.removeMealFromPlan(selectedDate, meal.id)}
                    >
                      <Text className='action-text'>×</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              <View className='add-more'>
                <Button className='add-more-btn' onClick={this.addMealToPlan}>
                  + 添加更多菜谱
                </Button>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    )
  }
}
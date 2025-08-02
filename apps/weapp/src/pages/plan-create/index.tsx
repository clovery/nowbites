import { Component } from 'react'
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Plan {
  id: string
  name: string
  description?: string
  date: string // 关联的日期
  createdAt: string
  updatedAt: string
}

interface State {
  planName: string
  planDescription: string
  selectedDate: string
  loading: boolean
}

export default class PlanCreate extends Component<{}, State> {

  constructor(props: any) {
    super(props)
    
    // 默认选择今天
    const today = new Date()
    const currentDate = this.formatDateString(today)
    
    this.state = {
      planName: '',
      planDescription: '',
      selectedDate: currentDate,
      loading: false
    }
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '创建计划'
    })
  }

  // 统一的日期格式化函数
  formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  handleNameChange = (e: any) => {
    this.setState({
      planName: e.detail.value
    })
  }

  handleDescriptionChange = (e: any) => {
    this.setState({
      planDescription: e.detail.value
    })
  }

  handleDateChange = (e: any) => {
    const date = new Date()
    date.setDate(date.getDate() + parseInt(e.detail.value))
    this.setState({
      selectedDate: this.formatDateString(date)
    })
  }

  createPlan = () => {
    const { planName, planDescription, selectedDate } = this.state
    
    if (!planName.trim()) {
      Taro.showToast({
        title: '请输入计划名称',
        icon: 'none'
      })
      return
    }

    this.setState({ loading: true })

    try {
      const plans = Taro.getStorageSync('plans') || []
      
      // 检查同一日期是否已有同名计划
      const existingPlan = plans.find((plan: Plan) => 
        plan.name === planName.trim() && plan.date === selectedDate
      )
      if (existingPlan) {
        Taro.showToast({
          title: '该日期已有同名计划',
          icon: 'none'
        })
        this.setState({ loading: false })
        return
      }

      const newPlan: Plan = {
        id: Date.now().toString(),
        name: planName.trim(),
        description: planDescription.trim(),
        date: selectedDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      plans.push(newPlan)
      Taro.setStorageSync('plans', plans)

      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })

      // 返回上一页并传递新创建的计划ID
      setTimeout(() => {
        Taro.navigateBack({
          success: () => {
            // 通过事件总线或其他方式通知上一页
            Taro.eventCenter.trigger('planCreated', newPlan)
          }
        })
      }, 1500)

    } catch (error) {
      Taro.showToast({
        title: '创建失败',
        icon: 'error'
      })
    } finally {
      this.setState({ loading: false })
    }
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

  render() {
    const { planName, planDescription, selectedDate, loading } = this.state

    // 生成未来7天的日期选项
    const dateOptions = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dateOptions.push({
        value: i.toString(),
        label: this.formatDate(this.formatDateString(date))
      })
    }

    return (
      <View className='plan-create'>
        <View className='header'>
          <Text className='title'>创建新计划</Text>
          <Text className='subtitle'>为你的用餐计划起个名字吧</Text>
        </View>

        <View className='form'>
          <View className='form-item'>
            <Text className='label'>计划名称 *</Text>
            <Input
              className='input'
              placeholder='例如：本周菜单、周末大餐'
              value={planName}
              onInput={this.handleNameChange}
              maxlength={20}
            />
            <Text className='hint'>最多20个字符</Text>
          </View>

          <View className='form-item'>
            <Text className='label'>计划日期 *</Text>
            <Picker
              mode='selector'
              range={dateOptions}
              rangeKey='label'
              value={dateOptions.findIndex(option => 
                this.formatDate(selectedDate) === option.label
              )}
              onChange={this.handleDateChange}
            >
              <View className='picker-input'>
                <Text className='picker-text'>{this.formatDate(selectedDate)}</Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
            <Text className='hint'>选择计划关联的日期</Text>
          </View>

          <View className='form-item'>
            <Text className='label'>计划描述</Text>
            <Input
              className='input textarea'
              placeholder='描述一下这个计划（可选）'
              value={planDescription}
              onInput={this.handleDescriptionChange}
              maxlength={100}
            />
            <Text className='hint'>最多100个字符</Text>
          </View>
        </View>

        <View className='actions'>
          <Button 
            className='create-btn' 
            onClick={this.createPlan}
            loading={loading}
            disabled={!planName.trim()}
          >
            创建计划
          </Button>
        </View>
      </View>
    )
  }
} 
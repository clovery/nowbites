import { Component } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import './index.scss'

interface MenuItem {
  id: string
  name: string
  monthSales: number
  image?: string
}

interface State {
  menuItems: MenuItem[]
  searchText: string
}

export default class Kitchen extends Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      menuItems: [
        {
          id: '101',
          name: '酸辣土豆丝',
          monthSales: 0,
          image: 'https://placehold.co/200x100'
        },
        {
          id: '201',
          name: '酸辣土豆丝',
          monthSales: 12,
          image: 'https://placehold.co/100'
        },
        {
          id: '202',
          name: '凉拌黄瓜',
          monthSales: 8,
          image: 'https://placehold.co/100'
        },
        {
          id: '203',
          name: '凉拌木耳',
          monthSales: 5,
          image: 'https://placehold.co/100'
        },
        {
          id: '301',
          name: '红烧肉',
          monthSales: 20,
          image: 'https://placehold.co/100'
        },
        {
          id: '302',
          name: '鱼香肉丝',
          monthSales: 15,
          image: 'https://placehold.co/100'
        },
        {
          id: '303',
          name: '宫保鸡丁',
          monthSales: 18,
          image: 'https://placehold.co/100'
        },
        {
          id: '304',
          name: '麻婆豆腐',
          monthSales: 10,
          image: 'https://placehold.co/100'
        },
        {
          id: '401',
          name: '米饭',
          monthSales: 50,
          image: 'https://placehold.co/100'
        },
        {
          id: '402',
          name: '馒头',
          monthSales: 30,
          image: 'https://placehold.co/100'
        },
        {
          id: '501',
          name: '可乐',
          monthSales: 40,
          image: 'https://placehold.co/100'
        },
        {
          id: '502',
          name: '雪碧',
          monthSales: 35,
          image: 'https://placehold.co/100'
        },
        {
          id: '503',
          name: '茶',
          monthSales: 25,
          image: 'https://placehold.co/100'
        }
      ],
      searchText: ''
    }
  }

  componentDidMount() {
    // 可以从服务器或本地存储加载菜单数据
    this.loadMenuData()
  }

  loadMenuData = () => {
    // 这里可以实现从服务器获取数据的逻辑
    // 目前使用示例数据
  }

  onSearchChange = (e: { detail: { value: string } }) => {
    this.setState({
      searchText: e.detail.value
    })
  }

  render() {
    const { menuItems, searchText } = this.state
    const filteredItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase())
    )

    return (
      <View className='kitchen'>
        <View className='header'>
          <View className='shop-info'>
            <Text className='shop-name'>XXXX的厨房</Text>
            <Text className='shop-members'>共1人</Text>
          </View>
          <View className='shop-actions'>
            <View className='qr-code'>二维码</View>
            <Text className='notice'>公告：暂无</Text>
          </View>
        </View>

        <View className='search-bar'>
          <Input
            className='search-input'
            placeholder='搜索菜品...'
            value={searchText}
            onInput={this.onSearchChange}
          />
        </View>

        <ScrollView className='menu-grid' scrollY>
          <View className='menu-cards'>
            {filteredItems.map(item => (
              <View key={item.id} className='menu-card'>
                <Image className='card-image' src={item.image || 'https://placehold.co/200x200'} />
                <View className='card-content'>
                  <Text className='card-name'>{item.name}</Text>
                  <Text className='card-sales'>月销 {item.monthSales}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }
}
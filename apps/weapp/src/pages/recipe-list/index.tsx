import { Component } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  cookTime: string
  difficulty: string
  tags: string[]
}

interface State {
  recipes: Recipe[]
  searchText: string
  filteredRecipes: Recipe[]
}

export default class RecipeList extends Component<{}, State> {

  constructor(props) {
    super(props)
    this.state = {
      recipes: [],
      searchText: '',
      filteredRecipes: []
    }
  }

  componentDidMount() {
    this.loadRecipes()
  }

  loadRecipes = () => {
    // 从本地存储加载菜谱
    const recipes = Taro.getStorageSync('recipes') || []
    this.setState({
      recipes,
      filteredRecipes: recipes
    })
  }

  onSearchChange = (e) => {
    const searchText = e.detail.value
    const { recipes } = this.state
    const filteredRecipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchText.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchText.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
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

  navigateToUpload = () => {
    Taro.navigateTo({
      url: '/pages/recipe-upload/index'
    })
  }

  render() {
    const { filteredRecipes, searchText } = this.state

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
            {filteredRecipes.map(recipe => (
              <View 
                key={recipe.id} 
                className='recipe-card'
                onClick={() => this.navigateToDetail(recipe)}
              >
                <View className='recipe-header'>
                  <Text className='recipe-title'>{recipe.title}</Text>
                  <View className='recipe-meta'>
                    <Text className='cook-time'>⏱ {recipe.cookTime}</Text>
                    <Text className='difficulty'>🔥 {recipe.difficulty}</Text>
                  </View>
                </View>
                
                <Text className='recipe-description'>{recipe.description}</Text>
                
                {recipe.tags.length > 0 && (
                  <View className='recipe-tags'>
                    {recipe.tags.map((tag, index) => (
                      <Text key={index} className='tag'>#{tag}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }
}
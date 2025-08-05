import { Component } from 'react'
import { View, Text, Textarea, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { apiService } from '../../utils/api'
import './index.scss'

interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: {
    main: Array<{ name: string; amount: string; unit?: string; note?: string }>
    auxiliary: Array<{ name: string; amount: string; unit?: string; note?: string }>
  }
  sauce: Array<{ name: string; amount: string; unit?: string }>
  steps: Array<{ title: string; content: string[]; time?: number }>
  tips: Array<{ content: string }>
  cookingTime?: number
  servings?: number
  difficulty?: string
  tags: string[]
}

interface State {
  markdownText: string
  uploading: boolean
  previewRecipes: Recipe[]
  isLoggedIn: boolean
  userInfo: any
}

export default class RecipeUpload extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      markdownText: '',
      uploading: false,
      previewRecipes: [],
      isLoggedIn: false,
      userInfo: null
    }
  }

  componentDidMount() {
    // 检查用户是否已登录
    const userInfo = Taro.getStorageSync('userInfo')
    if (!userInfo) {
      Taro.showModal({
        title: '提示',
        content: '上传菜谱需要先登录',
        confirmText: '返回',
        showCancel: false,
        success: () => {
          Taro.navigateBack()
        }
      })
      return
    }
    
    this.setState({
      isLoggedIn: true,
      userInfo
    })
    
    // 设置示例markdown
    const exampleMarkdown = `# 隋卞做带鱼

## 🧂 食材准备

### 主料  
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）  

### 辅料  
- 花雕酒 25g  
- 食用油 130g  
- 蒜 30g  
- 姜 30g  
- 花椒 10g  
- 干辣椒段 150g  
- 葱花 30g  
- 花生米 80g  
- 淀粉 5g  

### 调味汁  
- 酱油 50g  
- 米醋 50g  
- 白糖 80g  
- 味精 1g  
- 料酒 10g  

---

## 👨‍🍳 烹饪步骤

### 🥢 第一步：处理带鱼（00:18）
- 带鱼洗净后打上花刀。
- 用清水冲去一部分腥味。
- 加入花雕酒腌制去腥。
- 用厨房纸将表面水分吸干，备用。

### 🔥 第二步：煎带鱼（00:55）
- 热锅加油（六七成热），放入带鱼煎至表面定型、颜色微黄。
- 大约在 1:38 翻面，煎至 1:55 颜色加深。
- 将带鱼推至锅的一边，并将锅稍微倾斜，腾出空间炒香料。

### 🌶️ 第三步：炒香料（02:48）
- 倾斜锅后，在空的一边加入蒜炒至微黄。
- 加入花椒炒香。
- 加入姜片与干辣椒段，继续炒至辣椒变色出香味。

### 🧪 第四步：调汁翻炒
- 将锅放平，与带鱼一起翻炒均匀。
- 将调好的汁（兑入淀粉）搅拌均匀后倒入锅中。
- 快速翻炒，使带鱼均匀裹上酱汁。

### 🌿 第五步：收尾出锅
- 倒入葱花与花生米。
- 再次翻炒均匀，即可出锅装盘。

---

## ✅ 小贴士
- 带鱼下锅前一定要擦干水分，防止溅油。
- 调味汁建议提前调好，加入淀粉时搅拌均匀避免结块。`
    
    this.setState({ markdownText: exampleMarkdown })
  }

  onTextareaChange = (e: { detail: { value: string } }) => {
    this.setState({ markdownText: e.detail.value })
  }

  parseMarkdown = async (markdown: string): Promise<Recipe[]> => {
    try {
      // Use the API service to parse the markdown
      const response = await apiService.parseMarkdownRecipe(markdown)
      
      if (!response.success || !response.recipe) {
        console.error('Failed to parse markdown:', response.error)
        return []
      }
      
      const recipeData = response.recipe
      
      // Convert API Recipe to component Recipe interface
      const recipe: Recipe = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: recipeData.title || '未命名菜谱',
        description: recipeData.description,
        ingredients: {
          main: Array.isArray(recipeData.ingredients) ? [] : (recipeData.ingredients?.main || []),
          auxiliary: Array.isArray(recipeData.ingredients) ? [] : (recipeData.ingredients?.auxiliary || [])
        },
        sauce: Array.isArray(recipeData.ingredients) ? [] : (recipeData.ingredients?.sauce || []),
        steps: recipeData.steps || [],
        tips: recipeData.tips?.map(tip => 
          typeof tip === 'string' ? { content: tip } : tip
        ) || [],
        cookingTime: recipeData.cookingTime || undefined,
        servings: recipeData.servings || undefined,
        difficulty: recipeData.difficulty || undefined,
        tags: recipeData.tags || []
      }
      
      return [recipe]
    } catch (error) {
      console.error('Error parsing markdown:', error)
      return []
    }
  }

  previewRecipes = async () => {
    const { markdownText } = this.state
    if (!markdownText.trim()) {
      Taro.showToast({
        title: '请输入菜谱内容',
        icon: 'none'
      })
      return
    }
    
    try {
      const recipes = await this.parseMarkdown(markdownText)
      if (recipes.length === 0) {
        Taro.showToast({
          title: '未识别到有效菜谱',
          icon: 'none'
        })
        return
      }
      
      this.setState({ previewRecipes: recipes })
      
      Taro.showToast({
        title: `解析到 ${recipes.length} 个菜谱`,
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '解析失败，请检查格式',
        icon: 'none'
      })
    }
  }

  uploadRecipes = async () => {
    const { previewRecipes } = this.state
    if (previewRecipes.length === 0) {
      Taro.showToast({
        title: '请先预览菜谱',
        icon: 'none'
      })
      return
    }
    
    this.setState({ uploading: true })
    
    try {
      // 获取现有菜谱
      const existingRecipes = Taro.getStorageSync('recipes') || []
      
      // 合并新菜谱
      const allRecipes = [...existingRecipes, ...previewRecipes]
      
      // 保存到本地存储
      Taro.setStorageSync('recipes', allRecipes)
      
      Taro.showToast({
        title: `成功上传 ${previewRecipes.length} 个菜谱`,
        icon: 'success'
      })
      
      // 清空输入
      this.setState({
        markdownText: '',
        previewRecipes: []
      })
      
      // 跳转到菜谱列表
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/recipes/index'
        })
      }, 1500)
      
    } catch (error) {
      Taro.showToast({
        title: '上传失败',
        icon: 'none'
      })
    } finally {
      this.setState({ uploading: false })
    }
  }

  clearContent = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setState({
            markdownText: '',
            previewRecipes: []
          })
        }
      }
    })
  }

  render() {
    const { markdownText, uploading, previewRecipes } = this.state

    return (
      <View className='recipe-upload'>
        <View className='header'>
          <Text className='title'>批量上传菜谱</Text>
          <Text className='subtitle'>支持Markdown格式，可同时上传多个菜谱</Text>
        </View>

        <View className='input-section'>
          <View className='section-header'>
            <Text className='section-title'>📝 菜谱内容</Text>
            <Text className='clear-btn' onClick={this.clearContent}>清空</Text>
          </View>
          
          <View className='markdown-input-container'>
            <Textarea
              className='markdown-input'
              placeholder='请输入Markdown格式的菜谱内容...\n\n支持格式：\n# 菜谱名称\n## 🧂 食材准备\n### 主料\n- 食材1\n### 辅料\n- 食材2\n## 👨‍🍳 烹饪步骤\n### 🥢 第一步：处理食材（00:18）\n- 步骤描述\n### 🔥 第二步：烹饪（00:55）\n- 步骤描述\n## ✅ 小贴士\n- 提示内容'
              value={markdownText}
              onInput={this.onTextareaChange}
                maxlength={-1}
              />
          </View>
        </View>

        {previewRecipes.length > 0 && (
          <View className='preview-section'>
            <Text className='section-title'>👀 预览菜谱 ({previewRecipes.length}个)</Text>
            {previewRecipes.map((recipe, index) => (
              <View key={recipe.id} className='preview-card'>
                <Text className='preview-title'>{index + 1}. {recipe.title}</Text>
                {recipe.description && (
                  <Text className='preview-desc'>{recipe.description}</Text>
                )}
                
                <View className='preview-meta'>
                  <Text className='preview-time'>⏱ {recipe.cookingTime ? `${recipe.cookingTime}分钟` : '未设置'}</Text>
                  <Text className='preview-difficulty'>🔥 {recipe.difficulty || '未设置'}</Text>
                  {recipe.servings && (
                    <Text className='preview-servings'>👥 {recipe.servings}人份</Text>
                  )}
                </View>

                {/* 食材预览 */}
                <View className='preview-ingredients'>
                  <Text className='preview-subtitle'>🧂 食材</Text>
                  {recipe.ingredients?.main?.length > 0 && (
                    <View className='ingredient-group'>
                      <Text className='ingredient-label'>主料：</Text>
                      {recipe.ingredients.main.map((ingredient, idx) => (
                        <Text key={idx} className='ingredient-item'>
                          {ingredient.name} {ingredient.amount}{ingredient.unit}
                          {ingredient.note && ` (${ingredient.note})`}
                        </Text>
                      ))}
                    </View>
                  )}
                  {recipe.ingredients?.auxiliary?.length > 0 && (
                    <View className='ingredient-group'>
                      <Text className='ingredient-label'>辅料：</Text>
                      {recipe.ingredients.auxiliary.map((ingredient, idx) => (
                        <Text key={idx} className='ingredient-item'>
                          {ingredient.name} {ingredient.amount}{ingredient.unit}
                          {ingredient.note && ` (${ingredient.note})`}
                        </Text>
                      ))}
                    </View>
                  )}
                  {recipe.sauce?.length > 0 && (
                    <View className='ingredient-group'>
                      <Text className='ingredient-label'>调味汁：</Text>
                      {recipe.sauce.map((sauce, idx) => (
                        <Text key={idx} className='ingredient-item'>
                          {sauce.name} {sauce.amount}{sauce.unit}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {/* 步骤预览 */}
                <View className='preview-steps'>
                  <Text className='preview-subtitle'>👨‍🍳 烹饪步骤</Text>
                  {recipe.steps?.slice(0, 3).map((step, idx) => (
                    <View key={idx} className='step-item'>
                      <Text className='step-title'>{step.title}</Text>
                      {step.content?.map((content, contentIdx) => (
                        <Text key={contentIdx} className='step-content'>• {content}</Text>
                      ))}
                    </View>
                  ))}
                  {recipe.steps?.length > 3 && (
                    <Text className='more-steps'>... 还有 {recipe.steps?.length - 3} 个步骤</Text>
                  )}
                </View>

                {/* 小贴士预览 */}
                {recipe.tips?.length > 0 && (
                  <View className='preview-tips'>
                    <Text className='preview-subtitle'>✅ 小贴士</Text>
                    {recipe.tips.slice(0, 2).map((tip, idx) => (
                      <Text key={idx} className='tip-item'>• {tip.content}</Text>
                    ))}
                    {recipe.tips.length > 2 && (
                      <Text className='more-tips'>... 还有 {recipe.tips.length - 2} 条小贴士</Text>
                    )}
                  </View>
                )}

                <Text className='preview-count'>
                  食材 {((recipe.ingredients?.main?.length || 0) + (recipe.ingredients?.auxiliary?.length || 0) + (recipe.sauce?.length || 0))} 项 | 步骤 {recipe.steps?.length || 0} 步
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className='actions'>
          <Button 
            className='action-btn secondary' 
            onClick={this.previewRecipes}
            disabled={!markdownText.trim()}
          >
            预览菜谱
          </Button>
          <Button 
            className='action-btn primary' 
            onClick={this.uploadRecipes}
            loading={uploading}
            disabled={previewRecipes.length === 0}
          >
            {uploading ? '上传中...' : '确认上传'}
          </Button>
        </View>
      </View>
    )
  }
}
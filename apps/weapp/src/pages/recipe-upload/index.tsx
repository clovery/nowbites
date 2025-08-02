import { Component } from 'react'
import { View, Text, Textarea, Button, Input } from '@tarojs/components'
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
  servings?: string
  prepTime?: string
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

  parseMarkdown = (markdown: string): Recipe[] => {
    const recipes: Recipe[] = []
    const sections = markdown.split('---').map(s => s.trim()).filter(s => s)
    
    sections.forEach(section => {
      const lines = section.split('\n').map(l => l.trim()).filter(l => l)
      if (lines.length === 0) return
      
      const recipe: Recipe = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: '',
        description: '',
        ingredients: [],
        steps: [],
        cookTime: '',
        difficulty: '',
        tags: [],
        servings: '',
        prepTime: ''
      }
      
      let currentSection = ''
      let stepCounter = 0
      let inIngredientsSection = false
      let inStepsSection = false
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // 标题
        if (line.startsWith('# ')) {
          recipe.title = line.substring(2).trim()
          continue
        }
        
        // 二级标题 - 支持带emoji的格式
        if (line.startsWith('## ')) {
          const sectionTitle = line.substring(3).trim()
          // 移除emoji和空格，获取纯文本
          const cleanTitle = sectionTitle.replace(/^[^\u4e00-\u9fa5a-zA-Z]*/, '').trim()
          
          if (cleanTitle.includes('食材') || cleanTitle.includes('准备')) {
            currentSection = '食材'
            inIngredientsSection = true
            inStepsSection = false
          } else if (cleanTitle.includes('步骤') || cleanTitle.includes('烹饪')) {
            currentSection = '制作步骤'
            inIngredientsSection = false
            inStepsSection = true
          } else if (cleanTitle.includes('贴士') || cleanTitle.includes('提示')) {
            currentSection = '小贴士'
            inIngredientsSection = false
            inStepsSection = false
          }
          stepCounter = 0
          continue
        }
        
        // 三级标题 - 支持带emoji的格式
        if (line.startsWith('### ')) {
          const subsectionTitle = line.substring(4).trim()
          const cleanSubtitle = subsectionTitle.replace(/^[^\u4e00-\u9fa5a-zA-Z]*/, '').trim()
          
          if (inIngredientsSection) {
            // 食材子分类（主料、辅料、调味汁等）
            currentSection = '食材'
          } else if (inStepsSection) {
            // 步骤子分类
            currentSection = '制作步骤'
            stepCounter = 0
          }
          continue
        }
        
        // 描述（第一个非标题行）
        if (!recipe.description && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('-') && line.length > 0) {
          recipe.description = line
          continue
        }
        
        // 元数据
        if (line.startsWith('**烹饪时间：**')) {
          recipe.cookTime = line.replace('**烹饪时间：**', '').trim()
        } else if (line.startsWith('**难度：**')) {
          recipe.difficulty = line.replace('**难度：**', '').trim()
        } else if (line.startsWith('**份量：**')) {
          recipe.servings = line.replace('**份量：**', '').trim()
        } else if (line.startsWith('**标签：**')) {
          const tagsStr = line.replace('**标签：**', '').trim()
          recipe.tags = tagsStr.split(',').map(t => t.trim()).filter(t => t)
        }
        
        // 食材 - 支持带emoji的格式
        if (inIngredientsSection && line.startsWith('- ')) {
          const ingredient = line.substring(2).trim()
          // 移除可能的emoji前缀
          const cleanIngredient = ingredient.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]*/, '').trim()
          if (cleanIngredient) {
            recipe.ingredients.push(cleanIngredient)
          }
        }
        
        // 步骤 - 支持带emoji和时间戳的格式
        if (inStepsSection) {
          // 匹配带emoji的步骤标题
          if (line.match(/^###\s*[^\u4e00-\u9fa5a-zA-Z]*\s*第.*步/)) {
            stepCounter++
            continue
          }
          
          // 匹配带时间戳的步骤
          if (line.match(/^###\s*[^\u4e00-\u9fa5a-zA-Z]*\s*.*\(\d{1,2}:\d{2}\)/)) {
            stepCounter++
            continue
          }
          
          // 普通步骤
          if (line.startsWith('- ') && stepCounter > 0) {
            const step = line.substring(2).trim()
            // 移除可能的emoji前缀
            const cleanStep = step.replace(/^[^\u4e00-\u9fa5a-zA-Z0-9]*/, '').trim()
            if (cleanStep) {
              recipe.steps.push(cleanStep)
            }
          }
        }
      }
      
      if (recipe.title) {
        recipes.push(recipe)
      }
    })
    
    return recipes
  }

  previewRecipes = () => {
    const { markdownText } = this.state
    if (!markdownText.trim()) {
      Taro.showToast({
        title: '请输入菜谱内容',
        icon: 'none'
      })
      return
    }
    
    try {
      const recipes = this.parseMarkdown(markdownText)
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
          url: '/pages/recipe-list/index'
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
          
          <Textarea
            className='markdown-input'
            placeholder='请输入Markdown格式的菜谱内容...\n\n支持格式：\n# 菜谱名称\n## 🧂 食材准备\n### 主料\n- 食材1\n### 辅料\n- 食材2\n## 👨‍🍳 烹饪步骤\n### 🥢 第一步：处理食材（00:18）\n- 步骤描述\n### 🔥 第二步：烹饪（00:55）\n- 步骤描述\n## ✅ 小贴士\n- 提示内容'
            value={markdownText}
            onInput={this.onTextareaChange}
            maxlength={-1}
          />
        </View>

        {previewRecipes.length > 0 && (
          <View className='preview-section'>
            <Text className='section-title'>👀 预览菜谱 ({previewRecipes.length}个)</Text>
            {previewRecipes.map((recipe, index) => (
              <View key={recipe.id} className='preview-card'>
                <Text className='preview-title'>{index + 1}. {recipe.title}</Text>
                <Text className='preview-desc'>{recipe.description}</Text>
                <View className='preview-meta'>
                  <Text className='preview-time'>⏱ {recipe.cookTime}</Text>
                  <Text className='preview-difficulty'>🔥 {recipe.difficulty}</Text>
                </View>
                <Text className='preview-count'>
                  食材 {recipe.ingredients.length} 项 | 步骤 {recipe.steps.length} 步
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
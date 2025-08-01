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
    const exampleMarkdown = `# 红烧肉

经典的红烧肉做法，肥而不腻，入口即化。

**烹饪时间：** 1小时  
**难度：** 中等  
**份量：** 4人份  
**标签：** 家常菜,肉类,下饭菜

## 食材

- 五花肉 500g
- 生抽 3勺
- 老抽 1勺
- 冰糖 30g
- 料酒 2勺
- 葱 2根
- 姜 3片
- 八角 2个

## 制作步骤

1. 五花肉洗净切块，冷水下锅焯水去腥
2. 热锅下油，放入冰糖炒糖色
3. 下入肉块翻炒上色
4. 加入生抽、老抽、料酒调色调味
5. 加入热水没过肉块，放入葱姜八角
6. 大火烧开转小火炖煮45分钟
7. 最后大火收汁即可

---

# 番茄鸡蛋面

简单快手的番茄鸡蛋面，营养丰富。

**烹饪时间：** 15分钟  
**难度：** 简单  
**份量：** 1人份  
**标签：** 快手菜,面条,营养

## 食材

- 挂面 100g
- 鸡蛋 2个
- 番茄 2个
- 葱花 适量
- 盐 适量
- 糖 1勺

## 制作步骤

1. 番茄去皮切块，鸡蛋打散
2. 热锅炒鸡蛋盛起备用
3. 锅内放油炒番茄出汁
4. 加入适量水烧开
5. 下入面条煮熟
6. 加入炒蛋调味即可`
    
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
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // 标题
        if (line.startsWith('# ')) {
          recipe.title = line.substring(2).trim()
          continue
        }
        
        // 二级标题
        if (line.startsWith('## ')) {
          currentSection = line.substring(3).trim()
          stepCounter = 0
          continue
        }
        
        // 描述（第一个非标题行）
        if (!recipe.description && !line.startsWith('#') && !line.startsWith('**') && line.length > 0) {
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
        
        // 食材
        if (currentSection === '食材' && line.startsWith('- ')) {
          recipe.ingredients.push(line.substring(2).trim())
        }
        
        // 步骤
        if (currentSection === '制作步骤' && /^\d+\./.test(line)) {
          recipe.steps.push(line.replace(/^\d+\.\s*/, '').trim())
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
            placeholder='请输入Markdown格式的菜谱内容...\n\n示例格式：\n# 菜谱名称\n菜谱描述\n**烹饪时间：** 30分钟\n**难度：** 简单\n## 食材\n- 食材1\n- 食材2\n## 制作步骤\n1. 步骤1\n2. 步骤2'
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
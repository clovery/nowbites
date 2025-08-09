import { Component } from "react"
import { View, Text, Input, Textarea, Switch, Picker } from "@tarojs/components"
import { AtButton, AtIcon, AtInput, AtList, AtListItem, AtCard } from "taro-ui"
import Taro from "@tarojs/taro"
import { recipeService } from "../../../services/recipe"

interface Ingredient {
  name: string
  amount: string
  unit?: string
  note?: string
}

interface Step {
  title: string
  content: string[]
  time?: number
}

interface Tip {
  content: string
}

interface State {
  // 基本信息
  title: string
  description: string
  cookingTime: number | null
  servings: number | null
  difficulty: string
  tags: string[]
  isPublic: boolean
  
  // 食材
  mainIngredients: Ingredient[]
  auxiliaryIngredients: Ingredient[]
  sauceIngredients: Ingredient[]
  
  // 步骤
  steps: Step[]
  
  // 小贴士
  tips: Tip[]
  
  // 表单控制
  isSubmitting: boolean
  
  // 输入控制
  newIngredientName: string
  newIngredientAmount: string
  newIngredientUnit: string
  newIngredientNote: string
  currentIngredientType: string
  
  newStepTitle: string
  newStepContent: string
  newStepTime: number | null
  
  newTip: string
  newTag: string
}

const difficultyOptions = ["简单", "中等", "困难"]
const ingredientTypes = ["主料", "辅料", "调味汁"]

export default class RecipeNew extends Component<{}, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      title: "",
      description: "",
      cookingTime: null,
      servings: null,
      difficulty: "简单",
      tags: [],
      isPublic: true,
      
      mainIngredients: [],
      auxiliaryIngredients: [],
      sauceIngredients: [],
      
      steps: [],
      tips: [],
      
      isSubmitting: false,
      
      newIngredientName: "",
      newIngredientAmount: "",
      newIngredientUnit: "",
      newIngredientNote: "",
      currentIngredientType: "主料",
      
      newStepTitle: "",
      newStepContent: "",
      newStepTime: null,
      
      newTip: "",
      newTag: ""
    }
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "创建菜谱"
    })
  }

  // 添加食材
  handleAddIngredient = () => {
    const { newIngredientName, newIngredientAmount, newIngredientUnit, newIngredientNote, currentIngredientType } = this.state
    
    if (!newIngredientName.trim() || !newIngredientAmount.trim()) {
      Taro.showToast({
        title: "请填写食材名称和用量",
        icon: "none"
      })
      return
    }

    const newIngredient: Ingredient = {
      name: newIngredientName.trim(),
      amount: newIngredientAmount.trim(),
      unit: newIngredientUnit.trim() || undefined,
      note: newIngredientNote.trim() || undefined
    }

    let updateState: any = {
      newIngredientName: "",
      newIngredientAmount: "",
      newIngredientUnit: "",
      newIngredientNote: ""
    }

    if (currentIngredientType === "主料") {
      updateState.mainIngredients = [...this.state.mainIngredients, newIngredient]
    } else if (currentIngredientType === "辅料") {
      updateState.auxiliaryIngredients = [...this.state.auxiliaryIngredients, newIngredient]
    } else {
      updateState.sauceIngredients = [...this.state.sauceIngredients, newIngredient]
    }

    this.setState(updateState)
  }

  // 删除食材
  handleRemoveIngredient = (type: string, index: number) => {
    if (type === "主料") {
      const mainIngredients = [...this.state.mainIngredients]
      mainIngredients.splice(index, 1)
      this.setState({ mainIngredients })
    } else if (type === "辅料") {
      const auxiliaryIngredients = [...this.state.auxiliaryIngredients]
      auxiliaryIngredients.splice(index, 1)
      this.setState({ auxiliaryIngredients })
    } else {
      const sauceIngredients = [...this.state.sauceIngredients]
      sauceIngredients.splice(index, 1)
      this.setState({ sauceIngredients })
    }
  }

  // 添加步骤
  handleAddStep = () => {
    const { newStepTitle, newStepContent, newStepTime } = this.state
    
    if (!newStepTitle.trim() || !newStepContent.trim()) {
      Taro.showToast({
        title: "请填写步骤标题和内容",
        icon: "none"
      })
      return
    }

    const newStep: Step = {
      title: newStepTitle.trim(),
      content: newStepContent.trim().split('\n').filter(line => line.trim()),
      time: newStepTime || undefined
    }

    this.setState({
      steps: [...this.state.steps, newStep],
      newStepTitle: "",
      newStepContent: "",
      newStepTime: null
    })
  }

  // 删除步骤
  handleRemoveStep = (index: number) => {
    const steps = [...this.state.steps]
    steps.splice(index, 1)
    this.setState({ steps })
  }

  // 添加小贴士
  handleAddTip = () => {
    const { newTip } = this.state
    
    if (!newTip.trim()) {
      Taro.showToast({
        title: "请填写小贴士内容",
        icon: "none"
      })
      return
    }

    const tip: Tip = {
      content: newTip.trim()
    }

    this.setState({
      tips: [...this.state.tips, tip],
      newTip: ""
    })
  }

  // 删除小贴士
  handleRemoveTip = (index: number) => {
    const tips = [...this.state.tips]
    tips.splice(index, 1)
    this.setState({ tips })
  }

  // 添加标签
  handleAddTag = () => {
    const { newTag, tags } = this.state
    
    if (!newTag.trim()) {
      Taro.showToast({
        title: "请填写标签",
        icon: "none"
      })
      return
    }

    if (tags.includes(newTag.trim())) {
      Taro.showToast({
        title: "标签已存在",
        icon: "none"
      })
      return
    }

    this.setState({
      tags: [...tags, newTag.trim()],
      newTag: ""
    })
  }

  // 删除标签
  handleRemoveTag = (index: number) => {
    const tags = [...this.state.tags]
    tags.splice(index, 1)
    this.setState({ tags })
  }

  // 提交菜谱
  handleSubmit = async () => {
    const { title, description, cookingTime, servings, difficulty, tags, isPublic, mainIngredients, auxiliaryIngredients, sauceIngredients, steps, tips } = this.state

    // 验证必填字段
    if (!title.trim()) {
      Taro.showToast({
        title: "请填写菜谱标题",
        icon: "none"
      })
      return
    }

    if (mainIngredients.length === 0 && auxiliaryIngredients.length === 0) {
      Taro.showToast({
        title: "请添加至少一个食材",
        icon: "none"
      })
      return
    }

    if (steps.length === 0) {
      Taro.showToast({
        title: "请添加至少一个烹饪步骤",
        icon: "none"
      })
      return
    }

    this.setState({ isSubmitting: true })

    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: [...mainIngredients, ...auxiliaryIngredients],
        sauce: sauceIngredients,
        steps,
        tips,
        cookingTime: cookingTime || undefined,
        servings: servings || undefined,
        difficulty,
        tags,
        isPublic
      }

      await recipeService.createRecipe(recipeData)

      Taro.showToast({
        title: "菜谱创建成功",
        icon: "success"
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error("创建菜谱失败:", error)
      Taro.showToast({
        title: "创建失败，请重试",
        icon: "none"
      })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }



  // 渲染基本信息部分
  renderBasicInfo = () => {
    const { title, description, cookingTime, servings, difficulty, tags, isPublic, newTag } = this.state

    return (
      <View className="px-4 pt-4 pb-3">
        <View className="bg-white rounded-xl overflow-hidden">
          {/* Header */}
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">基本信息</Text>
          </View>
          
          {/* Form Fields */}
          <View className="px-4 py-3">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                菜谱名称 <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <AtInput
                  name="title"
                  type="text"
                  placeholder="请输入菜谱名称"
                  value={title}
                  onChange={(value) => this.setState({ title: value as string })}
                  border={false}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">描述</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Textarea
                  className="w-full text-base text-gray-900"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}
                  placeholder="简单描述一下这道菜..."
                  value={description}
                  onInput={(e) => this.setState({ description: e.detail.value })}
                  maxlength={200}
                />
              </View>
            </View>

            <View className="flex gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-2">烹饪时间</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <AtInput
                    name="cookingTime"
                    type="number"
                    placeholder="30 分钟"
                    value={cookingTime?.toString() || ""}
                    onChange={(value) => this.setState({ cookingTime: value ? parseInt(value as string) : null })}
                    border={false}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-2">份数</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <AtInput
                    name="servings"
                    type="number"
                    placeholder="2 人份"
                    value={servings?.toString() || ""}
                    onChange={(value) => this.setState({ servings: value ? parseInt(value as string) : null })}
                    border={false}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">难度</Text>
              <Picker
                mode="selector"
                range={difficultyOptions}
                value={difficultyOptions.indexOf(difficulty)}
                onChange={(e) => this.setState({ difficulty: difficultyOptions[e.detail.value as number] || "简单" })}
              >
                <View className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <Text className="text-sm text-gray-900">{difficulty}</Text>
                  <AtIcon value="chevron-down" size="16" color="#9CA3AF" />
                </View>
              </Picker>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">标签</Text>
              <View className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, index) => (
                  <View 
                    key={index} 
                    className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full" 
                    onClick={() => this.handleRemoveTag(index)}
                  >
                    <Text className="text-xs font-medium text-blue-700">{tag}</Text>
                    <AtIcon value="close" size="10" color="#1D4ED8" />
                  </View>
                ))}
              </View>
              <View className="flex gap-2">
                <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm text-gray-900"
                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                    placeholder="添加标签"
                    value={newTag}
                    onInput={(e) => this.setState({ newTag: e.detail.value })}
                    confirmType="done"
                    onConfirm={this.handleAddTag}
                  />
                </View>
                <View className="bg-blue-500 rounded-lg px-3 py-2" onClick={this.handleAddTag}>
                  <Text className="text-white text-sm font-medium">添加</Text>
                </View>
              </View>
            </View>

            <View className="mb-1">
              <View className="flex items-center justify-between py-1">
                <View>
                  <Text className="text-sm font-medium text-gray-900">公开菜谱</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">开启后其他用户可以看到此菜谱</Text>
                </View>
                <Switch
                  checked={isPublic}
                  onChange={(e) => this.setState({ isPublic: e.detail.value })}
                  color="#007AFF"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // 渲染食材部分
  renderIngredients = () => {
    const { mainIngredients, auxiliaryIngredients, sauceIngredients, newIngredientName, newIngredientAmount, newIngredientUnit, newIngredientNote, currentIngredientType } = this.state

    return (
      <View className="px-4 py-3 space-y-4">
        <View className="bg-white rounded-xl overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">添加食材</Text>
          </View>
          
          <View className="px-4 py-3">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">食材类型</Text>
              <Picker
                mode="selector"
                range={ingredientTypes}
                value={ingredientTypes.indexOf(currentIngredientType)}
                onChange={(e) => this.setState({ currentIngredientType: ingredientTypes[e.detail.value as number] || "主料" })}
              >
                <View className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <Text className="text-sm text-gray-900">{currentIngredientType}</Text>
                  <AtIcon value="chevron-down" size="16" color="#9CA3AF" />
                </View>
              </Picker>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                食材名称 <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full text-sm text-gray-900"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                  placeholder="例如: 鸡蛋"
                  value={newIngredientName}
                  onInput={(e) => this.setState({ newIngredientName: e.detail.value })}
                />
              </View>
            </View>

            <View className="flex gap-2 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-2">
                  用量 <Text className="text-red-500">*</Text>
                </Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm text-gray-900"
                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                    placeholder="2"
                    value={newIngredientAmount}
                    onInput={(e) => this.setState({ newIngredientAmount: e.detail.value })}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-2">单位</Text>
                <View className="bg-gray-50 rounded-lg px-3 py-2">
                  <Input
                    className="w-full text-sm text-gray-900"
                    style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                    placeholder="个"
                    value={newIngredientUnit}
                    onInput={(e) => this.setState({ newIngredientUnit: e.detail.value })}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">备注</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full text-sm text-gray-900"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                  placeholder="例如: 中等大小"
                  value={newIngredientNote}
                  onInput={(e) => this.setState({ newIngredientNote: e.detail.value })}
                />
              </View>
            </View>

            <View className="bg-blue-500 rounded-lg py-3" onClick={this.handleAddIngredient}>
              <Text className="text-center text-white font-medium text-sm">添加食材</Text>
            </View>
          </View>
        </View>

        {/* 主料列表 */}
        {mainIngredients.length > 0 && (
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-900">主料</Text>
            </View>
            <View className="px-4 py-1">
              {mainIngredients.map((ingredient, index) => (
                <View 
                  key={index} 
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                  onClick={() => this.handleRemoveIngredient("主料", index)}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{ingredient.name}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {ingredient.amount}{ingredient.unit || ""} {ingredient.note || ""}
                    </Text>
                  </View>
                  <AtIcon value="trash" size="14" color="#EF4444" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 辅料列表 */}
        {auxiliaryIngredients.length > 0 && (
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-900">辅料</Text>
            </View>
            <View className="px-4 py-1">
              {auxiliaryIngredients.map((ingredient, index) => (
                <View 
                  key={index} 
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                  onClick={() => this.handleRemoveIngredient("辅料", index)}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{ingredient.name}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {ingredient.amount}{ingredient.unit || ""} {ingredient.note || ""}
                    </Text>
                  </View>
                  <AtIcon value="trash" size="14" color="#EF4444" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 调味汁列表 */}
        {sauceIngredients.length > 0 && (
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-900">调味汁</Text>
            </View>
            <View className="px-4 py-1">
              {sauceIngredients.map((ingredient, index) => (
                <View 
                  key={index} 
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                  onClick={() => this.handleRemoveIngredient("调味汁", index)}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">{ingredient.name}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {ingredient.amount}{ingredient.unit || ""} {ingredient.note || ""}
                    </Text>
                  </View>
                  <AtIcon value="trash" size="14" color="#EF4444" />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染步骤部分
  renderSteps = () => {
    const { steps, newStepTitle, newStepContent, newStepTime } = this.state

    return (
      <View className="px-4 py-3 space-y-4">
        <View className="bg-white rounded-xl overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">添加步骤</Text>
          </View>
          
          <View className="px-4 py-3">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                步骤标题 <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full text-sm text-gray-900"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                  placeholder="例如: 处理食材"
                  value={newStepTitle}
                  onInput={(e) => this.setState({ newStepTitle: e.detail.value })}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">用时(分钟)</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Input
                  className="w-full text-sm text-gray-900"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                  type="number"
                  placeholder="5"
                  value={newStepTime?.toString() || ""}
                  onInput={(e) => this.setState({ newStepTime: e.detail.value ? parseInt(e.detail.value) : null })}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                步骤内容 <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Textarea
                  className="w-full text-sm text-gray-900"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}
                  placeholder="详细描述此步骤的操作方法，每行一个要点..."
                  value={newStepContent}
                  onInput={(e) => this.setState({ newStepContent: e.detail.value })}
                  maxlength={500}
                />
              </View>
            </View>

            <View className="bg-blue-500 rounded-lg py-3" onClick={this.handleAddStep}>
              <Text className="text-center text-white font-medium text-sm">添加步骤</Text>
            </View>
          </View>
        </View>

        {/* 步骤列表 */}
        {steps.length > 0 && (
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-900">已添加的步骤</Text>
            </View>
            <View className="px-4 py-1">
              {steps.map((step, index) => (
                <View 
                  key={index} 
                  className="py-3 border-b border-gray-50 last:border-b-0" 
                  onClick={() => this.handleRemoveStep(index)}
                >
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <View className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Text className="text-white text-xs font-semibold">{index + 1}</Text>
                      </View>
                      <Text className="text-sm font-semibold text-gray-900">{step.title}</Text>
                    </View>
                    <View className="flex items-center gap-1">
                      {step.time && (
                        <Text className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {step.time}分钟
                        </Text>
                      )}
                      <AtIcon value="trash" size="14" color="#EF4444" />
                    </View>
                  </View>
                  <View className="ml-7 space-y-0.5">
                    {step.content.map((content, contentIndex) => (
                      <Text key={contentIndex} className="text-gray-700 text-xs leading-relaxed">
                        • {content}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染小贴士部分
  renderTips = () => {
    const { tips, newTip } = this.state

    return (
      <View className="px-4 py-3 pb-4 space-y-4">
        <View className="bg-white rounded-xl overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">添加小贴士</Text>
          </View>
          
          <View className="px-4 py-3">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">小贴士内容</Text>
              <View className="bg-gray-50 rounded-lg px-3 py-2">
                <Textarea
                  className="w-full text-sm text-gray-900"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Icons, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}
                  placeholder="分享一些制作技巧或注意事项..."
                  value={newTip}
                  onInput={(e) => this.setState({ newTip: e.detail.value })}
                  maxlength={200}
                />
              </View>
            </View>

            <View className="bg-blue-500 rounded-lg py-3" onClick={this.handleAddTip}>
              <Text className="text-center text-white font-medium text-sm">添加小贴士</Text>
            </View>
          </View>
        </View>

        {/* 小贴士列表 */}
        {tips.length > 0 && (
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-900">已添加的小贴士</Text>
            </View>
            <View className="px-4 py-1">
              {tips.map((tip, index) => (
                <View 
                  key={index} 
                  className="flex items-start justify-between py-3 border-b border-gray-50 last:border-b-0"
                  onClick={() => this.handleRemoveTip(index)}
                >
                  <View className="flex-1 mr-2">
                    <View className="flex items-center gap-1.5 mb-1">
                      <View className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Text className="text-white text-xs font-bold">!</Text>
                      </View>
                      <Text className="text-sm font-medium text-gray-900">小贴士 {index + 1}</Text>
                    </View>
                    <Text className="text-xs text-gray-700 leading-relaxed ml-5">
                      {tip.content}
                    </Text>
                  </View>
                  <AtIcon value="trash" size="14" color="#EF4444" />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }

  render() {
    const { isSubmitting } = this.state

    return (
      <View className="min-h-screen bg-gray-100">
        {/* 内容区域 */}
        <View className="pb-16">
          {this.renderBasicInfo()}
          {this.renderIngredients()}
          {this.renderSteps()}
          {this.renderTips()}
        </View>

        {/* 底部操作按钮 */}
        <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <View 
            className={`w-full rounded-lg py-3 ${
              isSubmitting 
                ? "bg-gray-400" 
                : "bg-blue-500 active:bg-blue-600"
            }`}
            onClick={isSubmitting ? undefined : this.handleSubmit}
          >
            <Text className="text-center text-white font-medium text-base">
              {isSubmitting ? "创建中..." : "创建菜谱"}
            </Text>
          </View>
        </View>
      </View>
    )
  }
}
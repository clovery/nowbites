import { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
  Image,
  Checkbox,
  Input,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import MealPlanService, { Recipe } from "@/services/meal-plan";

interface MealPlanItem {
  id: string;
  title: string;
  cookTime: string;
  completed?: boolean;
  planId: string;
  order: number;
  recipeId?: string;
  createdAt: string;
  updatedAt: string;
  recipe?: Recipe;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  mealPlanItems: MealPlanItem[];
  creator?: {
    id: string;
    nickName: string;
    avatarUrl: string;
  };
}

interface SelectedItem {
  recipeId: string;
  title: string;
  selected: boolean;
}

interface State {
  planId: string;
  planData: Plan | null;
  loading: boolean;
  selectedItems: SelectedItem[];
  submitting: boolean;
  availableRecipes: Recipe[];
  loadingRecipes: boolean;
  activeTab: "menu" | "selected";
}

export default class MealPlanShare extends Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      planId: "",
      planData: null,
      loading: false,
      selectedItems: [],
      submitting: false,
      availableRecipes: [],
      loadingRecipes: false,
      activeTab: "menu",
    };
  }

  componentDidMount() {
    const params = Taro.getCurrentInstance().router?.params;

    if (params?.id) {
      this.setState({ planId: params.id }, () => {
        this.loadPlanData();
        this.loadAvailableRecipes();
      });
    }
  }

  loadPlanData = async () => {
    const { planId } = this.state;
    if (!planId) return;

    this.setState({ loading: true });
    try {
      const response = await MealPlanService.getPlan(planId);

      this.setState({ planData: response });
    } catch (error) {
      console.error("加载计划数据失败:", error);
      Taro.showToast({
        title: "加载失败",
        icon: "error",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  loadAvailableRecipes = async () => {
    this.setState({ loadingRecipes: true });
    try {
      // 获取当前用户的菜谱库
      const recipes = await MealPlanService.getMyRecipes();
      this.setState({
        availableRecipes: recipes,
        selectedItems: recipes.map((recipe) => ({
          recipeId: recipe.id,
          title: recipe.title,
          selected: false,
        })),
      });
    } catch (error) {
      console.error("加载菜谱失败:", error);
      Taro.showToast({
        title: "加载菜谱失败",
        icon: "error",
      });
    } finally {
      this.setState({ loadingRecipes: false });
    }
  };

  handleItemSelect = (recipeId: string) => {
    const { selectedItems } = this.state;
    const updatedItems = selectedItems.map((item) =>
      item.recipeId === recipeId ? { ...item, selected: !item.selected } : item
    );
    this.setState({ selectedItems: updatedItems });
  };

  switchTab = (tab: "menu" | "selected") => {
    this.setState({ activeTab: tab });
  };

  showOrderForm = () => {
    const { selectedItems } = this.state;
    const hasSelectedItems = selectedItems.some((item) => item.selected);

    if (!hasSelectedItems) {
      Taro.showToast({
        title: "请至少选择一个菜品",
        icon: "none",
      });
      return;
    }

    // 直接提交点餐，不需要确认表单
    this.submitOrder();
  };

  submitOrder = async () => {
    const { selectedItems, planId } = this.state;

    this.setState({ submitting: true });
    try {
      const selectedRecipeIds = selectedItems
        .filter((item) => item.selected)
        .map((item) => item.recipeId);

      await MealPlanService.submitOrder({
        planId,
        user: {
          id: "",
        },
        selectedItems: selectedRecipeIds,
      });

      Taro.showToast({
        title: "点餐成功！",
        icon: "success",
      });

      // 延迟返回上一页
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error: any) {
      console.error("提交点餐失败:", error);
      Taro.showToast({
        title: error.message || "提交失败",
        icon: "error",
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  getDifficultyText = (cookingTime?: number) => {
    if (!cookingTime) return "";
    if (cookingTime <= 30) return "简单";
    if (cookingTime <= 60) return "中等";
    return "复杂";
  };

  render() {
    const {
      planData,
      loading,
      selectedItems,
      submitting,
      availableRecipes,
      loadingRecipes,
      activeTab,
    } = this.state;

    if (loading) {
      return (
        <View className="min-h-screen bg-gray-50">
          <View className="flex flex-col items-center justify-center h-60vh">
            <Text className="text-lg text-gray-600 text-center">加载中...</Text>
          </View>
        </View>
      );
    }

    if (!planData) {
      return (
        <View className="min-h-screen bg-gray-50">
          <View className="flex flex-col items-center justify-center h-60vh">
            <Text className="text-lg text-red-500 text-center">
              计划不存在或已被删除
            </Text>
          </View>
        </View>
      );
    }

    const selectedCount = selectedItems.filter((item) => item.selected).length;

    return (
      <View className="min-h-screen bg-gray-50">
        {/* Header */}
        <View className="bg-white py-6 text-center border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-1 block">
            用餐计划
          </Text>
          <Text className="text-sm text-gray-500 block">
            请选择您想要的菜品
          </Text>
        </View>

        <ScrollView
          className="pb-4 h-[calc(100vh-120rpx)] px-4 box-border"
          scrollY
        >
          {/* Plan Info */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2 block">
              {planData.name}
            </Text>
            {planData.description && (
              <Text className="text-sm text-gray-600 leading-relaxed mb-2 block">
                {planData.description}
              </Text>
            )}
            <Text className="text-xs text-gray-500 mb-2 block">
              用餐时间：{this.formatDate(planData.date)}
            </Text>
            {planData.creator && (
              <View className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <Image
                  src={planData.creator.avatarUrl}
                  className="w-12 h-12 rounded-full"
                />
                <Text className="text-xs text-gray-600">
                  {planData.creator.nickName} 的厨房
                </Text>
              </View>
            )}
          </View>

          {/* Ordered Items */}
          {planData.mealPlanItems.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-3 block">
                已点菜品
              </Text>
              <View className="flex flex-col gap-2">
                {planData.mealPlanItems.map((item, index) => (
                  <View
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <View className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-800 mb-1 block">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-600 block">
                        烹饪时间：{item.cookTime}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tab Container */}
          <View className="bg-white rounded-lg p-1 mb-4 shadow-sm">
            <View className="flex">
              <View
                className={`flex-1 py-3 text-center rounded-md transition-all duration-200 ${
                  activeTab === "menu"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600"
                }`}
                onClick={() => this.switchTab("menu")}
              >
                <Text className="text-sm font-medium">菜谱库</Text>
              </View>
              <View
                className={`flex-1 py-3 text-center rounded-md transition-all duration-200 ${
                  activeTab === "selected"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600"
                }`}
                onClick={() => this.switchTab("selected")}
              >
                <Text className="text-sm font-medium">
                  我的选择 ({selectedCount})
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Section */}
          {activeTab === "menu" && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              {loadingRecipes ? (
                <View className="text-center py-8">
                  <Text className="text-base text-gray-600">加载菜谱中...</Text>
                </View>
              ) : (
                <View className="flex flex-col gap-3">
                  {availableRecipes.map((recipe) => {
                    const selectedItem = selectedItems.find(
                      (si) => si.recipeId === recipe.id
                    );
                    const isSelected = selectedItem?.selected || false;

                    return (
                      <View
                        key={recipe.id}
                        className={`border rounded-lg p-3 transition-all duration-200 bg-white ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 transform scale-98"
                            : "border-gray-200"
                        }`}
                        onClick={() => this.handleItemSelect(recipe.id)}
                      >
                        <View className="flex items-center gap-3">
                          <View className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {recipe.coverImage ? (
                              <Image
                                src={recipe.coverImage}
                                className="w-full h-full"
                                mode="aspectFill"
                              />
                            ) : (
                              <View className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                                <Text className="text-2xl">🍽️</Text>
                              </View>
                            )}
                          </View>

                          <View className="flex-1 min-w-0">
                            <Text className="text-base font-bold text-gray-900 mb-1 block">
                              {recipe.title}
                            </Text>
                            {recipe.description && (
                              <Text className="text-xs text-gray-600 mb-1 block leading-relaxed">
                                {recipe.description}
                              </Text>
                            )}
                            {recipe.cookingTime && (
                              <Text className="text-xs text-gray-600 mb-1 block">
                                烹饪时间：{recipe.cookingTime}分钟
                              </Text>
                            )}
                            {recipe.cookingTime && (
                              <Text className="text-xs text-gray-500 block">
                                难度：
                                {this.getDifficultyText(recipe.cookingTime)}
                              </Text>
                            )}
                          </View>

                          <View className="flex-shrink-0">
                            <Checkbox
                              value={recipe.id}
                              checked={isSelected}
                              className="scale-110"
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Selected Section */}
          {activeTab === "selected" && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              {selectedItems.filter((item) => item.selected).length === 0 ? (
                <View className="text-center py-12">
                  <Text className="text-base text-gray-600 mb-2 block">
                    还没有选择任何菜品
                  </Text>
                  <Text className="text-xs text-gray-500 block">
                    切换到"菜谱库"选择您想要的菜品
                  </Text>
                </View>
              ) : (
                <View className="flex flex-col gap-2">
                  {selectedItems
                    .filter((item) => item.selected)
                    .map((item, index) => (
                      <View
                        key={item.recipeId}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <View className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-gray-800 block">
                            {item.title}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1 bg-red-500 text-white rounded-full text-xs transition-all duration-200 active:bg-red-600"
                          onClick={() => this.handleItemSelect(item.recipeId)}
                        >
                          <Text className="text-white">移除</Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </View>
          )}

          {/* Action Section */}
          <View className="py-4">
            <Button
              className="w-full h-12 bg-red-500 text-white border-none rounded-lg text-base font-bold flex items-center justify-center transition-all duration-200 active:scale-98 disabled:bg-gray-300 disabled:text-gray-500"
              onClick={this.showOrderForm}
              disabled={selectedCount === 0}
              loading={submitting}
            >
              {submitting ? "点餐中..." : `确认点餐 (${selectedCount})`}
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }
}

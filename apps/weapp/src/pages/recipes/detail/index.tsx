import { Component } from "react";
import { View, Text, ScrollView, Button, Image } from "@tarojs/components";
import { AtIcon, AtTag } from "taro-ui";
import Taro from "@tarojs/taro";
import { Recipe } from "@nowbites/types";

import { apiService, recipeService } from "../../../utils/api";
import styles from "./index.module.scss";

interface State {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
}

export default class RecipeDetail extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      recipe: null,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    const params = Taro.getCurrentInstance().router?.params;
    const id = params?.id;
    if (id) {
      this.loadRecipe(id);
    } else {
      Taro.showToast({
        title: "参数错误",
        icon: "error",
      });
      Taro.navigateBack();
    }
  }

  loadRecipe = async (id: string) => {
    try {
      this.setState({ loading: true, error: null });

      const recipe = await apiService.getRecipe(id);

      this.setState({
        recipe,
        loading: false,
      });

      Taro.setNavigationBarTitle({
        title: recipe.title,
      });
    } catch (error) {
      console.error("Failed to load recipe:", error);
      this.setState({
        loading: false,
        error: "加载菜谱失败",
      });

      Taro.showToast({
        title: "加载失败",
        icon: "error",
      });
    }
  };

  addToMealPlan = () => {
    const { recipe } = this.state;
    if (!recipe) return;

    Taro.showActionSheet({
      itemList: ["今天", "明天", "后天", "选择其他日期"],
      success: (res) => {
        let targetDate = new Date();

        switch (res.tapIndex) {
          case 0:
            // 今天
            break;
          case 1:
            // 明天
            targetDate.setDate(targetDate.getDate() + 1);
            break;
          case 2:
            // 后天
            targetDate.setDate(targetDate.getDate() + 2);
            break;
          case 3:
            // 选择其他日期
            this.showDatePicker();
            return;
        }

        this.saveMealPlan(recipe, targetDate);
      },
    });
  };

  addToFavorites = async () => {
    const { recipe } = this.state;
    if (!recipe) return;
    await recipeService.favoriteRecipe(recipe.id);

    Taro.showToast({
      title: "已收藏",
      icon: "success",
    });
  };

  uploadWork = () => {
    Taro.showToast({
      title: "功能开发中",
      icon: "none",
    });
  };

  showDatePicker = () => {
    const { recipe } = this.state;
    if (!recipe) return;

    Taro.showModal({
      title: "选择日期",
      content: "请在用餐计划页面选择具体日期",
      confirmText: "去计划页面",
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({
            url: "/pages/meal-plan/index",
          });
        }
      },
    });
  };

  saveMealPlan = (recipe: Recipe, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const mealPlans = Taro.getStorageSync("mealPlans") || {};

    if (!mealPlans[dateStr]) {
      mealPlans[dateStr] = [];
    }

    // 检查是否已经添加过
    const exists = mealPlans[dateStr].some(
      (plan: any) => plan.id === recipe.id
    );
    if (exists) {
      Taro.showToast({
        title: "该菜谱已在计划中",
        icon: "none",
      });
      return;
    }

    mealPlans[dateStr].push({
      id: recipe.id,
      title: recipe.title,
      cookTime: recipe.cookingTime || 0,
    });

    Taro.setStorageSync("mealPlans", mealPlans);

    console.log("保存后的用餐计划:", mealPlans);

    Taro.showToast({
      title: "已添加到用餐计划",
      icon: "success",
    });
  };

  shareRecipe = () => {
    const { recipe } = this.state;
    if (!recipe) return;

    Taro.showShareMenu({
      withShareTicket: true,
    });
  };

  // 处理食材显示
  renderIngredient = (ingredient: any, index: number) => {
    if (typeof ingredient === "string") {
      return (
        <AtTag key={index} type="primary">
          {ingredient}
        </AtTag>
      );
    }

    if (ingredient && typeof ingredient === "object") {
      const { name, amount, unit, note } = ingredient;
      if (name && amount) {
        let text = `${name} ${amount}${unit || ""}`;
        if (note) {
          text += ` (${note})`;
        }
        return (
          <AtTag key={index} type="primary">
            {text}
          </AtTag>
        );
      }
      return (
        <AtTag key={index} type="primary">
          {name || "未知食材"}
        </AtTag>
      );
    }

    return (
      <AtTag key={index} type="primary">
        未知食材
      </AtTag>
    );
  };

  // 处理主要食材
  renderMainIngredients = (ingredients: any) => {
    if (!ingredients || !Array.isArray(ingredients)) return null;

    return (
      <View className={styles.ingredientGroup}>
        <Text className={styles.ingredientGroupTitle}>主要食材</Text>
        <View className={styles.ingredientTags}>
          {ingredients.map((ingredient, index) =>
            this.renderIngredient(ingredient, index)
          )}
        </View>
      </View>
    );
  };

  // 处理辅助食材
  renderAuxiliaryIngredients = (ingredients: any) => {
    if (!ingredients || !Array.isArray(ingredients)) return null;

    return (
      <View className={styles.ingredientGroup}>
        <Text className={styles.ingredientGroupTitle}>辅助食材</Text>
        <View className={styles.ingredientTags}>
          {ingredients.map((ingredient, index) =>
            this.renderIngredient(ingredient, index)
          )}
        </View>
      </View>
    );
  };

  renderSauce = (sauce: any) => {
    if (!sauce || !Array.isArray(sauce)) return null;

    return (
      <View className={styles.ingredientGroup}>
        <Text className={styles.sectionTitle}>🥘 调料</Text>
        <View className={styles.sauceTags}>
          {sauce.map((ingredient, index) =>
            this.renderIngredient(ingredient, index)
          )}
        </View>
      </View>
    );
  };

  // 处理食材清单显示
  renderIngredients = (ingredients: any) => {
    if (!ingredients) return null;

    // 如果是新的结构化格式
    if (ingredients.main || ingredients.auxiliary || ingredients.sauce) {
      return (
        <View className={styles.ingredients}>
          {this.renderMainIngredients(ingredients.main)}
          {this.renderAuxiliaryIngredients(ingredients.auxiliary)}
        </View>
      );
    }

    // 如果是旧的数组格式
    if (Array.isArray(ingredients)) {
      return (
        <View className={styles.ingredients}>
          <View className={styles.ingredientTags}>
            {ingredients.map((ingredient, index) =>
              this.renderIngredient(ingredient, index)
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  // 处理步骤显示
  renderStep = (step: any, index: number) => {
    if (!step) return null;

    const title = step.title || `步骤 ${index + 1}`;
    const time = step.time || 0;
    const content = step.content || [];

    return (
      <View key={index} className={styles.stepItem}>
        <View className={styles.stepNumber}>{index + 1}</View>
        <View className={styles.stepContent}>
          <Text className={styles.stepTitle}>{title}</Text>
          {time > 0 && <Text className={styles.stepTime}>⏱ {time}分钟</Text>}
          {Array.isArray(content) ? (
            content.map((contentItem: string, contentIndex: number) => (
              <Text key={contentIndex} className={styles.stepText}>
                {contentItem}
              </Text>
            ))
          ) : (
            <Text className={styles.stepText}>{content}</Text>
          )}
        </View>
      </View>
    );
  };

  // 处理小贴士显示
  renderTip = (tip: any, index: number) => {
    if (typeof tip === "string") {
      return (
        <View>
          <Text key={index} className={styles.tipText}>
            {tip}
          </Text>
        </View>
      );
    }

    if (tip && typeof tip === "object" && tip.content) {
      return (
        <View>
          <Text key={index} className={styles.tipText}>
            {tip.content}
          </Text>
        </View>
      );
    }

    return null;
  };

  render() {
    const { recipe, loading, error } = this.state;

    if (loading) {
      return (
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      );
    }

    if (error || !recipe) {
      return (
        <View className={styles.error}>
          <Text>{error || "菜谱不存在"}</Text>
        </View>
      );
    }

    return (
      <View className={styles.recipeDetail}>
        <ScrollView className={styles.content} scrollY>
          <View>
            <Image
              src={recipe.coverImage || require("@/assets/cover-image.png")}
              className="w-full"
            />
          </View>
          <View className={styles.header}>
            <Text className={styles.title}>{recipe.title}</Text>
            <Text className={styles.description}>{recipe.description}</Text>

            <View className={styles.metaInfo}>
              {recipe.cookingTime && (
                <View className={styles.metaItem}>
                  <View className="inline-flex gap-1 items-center">
                    <AtIcon value="clock" size={14} />
                    <Text>烹饪时间</Text>
                  </View>
                  <Text className={styles.metaValue}>
                    {recipe.cookingTime}分钟
                  </Text>
                </View>
              )}
              {recipe.difficulty && (
                <View className={styles.metaItem}>
                  <View className="inline-flex gap-1 items-center">
                    <AtIcon value="clock" size={14} />
                    <Text>烹饪时间</Text>
                  </View>
                  <Text className={styles.metaValue}>{recipe.difficulty}</Text>
                </View>
              )}
              {recipe.servings && (
                <View className={styles.metaItem}>
                  <View className="inline-flex gap-1 items-center">
                    <AtIcon value="user" size={14} />
                    <Text>份量</Text>
                  </View>
                  <Text className={styles.metaValue}>
                    {recipe.servings}人份
                  </Text>
                </View>
              )}
            </View>

            {recipe.tags && recipe.tags.length > 0 && (
              <View className={styles.tags}>
                {recipe.tags.map((tag, index) => (
                  <Text key={index} className={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🥘 食材清单</Text>
            {this.renderIngredients(recipe.ingredients)}
          </View>

          {this.renderSauce(recipe.sauce)}

          <View className={`${styles.section} border-t`}>
            <Text className={styles.sectionTitle}>👩‍🍳 制作步骤</Text>
            <View className={styles.steps}>
              {Array.isArray(recipe.steps) &&
                recipe.steps.map((step, index) => this.renderStep(step, index))}
            </View>
          </View>

          {recipe.tips && recipe.tips.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>💡 小贴士</Text>
              <View className={styles.tips}>
                {recipe.tips.map((tip, index) => this.renderTip(tip, index))}
              </View>
            </View>
          )}
        </ScrollView>

        <View className="grid grid-cols-3 bg-white border-t fixed bottom-6 left-0 right-0 z-50">
          <View
            className="flex items-center justify-center gap-2 bg-transparent min-w-30 transition-all duration-200 text-gray-500 text-sm font-medium active:opacity-70 active:scale-95 py-4"
            onClick={this.addToFavorites}
          >
            <AtIcon value="star" size={24} color="#666" />
            <Text className="text-sm text-gray-500 font-medium text-center">
              收藏
            </Text>
          </View>
          <View
            className="flex items-center justify-center gap-2 bg-transparent min-w-30 transition-all duration-200 text-gray-500 text-sm font-medium active:opacity-70 active:scale-95 py-4"
            onClick={this.uploadWork}
          >
            <AtIcon value="camera" size={24} color="#666" />
            <Text className="text-sm text-gray-500 font-medium text-center">
              传作品
            </Text>
          </View>
          <View
            className="flex items-center justify-center gap-2 bg-transparent min-w-30 transition-all duration-200 text-gray-500 text-sm font-medium active:opacity-70 active:scale-95 py-4"
            onClick={this.shareRecipe}
          >
            <AtIcon value="share" size={24} color="#666" />
            <Text className="text-sm text-gray-500 font-medium text-center">
              分享
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

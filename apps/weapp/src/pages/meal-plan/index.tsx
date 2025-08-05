import { Component } from "react";
import { View, Text, ScrollView, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";

import mealPlanService, {
  Plan,
  MealPlanItem,
  PlanSummary,
} from "../../services/meal-plan-service";
import styles from "./index.module.scss";

interface State {
  currentDate: string;
  selectedDate: string;
  plans: Plan[];
  weekDates: string[];
  planSummaries: PlanSummary[];
  loading: boolean;
}

export default class MealPlan extends Component<{}, State> {
  constructor(props: any) {
    super(props);

    const today = new Date();
    const currentDate = this.formatDateString(today);

    this.state = {
      currentDate,
      selectedDate: currentDate,
      plans: [],
      weekDates: [],
      planSummaries: [],
      loading: false,
    };
  }

  async componentDidMount() {
    this.generateWeekDates();
    await this.loadPlanSummaries();
    await this.loadPlansForDate(this.state.selectedDate);

    // 监听计划创建事件
    Taro.eventCenter.on("planCreated", this.handlePlanCreated);
  }

  componentWillUnmount() {
    Taro.eventCenter.off("planCreated", this.handlePlanCreated);
  }

  // 统一的日期格式化函数
  formatDateString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  loadPlanSummaries = async () => {
    try {
      this.setState({ loading: true });

      // 获取本周的开始和结束日期
      const today = new Date();
      const startDate = this.formatDateString(today);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 6);
      const endDateStr = this.formatDateString(endDate);

      const result = await mealPlanService.getPlanSummaries(
        startDate,
        endDateStr
      );
      this.setState({ planSummaries: result.summaries });
    } catch (error) {
      console.error("加载计划汇总失败:", error);
      Taro.showToast({
        title: "加载计划汇总失败",
        icon: "error",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  loadPlansForDate = async (date: string) => {
    try {
      const plans = await mealPlanService.getPlansByDate(date);
      this.setState({ plans });
    } catch (error) {
      Taro.showToast({
        title: "加载计划失败",
        icon: "error",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  loadPlans = async () => {
    try {
      const result = await mealPlanService.getPlans();
      this.setState({ plans: result.plans });
    } catch (error) {
      Taro.showToast({
        title: "加载计划失败",
        icon: "error",
      });
    }
  };

  handlePlanCreated = async (newPlan: Plan) => {
    await this.loadPlanSummaries();
    await this.loadPlansForDate(this.state.selectedDate);
  };

  generateWeekDates = () => {
    const dates = [];
    const today = new Date();

    // 生成今天开始的7天
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(this.formatDateString(date));
    }

    this.setState({ weekDates: dates });
  };

  formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const targetDate = dateStr;
    const todayStr = this.formatDateString(today);
    const tomorrowStr = this.formatDateString(tomorrow);

    if (targetDate === todayStr) {
      return "今天";
    } else if (targetDate === tomorrowStr) {
      return "明天";
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
      return `${month}/${day} 周${weekDay}`;
    }
  };

  selectDate = async (date: string) => {
    this.setState({ selectedDate: date, loading: true }, async () => {
      await this.loadPlansForDate(date);
    });
  };

  // 获取指定日期的所有计划（现在直接使用state中的plans）
  getPlansForDate = (date: string) => {
    return this.state.plans;
  };

  // 获取指定计划的菜谱
  getMealsForPlan = (planId: string): MealPlanItem[] => {
    const plan = this.state.plans.find((p) => p.id === planId);
    return plan?.mealPlanItems || [];
  };

  toggleMealCompletion = async (planId: string, mealId: string) => {
    try {
      const meal = this.getMealsForPlan(planId).find((m) => m.id === mealId);
      if (!meal) return;

      await mealPlanService.updateMealPlanItem(mealId, {
        completed: !meal.completed,
      });

      Taro.showToast({
        title: !meal.completed ? "已完成" : "取消完成",
        icon: "success",
        duration: 1000,
      });

      // 重新加载计划数据
      await this.loadPlans();
    } catch (error) {
      console.error("更新完成状态失败:", error);
      Taro.showToast({
        title: "更新失败",
        icon: "error",
      });
    }
  };

  removeMealFromPlan = async (planId: string, mealId: string) => {
    Taro.showModal({
      title: "确认删除",
      content: "确定要从计划中移除这道菜吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            await mealPlanService.removeMealFromPlan(mealId);

            Taro.showToast({
              title: "已移除",
              icon: "success",
            });

            // 重新加载计划数据
            await this.loadPlans();
          } catch (error) {
            console.error("移除菜谱失败:", error);
            Taro.showToast({
              title: "移除失败",
              icon: "error",
            });
          }
        }
      },
    });
  };

  createNewPlan = () => {
    Taro.navigateTo({
      url: "/pages/plan-create/index",
    });
  };

  viewRecipeDetail = (mealId: string) => {
    Taro.navigateTo({
      url: `/pages/recipes/detail/index?id=${mealId}`,
    });
  };

  addMealToPlan = (planId: string) => {
    // 由于菜谱列表是tabbar页面，无法直接传递参数
    // 使用全局存储来传递计划ID
    Taro.setStorageSync("currentPlanId", planId);
    Taro.switchTab({
      url: "/pages/recipes/index",
    });
  };

  getTotalCookTime = (meals: MealPlanItem[]) => {
    let totalMinutes = 0;
    meals.forEach((meal: MealPlanItem) => {
      const timeStr = meal.cookTime;
      const minutes = parseInt(timeStr.replace(/[^0-9]/g, "")) || 0;
      if (timeStr.includes("小时")) {
        totalMinutes += minutes * 60;
      } else {
        totalMinutes += minutes;
      }
    });

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }
    return `${totalMinutes}分钟`;
  };

  render() {
    const { selectedDate, weekDates, currentDate, plans, loading } = this.state;
    const datePlans = this.getPlansForDate(selectedDate);

    return (
      <View className={styles.mealPlan}>
        <View className={styles.header}>
          <Text className={styles.title}>用餐计划</Text>
          <Text className={styles.subtitle}>安排每天要做的菜</Text>
        </View>

        <View className={styles.dateSelector}>
          <ScrollView className={styles.dateScroll} scrollX>
            {weekDates.map((date: string) => {
              // 从汇总数据中获取该日期的统计信息
              const summary = this.state.planSummaries.find(
                (s) => s.date === date
              );
              const count = summary?.planCount || 0;

              return (
                <View
                  key={date}
                  className={`${styles.dateItem} ${selectedDate === date ? styles.active : ""} ${date === currentDate ? styles.today : ""}`}
                  onClick={() => this.selectDate(date)}
                >
                  <Text className={styles.dateText}>{this.formatDate(date)}</Text>
                  {count > 0 && (
                    <View className={styles.mealCount}>
                      {count > 99 ? "99+" : count}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View className={styles.planContent}>
          <View className={styles.planHeader}>
            <Text className={styles.planTitle}>
              {this.formatDate(selectedDate)}的计划
            </Text>
          </View>

          {loading ? (
            <View className={styles.loadingState}>
              <Text className={styles.loadingText}>加载中...</Text>
            </View>
          ) : datePlans.length === 0 ? (
            <View className={styles.emptyPlan}>
              <View className={styles.emptyIcon}>📅</View>
              <Text className={styles.emptyTitle}>今天还没有创建计划</Text>
              <Text className={styles.emptyDesc}>创建一个计划来安排今天的菜谱吧</Text>
              <Button className={styles.addBtn} onClick={this.createNewPlan}>
                创建计划
              </Button>
            </View>
          ) : (
            <ScrollView className={styles.plansList} scrollY>
              {datePlans.map((plan: Plan) => {
                const planMeals = this.getMealsForPlan(plan.id);
                const completedCount = planMeals.filter(
                  (meal: MealPlanItem) => meal.completed
                ).length;

                return (
                  <View key={plan.id} className={styles.planSection}>
                    <View className={styles.planInfo}>
                      <Text className={styles.planName}>{plan.name}</Text>
                      {plan.description && (
                        <Text className={styles.planDescription}>
                          {plan.description}
                        </Text>
                      )}
                      {planMeals.length > 0 && (
                        <Text className={styles.planStats}>
                          {completedCount}/{planMeals.length} 已完成 | 预计{" "}
                          {this.getTotalCookTime(planMeals)}
                        </Text>
                      )}
                    </View>

                    {planMeals.length === 0 ? (
                      <View className={styles.emptyMeals}>
                        <Text className={styles.emptyMealsText}>暂无菜谱</Text>
                      </View>
                    ) : (
                      <View className={styles.mealList}>
                        {planMeals.map((meal: MealPlanItem, index: number) => (
                          <View
                            key={meal.id}
                            className={`${styles.mealItem} ${meal.completed ? styles.completed : ""}`}
                          >
                            <View
                              className={styles.mealInfo}
                              onClick={() => this.viewRecipeDetail(meal.id)}
                            >
                              <View className={styles.mealNumber}>{index + 1}</View>
                              <View className={styles.mealDetails}>
                                <Text className={styles.mealTitle}>{meal.title}</Text>
                                <Text className={styles.mealTime}>
                                  ⏱ {meal.cookTime}
                                </Text>
                              </View>
                            </View>

                            <View className={styles.mealActions}>
                              <View
                                className={`${styles.actionBtn} ${styles.completeBtn} ${meal.completed ? styles.completed : ""}`}
                                onClick={() =>
                                  this.toggleMealCompletion(plan.id, meal.id)
                                }
                              >
                                <Text className={styles.actionText}>
                                  {meal.completed ? "✓" : "○"}
                                </Text>
                              </View>
                              <View
                                className={`${styles.actionBtn} ${styles.removeBtn}`}
                                onClick={() =>
                                  this.removeMealFromPlan(plan.id, meal.id)
                                }
                              >
                                <Text className={styles.actionText}>×</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 始终显示添加菜谱按钮 */}
                    <View className={styles.addMealSection}>
                      <Button
                        className={styles.addMealBtn}
                        onClick={() => this.addMealToPlan(plan.id)}
                      >
                        + 添加菜谱
                      </Button>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* 当有计划时显示创建计划按钮 */}
          {datePlans.length > 0 && (
            <View className={styles.addMore}>
              <Button className={styles.addMoreBtn} onClick={this.createNewPlan}>
                + 创建计划
              </Button>
            </View>
          )}
        </View>
      </View>
    );
  }
}

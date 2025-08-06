import { Component } from "react";
import { View, Text, ScrollView, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

interface State {
  planId: string;
  loading: boolean;
}

export default class MealPlanDetail extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    
    this.state = {
      planId: "",
      loading: false,
    };
  }

  componentDidMount() {
    // 获取路由参数中的计划ID
    const params = Taro.getCurrentInstance().router?.params;
    if (params?.id) {
      this.setState({ planId: params.id });
    }
  }

  goBack = () => {
    Taro.navigateBack();
  };

  goToShare = () => {
    const { planId } = this.state;
    Taro.navigateTo({
      url: `/pages/meal-plan/share/index?id=${planId}`,
    });
  };

  // 微信小程序原生分享功能
  onShareAppMessage() {
    const { planId } = this.state;
    return {
      title: '我的营养计划',
      path: `/pages/meal-plan/share/index?id=${planId}`,
      imageUrl: '/assets/kitchen/share-cover.png', // 分享封面图
    };
  }

  // 分享到朋友圈
  onShareTimeline() {
    const { planId } = this.state;
    return {
      title: '我的营养计划',
      query: `id=${planId}`,
      imageUrl: '/assets/kitchen/share-cover.png',
    };
  }

  render() {
    const { planId, loading } = this.state;

    return (
      <View className={styles.mealPlanDetail}>
        <View className={styles.header}>
          <View className={styles.backBtn} onClick={this.goBack}>
            <Text className={styles.backIcon}>←</Text>
          </View>
          <Text className={styles.title}>计划详情</Text>
          <View className={styles.shareBtn} onClick={this.goToShare}>
            <Text className={styles.shareIcon}>📤</Text>
          </View>
        </View>

        <ScrollView className={styles.content} scrollY>
          {loading ? (
            <View className={styles.loadingState}>
              <Text className={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            <View className={styles.placeholderContent}>
              <View className={styles.placeholderIcon}>📋</View>
              <Text className={styles.placeholderTitle}>计划详情页面</Text>
              <Text className={styles.placeholderDesc}>
                计划ID: {planId || "未获取到"}
              </Text>
              <Text className={styles.placeholderSubDesc}>
                这里将显示计划的详细信息，包括菜谱列表、完成状态等
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

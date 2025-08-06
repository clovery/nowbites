import { Component } from "react";
import { View, Text, ScrollView, Button, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

interface State {
  planId: string;
  planData: any;
  loading: boolean;
  shareUrl: string;
  qrCodeUrl: string;
}

export default class MealPlanShare extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    
    this.state = {
      planId: "",
      planData: null,
      loading: false,
      shareUrl: "",
      qrCodeUrl: "",
    };
  }

  render() {
    const { planId, planData, loading, shareUrl, qrCodeUrl } = this.state;

    return (
      <View className={styles.sharePage}>
        <View className={styles.header}>
          <Text className={styles.title}>分享计划</Text>
        </View>
      </View>
    );
  }
}

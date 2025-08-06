import { Component } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  AtCard,
  AtInput,
  AtButton,
  AtList,
  AtListItem,
  AtDivider,
  AtIcon,
} from "taro-ui";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

interface State {
  flourWeight: string;
  ingredients: Record<string, number>;
  isCalculated: boolean;
}

interface Ingredient {
  name: string;
  amount: number;
}

export default class RecipeCalculator extends Component<{}, State> {
  // 原始配方
  private readonly baseRecipe: Record<string, number> = {
    中筋面粉: 1000,
    白糖: 4,
    酵母: 8,
    泡打粉: 4,
    猪油: 20,
    温水: 520,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      flourWeight: "1000",
      ingredients: {},
      isCalculated: false,
    };
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "配方计算器",
    });
    // 页面加载时自动计算
    this.calculateRecipe();
  }

  // 处理面粉重量输入
  handleFlourWeightChange = (value: string | number) => {
    const stringValue = String(value);
    this.setState({ flourWeight: stringValue }, () => {
      if (stringValue && !isNaN(Number(stringValue))) {
        this.calculateRecipe();
      }
    });
  };

  // 配方计算逻辑
  calculateRecipe = () => {
    const { flourWeight } = this.state;
    const flourWeightValue = parseFloat(flourWeight);

    if (!flourWeightValue || flourWeightValue <= 0) {
      this.setState({ ingredients: {}, isCalculated: false });
      return;
    }

    const multiplier = flourWeightValue / this.baseRecipe["中筋面粉"];
    const calculatedIngredients: Record<string, number> = {};

    Object.entries(this.baseRecipe).forEach(([name, amount]) => {
      calculatedIngredients[name] = Number((amount * multiplier).toFixed(2));
    });

    this.setState({
      ingredients: calculatedIngredients,
      isCalculated: true,
    });
  };

  // 手动计算按钮
  handleCalculate = () => {
    this.calculateRecipe();
    Taro.showToast({
      title: "计算完成",
      icon: "success",
      duration: 1500,
    });
  };

  // 重置配方
  handleReset = () => {
    this.setState(
      {
        flourWeight: "1000",
        ingredients: {},
        isCalculated: false,
      },
      () => {
        this.calculateRecipe();
      }
    );
  };

  render() {
    const { flourWeight, ingredients, isCalculated } = this.state;
    const ingredientEntries = Object.entries(ingredients).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return (
      <View className={styles.calculatorContainer}>
        <ScrollView className={styles.calculatorContent}>
          <AtCard title="输入面粉重量" className={styles.inputCard}>
            <AtInput
              name="flourWeight"
              title="面粉重量"
              type="digit"
              placeholder="输入面粉重量"
              value={flourWeight}
              onChange={this.handleFlourWeightChange}
              border={false}
            >
              <Text className={styles.unit}>克</Text>
            </AtInput>
          </AtCard>

          <View className={`${styles.buttonGroup}`}>
            <View className={styles.buttonCol}>
              <AtButton
                type="primary"
                onClick={this.handleCalculate}
                disabled={!flourWeight || isNaN(Number(flourWeight))}
                className={styles.calculateBtn}
              >
                计算配方
              </AtButton>
            </View>
            <View className={styles.buttonCol}>
              <AtButton
                type="secondary"
                onClick={this.handleReset}
                className={styles.resetBtn}
              >
                重置
              </AtButton>
            </View>
          </View>

          {isCalculated && ingredientEntries.length > 0 && (
            <AtCard title="调整后的配方" className={styles.resultCard}>
              <AtList>
                {ingredientEntries.map(([name, amount], index) => (
                  <AtListItem
                    key={index}
                    title={name}
                    extraText={`${amount.toFixed(2)} 克`}
                    className={styles.ingredientItem}
                  />
                ))}
              </AtList>
            </AtCard>
          )}

          <AtCard title="使用提示" className={styles.tipsCard}>
            <View className={styles.tipsContent}>
              <View className={styles.tipItem}>
                <AtIcon value="check-circle" size="16" color="#007bff" />
                <Text className={styles.tipText}>
                  输入面粉重量后会自动计算其他配料的比例
                </Text>
              </View>
              <View className={styles.tipItem}>
                <AtIcon value="check-circle" size="16" color="#007bff" />
                <Text className={styles.tipText}>
                  所有配料都按照原始配方比例自动调整
                </Text>
              </View>
              <View className={styles.tipItem}>
                <AtIcon value="check-circle" size="16" color="#007bff" />
                <Text className={styles.tipText}>水温建议控制在35°C左右</Text>
              </View>
              <View className={styles.tipItem}>
                <AtIcon value="check-circle" size="16" color="#007bff" />
                <Text className={styles.tipText}>
                  可根据实际需要微调配料用量
                </Text>
              </View>
            </View>
          </AtCard>
        </ScrollView>
      </View>
    );
  }
}

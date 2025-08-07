import { Component } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtInput, AtButton, AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";

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
      <View className="min-h-screen bg-gray-50">
        <ScrollView className="h-full">
          <View className="p-4 space-y-4">
            {/* 输入卡片 */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <View className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
                <Text className="text-white text-lg font-semibold">输入面粉重量</Text>
              </View>
              <View className="p-4">
                <View className="flex items-center space-x-2">
                  <View className="flex-1">
                    <AtInput
                      name="flourWeight"
                      title=""
                      type="digit"
                      placeholder="输入面粉重量"
                      value={flourWeight}
                      onChange={this.handleFlourWeightChange}
                      border={false}
                      className="bg-gray-50 rounded-lg px-3 py-2"
                    />
                  </View>
                  <View className="bg-blue-100 px-3 py-2 rounded-lg">
                    <Text className="text-blue-700 font-medium">克</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 按钮组 */}
            <View className="flex space-x-3">
              <View className="flex-1">
                <AtButton
                  type="primary"
                  onClick={this.handleCalculate}
                  disabled={!flourWeight || isNaN(Number(flourWeight))}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  计算配方
                </AtButton>
              </View>
              <View className="flex-1">
                <AtButton
                  type="secondary"
                  onClick={this.handleReset}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-300"
                >
                  重置
                </AtButton>
              </View>
            </View>

            {/* 计算结果 */}
            {isCalculated && ingredientEntries.length > 0 && (
              <View className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <View className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600">
                  <Text className="text-white text-lg font-semibold">调整后的配方</Text>
                </View>
                <View className="p-4">
                  <View className="space-y-2">
                    {ingredientEntries.map(([name, amount], index) => (
                      <View
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                      >
                        <Text className="text-gray-800 font-medium">{name}</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                          <Text className="text-green-700 font-semibold">
                            {amount.toFixed(2)} 克
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 使用提示 */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-4">
              <View className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600">
                <Text className="text-white text-lg font-semibold">使用提示</Text>
              </View>
              <View className="p-4">
                <View className="space-y-3">
                  <View className="flex items-start space-x-3">
                    <View className="bg-blue-100 rounded-full mt-0.5 w-6 h-6 flex items-center justify-center">
                      <AtIcon value="check-circle" size="14" color="#3B82F6" />
                    </View>
                    <Text className="text-gray-700 text-sm leading-relaxed flex-1">
                      输入面粉重量后会自动计算其他配料的比例
                    </Text>
                  </View>
                  <View className="flex items-start space-x-3">
                    <View className="bg-blue-100 rounded-full mt-0.5 w-6 h-6 flex items-center justify-center">
                      <AtIcon value="check-circle" size="14" color="#3B82F6" />
                    </View>
                    <Text className="text-gray-700 text-sm leading-relaxed flex-1">
                      所有配料都按照原始配方比例自动调整
                    </Text>
                  </View>
                  <View className="flex items-start space-x-3">
                    <View className="bg-blue-100 rounded-full mt-0.5 w-6 h-6 flex items-center justify-center">
                      <AtIcon value="check-circle" size="14" color="#3B82F6" />
                    </View>
                    <Text className="text-gray-700 text-sm leading-relaxed flex-1">
                      水温建议控制在35°C左右
                    </Text>
                  </View>
                  <View className="flex items-start space-x-3">
                    <View className="bg-blue-100 rounded-full mt-0.5 w-6 h-6 flex items-center justify-center">
                      <AtIcon value="check-circle" size="14" color="#3B82F6" />
                    </View>
                    <Text className="text-gray-700 text-sm leading-relaxed flex-1">
                      可根据实际需要微调配料用量
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

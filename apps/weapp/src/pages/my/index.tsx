import { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
  Input,
  Image,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import LoginService, { UserInfo } from "../../services/login";
import "./index.scss";

interface State {
  userInfo: UserInfo | null;
  isLogin: boolean;
  isLoading: boolean;
}

export default class MyPage extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userInfo: null,
      isLogin: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.checkLoginStatus();
  }

  checkLoginStatus = async () => {
    const { isLogin, userInfo } = await LoginService.checkLoginStatus();
    this.setState({
      userInfo,
      isLogin,
    });
  };

  handleGetUserInfo = async () => {
    await LoginService.wechatLogin({
      onStart: () => {
        this.setState({ isLoading: true });
      },
      onSuccess: (userInfo) => {
        this.setState({
          userInfo,
          isLogin: true,
        });
      },
      onFinally: () => {
        this.setState({ isLoading: false });
      },
      showSuccessToast: true,
      autoNavigateBack: false,
    });
  };

  handleLogout = () => {
    LoginService.logout({
      showConfirm: true,
      onSuccess: () => {
        this.setState({
          userInfo: null,
          isLogin: false,
        });
      },
    });
  };

  navigateToRecipeUpload = async () => {
    const hasLogin = await LoginService.requireLogin(
      "请先登录后再上传菜谱",
      false,
    );
    if (hasLogin) {
      Taro.navigateTo({
        url: "/pages/recipe-upload/index",
      });
    }
  };

  render() {
    const { userInfo, isLogin, isLoading } = this.state;

    return (
      <View className="my-page">
        {/* Profile Header Section */}
        <View className="profile-header">
          {isLogin ? (
            <View className="user-profile">
              <Image
                className="profile-avatar"
                src={userInfo?.avatarUrl || "/assets/default-avatar.png"}
              />
              <View className="profile-info">
                <Text className="profile-name">
                  {userInfo?.nickName || "用户"}
                </Text>
                <Text className="profile-id">
                  微信号: {userInfo?.openid?.substring(0, 8) || "unknown"}
                </Text>
                <View className="status-buttons">
                  <View className="status-btn">+ 状态</View>
                  <View className="status-btn-circle"></View>
                </View>
              </View>
              <View className="qr-code-icon">📱</View>
              <View className="nav-arrow">›</View>
            </View>
          ) : (
            <View className="login-profile">
              <View className="default-avatar">👤</View>
              <View className="profile-info">
                <Text className="profile-name">未登录</Text>
                <Text className="profile-id">点击登录获取更多功能</Text>
              </View>
              <Button
                className="login-btn"
                onClick={this.handleGetUserInfo}
                disabled={isLoading}
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </View>
          )}
        </View>

        {/* Functional List */}
        <View className="function-list">
          <View className="function-item" onClick={this.navigateToRecipeUpload}>
            <View className="function-icon service-icon">💬</View>
            <Text className="function-text">上传菜谱</Text>
            <View className="arrow">›</View>
          </View>

          <View
            className="function-item"
            onClick={() =>
              Taro.navigateTo({ url: "/pages/my/favorites/index" })
            }
          >
            <View className="function-icon favorites-icon">📦</View>
            <Text className="function-text">我的收藏</Text>
            <View className="arrow">›</View>
          </View>

          <View
            className="function-item"
            onClick={() => Taro.navigateTo({ url: "/pages/my/recipes/index" })}
          >
            <View className="function-icon moments-icon">🏔️</View>
            <Text className="function-text">我的菜谱</Text>
            <View className="arrow">›</View>
          </View>

          <View className="function-item">
            <View className="function-icon cards-icon">💳</View>
            <Text className="function-text">我的计划</Text>
            <View className="arrow">›</View>
          </View>

          <View
            className="function-item"
            onClick={() => Taro.navigateTo({ url: "/pages/tools/index" })}
          >
            <View className="function-icon tools-icon">🔧</View>
            <Text className="function-text">包子皮配方计算器</Text>
            <View className="arrow">›</View>
          </View>

          <View
            className="function-item"
            onClick={() =>
              Taro.navigateTo({ url: "/pages/tailwind-demo/index" })
            }
          >
            <View className="function-icon tools-icon">🎨</View>
            <Text className="function-text">Tailwind Demo</Text>
            <View className="arrow">›</View>
          </View>
        </View>

        {/* Logout Section */}
        {isLogin && (
          <View className="logout-section">
            <Button className="logout-button" onClick={this.handleLogout}>
              退出登录
            </Button>
          </View>
        )}
        <View className="git-info-section">
          <Text className="git-info-text">Git SHA: {GIT_SHA || "unknown"}</Text>
        </View>
      </View>
    );
  }
}

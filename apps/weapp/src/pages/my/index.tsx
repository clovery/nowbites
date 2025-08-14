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
  isHiddenSectionVisible: boolean;
}

export default class MyPage extends Component<{}, State> {
  private touchStartY: number = 0;
  private touchStartTime: number = 0;

  constructor(props: {}) {
    super(props);
    this.state = {
      userInfo: null,
      isLogin: false,
      isLoading: false,
      isHiddenSectionVisible: false,
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

  handleTouchStart = (e: any) => {
    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  };

  handleTouchMove = (e: any) => {
    // Prevent default to avoid page scrolling during gesture
    e.preventDefault();
  };

  handleTouchEnd = (e: any) => {
    const touch = e.changedTouches[0];
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();

    const deltaY = this.touchStartY - touchEndY;
    const deltaTime = touchEndTime - this.touchStartTime;

    // Check for upward swipe: deltaY > 50 (minimum distance) and deltaTime < 500ms (maximum duration)
    if (deltaY > 50 && deltaTime < 500) {
      // Only show hidden section if it's not already visible
      if (!this.state.isHiddenSectionVisible) {
        this.setState({ isHiddenSectionVisible: true });
      }
    }

    // Check for downward swipe to hide the section
    if (deltaY < -50 && deltaTime < 500 && this.state.isHiddenSectionVisible) {
      this.setState({ isHiddenSectionVisible: false });
    }
  };

  render() {
    const { userInfo, isLogin, isLoading, isHiddenSectionVisible } = this.state;

    return (
      <View
        className="my-page"
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
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

        {/* Hidden Section - Revealed by Swipe Up */}
        <View
          className={`hidden-section ${isHiddenSectionVisible ? "visible" : "hidden"}`}
        >
          <View className="hidden-section-content">
            <View className="section-header">
              <Text className="section-title">高级设置</Text>
              <Text className="section-subtitle">向上滑动显示更多选项</Text>
            </View>
            <View className="advanced-options">
              <View className="option-item">
                <View className="option-icon">🔔</View>
                <Text className="option-text">消息通知设置</Text>
                <View className="arrow">›</View>
              </View>
              <View className="option-item">
                <View className="option-icon">🔒</View>
                <Text className="option-text">隐私设置</Text>
                <View className="arrow">›</View>
              </View>
              <View className="option-item">
                <View className="option-icon">🌙</View>
                <Text className="option-text">夜间模式</Text>
                <View className="arrow">›</View>
              </View>
              <View className="option-item">
                <View className="option-icon">📊</View>
                <Text className="option-text">使用统计</Text>
                <View className="arrow">›</View>
              </View>
            </View>
          </View>
        </View>

        <View className="git-info-section">
          <Text className="git-info-text">Git SHA: {GIT_SHA || "unknown"}</Text>
        </View>
      </View>
    );
  }
}

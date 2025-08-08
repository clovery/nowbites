import { Component, ComponentClass } from "react";
import Taro from "@tarojs/taro";
import { LoginService } from "../../services/login";

interface WithAuthState {
  isAuthenticated: boolean;
  isChecking: boolean;
  hasShownModal: boolean;
}

/**
 * withAuth 高阶组件
 * 用于包装需要登录才能访问的页面组件
 * @param WrappedComponent 需要包装的组件
 * @param options 配置选项
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentClass<P>,
  options: {
    redirectUrl?: string; // 未登录时的跳转地址，默认为登录页
    showModal?: boolean;  // 是否显示提示弹窗，默认为 true
    modalTitle?: string;  // 弹窗标题
    modalContent?: string; // 弹窗内容
  } = {}
) {
  const {
    redirectUrl = '/pages/login/index',
    showModal = true,
    modalTitle = '提示',
    modalContent = '请先登录后使用此功能'
  } = options;

  return class WithAuthComponent extends Component<P, WithAuthState> {
    constructor(props: P) {
      super(props);
      this.state = {
        isAuthenticated: false,
        isChecking: true,
        hasShownModal: false
      };
    }

    async componentDidMount() {
      await this.checkAuthentication();
    }

    // 使用 componentDidShow 替代 onShow（Taro 3.x 的正确生命周期）
    async componentDidShow() {
      console.log('withAuth: componentDidShow called');
      // 每次页面显示时都重置modal状态并检查登录状态
      this.setState({ 
        hasShownModal: false,
        isChecking: true
      });
      await this.checkAuthentication();
    }

    checkAuthentication = async () => {
      try {
        console.log('withAuth: checkAuthentication called');
        this.setState({ isChecking: true });
        
        const { isLogin } = await LoginService.checkLoginStatus();
        console.log('withAuth: login status:', isLogin);
        
        if (!isLogin) {
          this.handleNotAuthenticated();
        } else {
          this.setState({ 
            isAuthenticated: true,
            isChecking: false 
          });
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        this.handleNotAuthenticated();
      }
    };

    handleNotAuthenticated = () => {
      console.log('withAuth: handleNotAuthenticated called, hasShownModal:', this.state.hasShownModal);
      this.setState({ 
        isAuthenticated: false,
        isChecking: false 
      });

      // 确保每次都能弹出对话框，但同一个会话中不重复弹出
      if (showModal && !this.state.hasShownModal) {
        console.log('withAuth: showing modal');
        this.setState({ hasShownModal: true });
        Taro.showModal({
          title: modalTitle,
          content: modalContent,
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.navigateToLogin();
            } else {
              this.navigateToHome();
            }
          }
        });
      } else if (!showModal) {
        // 直接跳转到登录页
        console.log('withAuth: no modal, redirecting to login');
        this.navigateToLogin();
      } else {
        console.log('withAuth: modal already shown in this session');
      }
    };

    navigateToLogin = () => {
      if (redirectUrl.startsWith('/pages/login/')) {
        Taro.navigateTo({
          url: redirectUrl
        });
      } else {
        Taro.redirectTo({
          url: redirectUrl
        });
      }
    };

    navigateToHome = () => {
      // 用户取消登录，跳转到菜谱页面（首页）
      Taro.switchTab({
        url: '/pages/recipes/index'
      });
    };

    render() {
      const { isAuthenticated, isChecking } = this.state;

      // 正在检查登录状态时显示加载状态
      if (isChecking) {
        return null; // 或者返回一个加载组件
      }

      // 未登录时不渲染原组件
      if (!isAuthenticated) {
        return null;
      }

      // 已登录，渲染原组件
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withAuth;

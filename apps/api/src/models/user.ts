// 用户信息接口
export interface UserInfo {
  openid: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  country?: string;
  province?: string;
  city?: string;
  language?: string;
}

// 微信登录请求接口
export interface WechatLoginRequest {
  code: string;
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
    country?: string;
    province?: string;
    city?: string;
    language?: string;
  };
}

// 微信登录响应接口
export interface WechatLoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 微信登录API响应接口
export interface WechatLoginApiResponse {
  session_key: string;
  openid: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}
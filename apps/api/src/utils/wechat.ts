import axios from 'axios';
import { WechatLoginApiResponse } from '../models/user.js';

/**
 * 微信API工具类
 */
export class WechatAPI {
  private appid: string;
  private secret: string;
  private baseUrl: string = 'https://api.weixin.qq.com';

  constructor(appid: string, secret: string) {
    this.appid = appid;
    this.secret = secret;
  }

  /**
   * 使用code获取openid和session_key
   * @param code 微信登录code
   * @returns 微信登录API响应
   */
  async code2Session(code: string): Promise<WechatLoginApiResponse> {
    try {
      const url = `${this.baseUrl}/sns/jscode2session`;
      const response = await axios.get<WechatLoginApiResponse>(url, {
        params: {
          appid: this.appid,
          secret: this.secret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      return response.data;
    } catch (error) {
      console.error('微信API请求失败:', error);
      throw new Error('Failed to connect to WeChat API');
    }
  }
}

/**
 * 创建微信API实例
 * @returns WechatAPI实例
 */
export function createWechatAPI(): WechatAPI {
  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_SECRET;

  if (!appid || !secret) {
    throw new Error('Missing WeChat configuration');
  }

  return new WechatAPI(appid, secret);
}
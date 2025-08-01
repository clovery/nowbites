import Taro from '@tarojs/taro';
import config from '../config';

interface RequestOptions extends Taro.request.Option {
  needToken?: boolean;
}

/**
 * 封装Taro请求方法
 * @param options 请求选项
 */
const request = (options: RequestOptions) => {
  const { url, needToken = false, header = {}, ...rest } = options;
  
  // 构建完整URL
  const fullUrl = /^https?:\/\//.test(url) ? url : `${config.apiBaseUrl}${url}`;
  
  // 如果需要token，从本地存储获取并添加到请求头
  let requestHeader = { ...header };
  if (needToken) {
    const token = Taro.getStorageSync('token');
    if (token) {
      requestHeader['Authorization'] = `Bearer ${token}`;
    } else {
      // 如果需要token但没有token，可能需要重新登录
      console.warn('需要登录权限但未找到token');
    }
  }
  
  return new Promise<any>((resolve, reject) => {
    Taro.request({
      ...rest,
      url: fullUrl,
      header: requestHeader,
      success: (res) => {
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除token并提示用户登录
          Taro.removeStorageSync('token');
          Taro.showToast({
            title: '请先登录',
            icon: 'none'
          });
          reject(new Error('未授权，请先登录'));
        } else {
          // 其他错误
          Taro.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none'
          });
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 网络错误等
        Taro.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 常用请求方法封装
export const get = (url: string, data?: any, needToken = false) => {
  return request({
    url,
    method: 'GET',
    data,
    needToken
  });
};

export const post = (url: string, data?: any, needToken = false) => {
  return request({
    url,
    method: 'POST',
    data,
    needToken
  });
};

export const put = (url: string, data?: any, needToken = false) => {
  return request({
    url,
    method: 'PUT',
    data,
    needToken
  });
};

export const del = (url: string, data?: any, needToken = false) => {
  return request({
    url,
    method: 'DELETE',
    data,
    needToken
  });
};

export default {
  request,
  get,
  post,
  put,
  del
};
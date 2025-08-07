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
  const { url, needToken = false, header = {}, method = 'GET', data, ...rest } = options;
  
  // 构建完整URL
  const fullUrl = /^https?:\/\//.test(url) ? url : `${config.apiBaseUrl}${url}`;
  
  // 构建请求头
  let requestHeader: Record<string, string> = { 
    'Content-Type': 'application/json',
    ...header 
  };
  
  // 如果需要token，从本地存储获取并添加到请求头
  if (needToken) {
    const token = Taro.getStorageSync('token');
    if (token) {
      requestHeader['Authorization'] = `Bearer ${token}`;
    } else {
      // 如果需要token但没有token，可能需要重新登录
      console.warn('需要登录权限但未找到token');
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return Promise.reject(new Error('未授权，请先登录'));
    }
  }
  
  return new Promise<any>((resolve, reject) => {
    Taro.request({
      ...rest,
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      success: (res) => {
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          Taro.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          reject(new Error('登录已过期，请重新登录'));
        } else if (res.statusCode === 403) {
          Taro.showToast({
            title: '没有权限访问',
            icon: 'none'
          });
          reject(new Error('没有权限访问'));
        } else if (res.statusCode === 404) {
          const title = res.data?.error || res.data?.message || '请求的资源不存在';
          Taro.showToast({
            title,
            icon: 'none'
          });
          reject(new Error(title));
        } else if (res.statusCode >= 500) {
          Taro.showToast({
            title: '服务器错误，请稍后重试',
            icon: 'none'
          });
          reject(new Error('服务器错误，请稍后重试'));
        } else {
          // 其他错误
          const errorMessage = res.data?.error || res.data?.message || `请求失败: ${res.statusCode}`;
          Taro.showToast({
            title: errorMessage,
            icon: 'none'
          });
          reject(new Error(errorMessage));
        }
      },
      fail: (err) => {
        // 网络错误等
        console.error('网络请求失败:', err);
        let errorMessage = '网络请求失败';
        
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接';
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请检查网络设置';
          }
        }
        
        Taro.showToast({
          title: errorMessage,
          icon: 'none'
        });
        reject(new Error(errorMessage));
      }
    });
  });
};

// 常用请求方法封装
export const get = (url: string, data?: any, needToken = true) => {
  return request({
    url,
    method: 'GET',
    data,
    needToken
  });
};

export const post = (url: string, data?: any, needToken = true) => {
  return request({
    url,
    method: 'POST',
    data,
    needToken
  });
};

export const put = (url: string, data?: any, needToken = true) => {
  return request({
    url,
    method: 'PUT',
    data,
    needToken
  });
};

export const del = (url: string, data?: any, needToken = true) => {
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
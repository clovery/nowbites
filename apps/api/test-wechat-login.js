#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 默认配置
const API_URL = process.env.API_URL || 'http://localhost:3100';

async function testWechatLogin() {
  console.log('=== 微信登录API测试工具 ===');
  console.log(`API地址: ${API_URL}`);
  console.log('注意: 这个测试工具模拟微信小程序登录流程，需要手动输入code');
  console.log('在实际小程序中，code通过wx.login()获取');
  console.log('----------------------------');
  
  rl.question('请输入微信登录code (模拟wx.login获取的code): ', async (code) => {
    if (!code) {
      console.error('错误: code不能为空');
      rl.close();
      return;
    }
    
    // 模拟用户信息
    const mockUserInfo = {
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.png',
      gender: 1,
      country: 'China',
      province: 'Guangdong',
      city: 'Shenzhen'
    };
    
    try {
      console.log('正在请求API...');
      const response = await axios.post(`${API_URL}/api/auth/wechat-login`, {
        code,
        userInfo: mockUserInfo
      });
      
      console.log('\n=== 登录成功 ===');
      console.log('状态码:', response.status);
      console.log('\n=== 返回数据 ===');
      console.log(JSON.stringify(response.data, null, 2));
      
      // 测试验证令牌
      if (response.data && response.data.token) {
        console.log('\n=== 测试令牌验证 ===');
        try {
          const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            }
          });
          
          console.log('验证成功:');
          console.log(JSON.stringify(verifyResponse.data, null, 2));
        } catch (error) {
          console.error('验证失败:', error.response?.data || error.message);
        }
      }
      
    } catch (error) {
      console.error('\n=== 请求失败 ===');
      console.error('错误状态码:', error.response?.status);
      console.error('错误信息:', error.response?.data || error.message);
    }
    
    rl.close();
  });
}

testWechatLogin();
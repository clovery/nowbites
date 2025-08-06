// API配置

interface Config {
  apiBaseUrl: string;
}

// 开发环境配置
const devConfig: Config = {
  apiBaseUrl: 'http://localhost:3300'
};

// 生产环境配置
const prodConfig: Config = {
  apiBaseUrl: 'https://nowbites.veltix.cn' // 替换为实际的生产环境API地址
};

// 根据环境变量选择配置
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

export default config;
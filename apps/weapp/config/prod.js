const { execSync } = require('child_process');

// 获取构建时的短git SHA
function getGitSHA() {
  try {
    const shortSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    console.log('📋 Git SHA captured at build time:', shortSha);
    return shortSha;
  } catch (error) {
    console.warn('⚠️  Warning: Could not get git SHA:', error.message);
    return 'unknown';
  }
}

module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    // 注入短git SHA作为全局常量
    GIT_SHA: `"${getGitSHA()}"`
  },
  mini: {},
  h5: {
    /**
     * 如果h5端编译后体积过大，可以使用webpack-bundle-analyzer插件对打包体积进行分析。
     * 参考代码如下：
     * webpackChain (chain) {
     *   chain.plugin('analyzer')
     *     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
     * }
     */
  }
}
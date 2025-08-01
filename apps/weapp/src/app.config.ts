export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/recipe-list/index',
    'pages/recipe-detail/index',
    'pages/recipe-upload/index',
    'pages/meal-plan/index',
    'pages/my/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '今食刻',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#b4282d',
    backgroundColor: '#fafafa',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/tab-bar/home.png',
        selectedIconPath: 'assets/tab-bar/home-active.png',
        text: '首页'
      },
      {
        pagePath: 'pages/recipe-list/index',
        iconPath: 'assets/tab-bar/recipe.png',
        selectedIconPath: 'assets/tab-bar/recipe-active.png',
        text: '菜谱'
      },
      {
        pagePath: 'pages/meal-plan/index',
        iconPath: 'assets/tab-bar/plan.png',
        selectedIconPath: 'assets/tab-bar/plan-active.png',
        text: '计划'
      },
      {
        pagePath: 'pages/my/index',
        iconPath: 'assets/tab-bar/my.png',
        selectedIconPath: 'assets/tab-bar/my-active.png',
        text: '我的'
      }
    ]
  }
})

function defineAppConfig(config: any) {
  return config
}
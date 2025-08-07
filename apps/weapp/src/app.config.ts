export default defineAppConfig({
  pages: [
    'pages/recipes/index',
    'pages/index/index',
    'pages/kitchen/index',
    'pages/recipes/detail/index',
    'pages/recipe-upload/index',
    'pages/meal-plan/index',
    'pages/meal-plan/detail/index',
    'pages/plan-create/index',
    'pages/my/index',
    'pages/my/recipes/index',
    'pages/tools/index',
    'pages/tailwind-demo/index'
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
        pagePath: 'pages/recipes/index',
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
      },
    ]
  }
})

function defineAppConfig(config: any) {
  return config
}
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/kitchen/index',
    'pages/recipe-list/index',
    'pages/recipe-detail/index',
    'pages/recipe-upload/index',
    'pages/meal-plan/index',
    'pages/plan-create/index',
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
        pagePath: 'pages/kitchen/index',
        iconPath: 'assets/tab-bar/group.png',
        selectedIconPath: 'assets/tab-bar/group-active.png',
        text: '厨房'
      },
      {
        pagePath: 'pages/recipe-list/index',
        iconPath: 'assets/tab-bar/recipe.png',
        selectedIconPath: 'assets/tab-bar/recipe-active.png',
        text: '浏览'
      },
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/tab-bar/plus.png',
        selectedIconPath: 'assets/tab-bar/plus-active.png',
        text: '发布'
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
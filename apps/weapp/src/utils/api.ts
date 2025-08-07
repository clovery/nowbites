// 为了向后兼容，重新导出所有服务
// 建议使用新的服务结构：import { authService, recipeService, mealPlanService } from "../services"

export { authService, recipeService, mealPlanService } from "../services"
export type { 
  LoginResponse, 
  LoginRequest, 
  RecipeListResponse, 
  Plan, 
  CreatePlanRequest 
} from "../services"

// 为了向后兼容，保留 apiService 的导出
import { authService, recipeService, mealPlanService } from "../services"

class ApiService {
  // 认证相关
  wechatLogin = authService.wechatLogin.bind(authService)
  verifyToken = authService.verifyToken.bind(authService)

  // 菜谱相关
  getRecipes = recipeService.getRecipes.bind(recipeService)
  getRecipe = recipeService.getRecipe.bind(recipeService)
  getUserRecipes = recipeService.getUserRecipes.bind(recipeService)
  parseMarkdownRecipe = recipeService.parseMarkdownRecipe.bind(recipeService)

  // 计划相关 - 使用现有的 mealPlanService
  getPlans = mealPlanService.getPlans.bind(mealPlanService)
  createPlan = mealPlanService.createPlan.bind(mealPlanService)
  updatePlan = mealPlanService.updatePlan.bind(mealPlanService)
  deletePlan = mealPlanService.deletePlan.bind(mealPlanService)
  // 其他可用的方法：
  // getSharePlan, submitOrder, getPlanOrders, getMyRecipes, 
  // getPlanSummaries, getPlansByDate, addMealToPlan, 
  // updateMealPlanItem, removeMealFromPlan
}

export const apiService = new ApiService()

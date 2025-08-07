export interface Recipe {
  id: string
  title: string
  description?: string
  ingredients:
    | {
        main?: Array<{
          name: string
          amount: string
          unit?: string
          note?: string
        }>
        auxiliary?: Array<{
          name: string
          amount: string
          unit?: string
          note?: string
        }>
      }
    | Array<
        | {
            name: string
            amount: string
            unit?: string
            note?: string
          }
        | string
      >
  sauce?: Array<{
    name: string
    amount: string
    unit?: string
    note?: string
  }>
  steps: Array<{
    title: string
    content: string[]
    time?: number
  }>
  tips: Array<
    | {
        content: string
      }
    | string
  >
  cookingTime?: number | null
  servings?: number | null
  difficulty?: string | null
  imageUrl?: string | null
  coverImage?: string | null
  tags?: string[]
  isPublic?: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickName: string
    avatarUrl: string
  }
}

export interface Plan {
  id: string
  name: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
  mealPlanItems: Array<{
    id: string
    title: string
    cookTime: string
    completed: boolean
    order: number
    recipeId?: string
    recipe?: {
      id: string
      title: string
      coverImage?: string
      cookingTime?: number
    }
  }>
}

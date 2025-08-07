-- AlterTable
ALTER TABLE "public"."meal_plan_items" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."meal_plan_items" ADD CONSTRAINT "meal_plan_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

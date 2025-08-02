/*
  Warnings:

  - You are about to drop the column `instructions` on the `recipes` table. All the data in the column will be lost.
  - Added the required column `sauce` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steps` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tips` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."recipes" DROP COLUMN "instructions",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "sauce" JSONB NOT NULL,
ADD COLUMN     "steps" JSONB NOT NULL,
ADD COLUMN     "tips" JSONB NOT NULL;

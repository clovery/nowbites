/*
  Warnings:

  - Added the required column `references` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."recipes" ADD COLUMN     "references" JSONB NOT NULL DEFAULT '[]'::jsonb;

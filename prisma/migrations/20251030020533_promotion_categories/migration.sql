/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `discountTypeId` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `promotionTypeId` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the `DiscountType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promotionCategoryId` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Promotion" DROP CONSTRAINT "Promotion_discountTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Promotion" DROP CONSTRAINT "Promotion_promotionTypeId_fkey";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "discountAmount",
DROP COLUMN "discountTypeId",
DROP COLUMN "promotionTypeId",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "promotionCategoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PromotionType" ADD COLUMN     "promotionCategoryId" INTEGER;

-- DropTable
DROP TABLE "public"."DiscountType";

-- CreateTable
CREATE TABLE "PromotionCategory" (
    "id" SERIAL NOT NULL,
    "promotionCategory" TEXT NOT NULL,

    CONSTRAINT "PromotionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PromotionPromotionType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PromotionPromotionType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PromotionTypeFollowers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PromotionTypeFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PromotionPromotionType_B_index" ON "_PromotionPromotionType"("B");

-- CreateIndex
CREATE INDEX "_PromotionTypeFollowers_B_index" ON "_PromotionTypeFollowers"("B");

-- AddForeignKey
ALTER TABLE "PromotionType" ADD CONSTRAINT "PromotionType_promotionCategoryId_fkey" FOREIGN KEY ("promotionCategoryId") REFERENCES "PromotionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_promotionCategoryId_fkey" FOREIGN KEY ("promotionCategoryId") REFERENCES "PromotionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionPromotionType" ADD CONSTRAINT "_PromotionPromotionType_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionPromotionType" ADD CONSTRAINT "_PromotionPromotionType_B_fkey" FOREIGN KEY ("B") REFERENCES "PromotionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionTypeFollowers" ADD CONSTRAINT "_PromotionTypeFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionTypeFollowers" ADD CONSTRAINT "_PromotionTypeFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "PromotionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

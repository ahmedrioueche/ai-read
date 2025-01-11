/*
  Warnings:

  - You are about to drop the column `isPremium` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPremium",
ADD COLUMN     "freeTrialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPaymentValue" DOUBLE PRECISION,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free-trial';

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "freeTrialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFreeTrial" BOOLEAN NOT NULL DEFAULT true;

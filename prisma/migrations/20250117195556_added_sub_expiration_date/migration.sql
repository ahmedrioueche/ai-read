/*
  Warnings:

  - You are about to alter the column `lastPaymentValue` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subExpirationDate" TIMESTAMP(3),
ALTER COLUMN "lastPaymentValue" SET DATA TYPE INTEGER;

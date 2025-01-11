-- AlterTable
ALTER TABLE "User" ADD COLUMN     "freeTrialShownAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "freeTrialShownAt" TIMESTAMP(3);

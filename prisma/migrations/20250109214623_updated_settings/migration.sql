/*
  Warnings:

  - You are about to drop the column `readingReminder` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `voiceId` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "readingReminder",
DROP COLUMN "theme",
DROP COLUMN "voiceId",
ADD COLUMN     "appLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "bookLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "enableAutoScrolling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableHighlighting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableReading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableTranslation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readingSpeed" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "translationLanguage" JSONB NOT NULL DEFAULT '{"language": "en", "rtl": false}',
ADD COLUMN     "ttsType" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "ttsVoice" TEXT NOT NULL DEFAULT '';

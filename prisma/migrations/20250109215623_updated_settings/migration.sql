-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "appLanguage" SET DEFAULT 'english',
ALTER COLUMN "bookLanguage" SET DEFAULT 'english',
ALTER COLUMN "enableAutoScrolling" SET DEFAULT true,
ALTER COLUMN "enableHighlighting" SET DEFAULT true,
ALTER COLUMN "enableReading" SET DEFAULT true,
ALTER COLUMN "translationLanguage" SET DEFAULT '{"language": "english", "rtl": false}';

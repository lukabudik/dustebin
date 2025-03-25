-- AlterTable
ALTER TABLE "pastes" ADD COLUMN     "original_format" TEXT,
ADD COLUMN     "original_mime_type" TEXT,
ADD COLUMN     "paste_type" TEXT NOT NULL DEFAULT 'text';

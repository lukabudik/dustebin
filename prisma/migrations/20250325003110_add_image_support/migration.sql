-- AlterTable
ALTER TABLE "pastes" ADD COLUMN     "has_image" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image_height" INTEGER,
ADD COLUMN     "image_key" TEXT,
ADD COLUMN     "image_mime_type" TEXT,
ADD COLUMN     "image_size" INTEGER,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "image_width" INTEGER;

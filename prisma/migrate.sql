-- Add the is_compressed column to the pastes table
ALTER TABLE "pastes" ADD COLUMN "is_compressed" BOOLEAN NOT NULL DEFAULT false;

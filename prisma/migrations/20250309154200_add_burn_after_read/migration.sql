-- Add burn_after_read column to pastes table
ALTER TABLE "pastes" ADD COLUMN "burn_after_read" BOOLEAN NOT NULL DEFAULT false;

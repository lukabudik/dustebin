-- DropForeignKey
ALTER TABLE "pastes" DROP CONSTRAINT IF EXISTS "pastes_owner_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "users_email_key";
DROP INDEX IF EXISTS "users_username_key";

-- AlterTable
ALTER TABLE "pastes" DROP COLUMN IF EXISTS "owner_id";

-- DropTable
DROP TABLE IF EXISTS "users";

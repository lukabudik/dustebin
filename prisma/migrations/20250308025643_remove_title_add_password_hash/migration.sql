-- CreateTable
CREATE TABLE "pastes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'plaintext',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "owner_id" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pastes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pastes_language_idx" ON "pastes"("language");

-- CreateIndex
CREATE INDEX "pastes_created_at_idx" ON "pastes"("created_at");

-- CreateIndex
CREATE INDEX "pastes_expires_at_idx" ON "pastes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "pastes" ADD CONSTRAINT "pastes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

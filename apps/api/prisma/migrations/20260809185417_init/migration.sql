-- AlterTable
ALTER TABLE "preparation_progress" ADD COLUMN     "initial_level" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preparation_setup_completed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "preparation_sources" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "profile_url" TEXT NOT NULL,
    "metrics" JSONB,
    "last_synced_at" TIMESTAMP(3),
    "last_sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preparation_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preparation_sources_user_id_provider_key" ON "preparation_sources"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "preparation_sources" ADD CONSTRAINT "preparation_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

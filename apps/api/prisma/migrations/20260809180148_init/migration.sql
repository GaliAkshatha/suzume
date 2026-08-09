-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_id" TEXT,
    "date" DATE NOT NULL,
    "questions_solved" INTEGER NOT NULL DEFAULT 0,
    "duration_minutes" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preparation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "preparation_logs_user_id_date_idx" ON "preparation_logs"("user_id", "date");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_logs" ADD CONSTRAINT "preparation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_logs" ADD CONSTRAINT "preparation_logs_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "preparation_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

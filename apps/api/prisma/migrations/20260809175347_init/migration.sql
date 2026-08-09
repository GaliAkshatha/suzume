/*
  Warnings:

  - A unique constraint covering the columns `[name,parent_id,user_id]` on the table `preparation_topics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "preparation_topics_name_parent_id_key";

-- AlterTable
ALTER TABLE "preparation_topics" ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "preparation_topics_name_parent_id_user_id_key" ON "preparation_topics"("name", "parent_id", "user_id");

-- AddForeignKey
ALTER TABLE "preparation_topics" ADD CONSTRAINT "preparation_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

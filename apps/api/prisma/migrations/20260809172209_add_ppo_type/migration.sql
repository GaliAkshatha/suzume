/*
  Warnings:

  - You are about to drop the column `ppo` on the `applications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MANUAL', 'PASTED_TEXT', 'GMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PpoType" AS ENUM ('NONE', 'PPO', 'PERFORMANCE_BASED_PPO');

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "ppo",
ADD COLUMN     "ppoType" "PpoType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "source" "SourceType" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "rounds" ADD COLUMN     "source" "SourceType" NOT NULL DEFAULT 'MANUAL';

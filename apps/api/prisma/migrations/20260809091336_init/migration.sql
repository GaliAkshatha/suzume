-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('INTERESTED', 'APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('APPLICATION_SUBMITTED', 'SHORTLISTED', 'ONLINE_ASSESSMENT', 'TECHNICAL_INTERVIEW', 'HR_ROUND', 'MANAGERIAL_ROUND', 'FINAL_RESULT', 'OTHER');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('UPCOMING', 'PREPARING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoundMode" AS ENUM ('ONLINE', 'OFFLINE', 'PHONE', 'TAKE_HOME');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('DSA', 'DBMS', 'SQL', 'OS', 'OOP', 'SYSTEM_DESIGN', 'PROJECTS', 'BEHAVIORAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Performance" AS ENUM ('POOR', 'AVERAGE', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "LearningCategory" AS ENUM ('COMMUNICATION', 'TECHNICAL', 'TIME_MANAGEMENT', 'PROBLEM_SOLVING', 'BEHAVIORAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LearningPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "application_date" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "internship" BOOLEAN NOT NULL DEFAULT false,
    "ppo" BOOLEAN NOT NULL DEFAULT false,
    "stipend" DECIMAL(12,2),
    "ctc" DECIMAL(12,2),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'INTERESTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "type" "RoundType" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "duration" INTEGER,
    "mode" "RoundMode",
    "status" "RoundStatus" NOT NULL DEFAULT 'UPCOMING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "summary" TEXT,
    "what_went_well" TEXT,
    "what_went_badly" TEXT,
    "confidence" INTEGER,
    "overall_reflection" TEXT,
    "topics_covered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "topic" TEXT,
    "difficulty" "Difficulty",
    "performance" "Performance",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learnings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "LearningCategory" NOT NULL,
    "priority" "LearningPriority" NOT NULL DEFAULT 'MEDIUM',
    "source_type" TEXT,
    "source_id" TEXT,
    "status" "LearningStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_items" (
    "id" TEXT NOT NULL,
    "learning_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "preparation_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "questions_solved" INTEGER NOT NULL DEFAULT 0,
    "questions_total" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preparation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_user_id_status_idx" ON "applications"("user_id", "status");

-- CreateIndex
CREATE INDEX "rounds_application_id_idx" ON "rounds"("application_id");

-- CreateIndex
CREATE INDEX "rounds_scheduled_at_idx" ON "rounds"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_round_id_key" ON "experiences"("round_id");

-- CreateIndex
CREATE INDEX "questions_experience_id_idx" ON "questions"("experience_id");

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "questions"("category");

-- CreateIndex
CREATE INDEX "learnings_user_id_idx" ON "learnings"("user_id");

-- CreateIndex
CREATE INDEX "learnings_user_id_category_idx" ON "learnings"("user_id", "category");

-- CreateIndex
CREATE INDEX "action_items_learning_id_idx" ON "action_items"("learning_id");

-- CreateIndex
CREATE UNIQUE INDEX "preparation_topics_name_parent_id_key" ON "preparation_topics"("name", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "preparation_progress_user_id_topic_id_key" ON "preparation_progress"("user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learnings" ADD CONSTRAINT "learnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_learning_id_fkey" FOREIGN KEY ("learning_id") REFERENCES "learnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_topics" ADD CONSTRAINT "preparation_topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "preparation_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_progress" ADD CONSTRAINT "preparation_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_progress" ADD CONSTRAINT "preparation_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "preparation_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

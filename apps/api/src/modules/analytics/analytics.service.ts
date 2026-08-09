import { prisma } from "../../config/prisma";

const TERMINAL_STATUSES = ["OFFER", "REJECTED", "WITHDRAWN"];

export async function getAnalyticsOverview(userId: string) {
  const applications = await prisma.application.findMany({ where: { userId } });

  const applicationsByStatus: Record<string, number> = {};
  for (const app of applications) {
    applicationsByStatus[app.status] = (applicationsByStatus[app.status] ?? 0) + 1;
  }
  const activeApplications = applications.filter((a) => !TERMINAL_STATUSES.includes(a.status)).length;

  const rounds = await prisma.round.findMany({ where: { application: { userId } } });
  const interviewCount = rounds.filter((r) => r.type === "TECHNICAL_INTERVIEW" || r.type === "MANAGERIAL_ROUND").length;
  const assessmentCount = rounds.filter((r) => r.type === "ONLINE_ASSESSMENT").length;

  const offers = applications.filter((a) => a.status === "OFFER").length;
  const rejections = applications.filter((a) => a.status === "REJECTED").length;

  const topics = await prisma.preparationTopic.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { name: "asc" },
  });
  const progress = await prisma.preparationProgress.findMany({ where: { userId } });
  const progressByTopic = new Map(progress.map((p) => [p.topicId, p]));

  const preparationProgress = topics.map((topic) => {
    const p = progressByTopic.get(topic.id);
    const percent = p && p.questionsTotal > 0
      ? Math.round((p.questionsSolved / p.questionsTotal) * 100)
      : p?.confidence ?? 0;
    return { name: topic.name, progressPercent: percent };
  });

  const questionsSolved = progress.reduce((sum, p) => sum + p.questionsSolved, 0);

  const questions = await prisma.question.findMany({
    where: { experience: { round: { application: { userId } } } },
  });

  const questionsByCategory: Record<string, number> = {};
  for (const q of questions) {
    questionsByCategory[q.category] = (questionsByCategory[q.category] ?? 0) + 1;
  }

  const topicCounts = new Map<string, number>();
  for (const q of questions) {
    const key = q.topic?.trim() || q.category;
    topicCounts.set(key, (topicCounts.get(key) ?? 0) + 1);
  }
  const mostCommonTopics = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const learnings = await prisma.learning.findMany({ where: { userId }, include: { actionItems: true } });
  const lessonsByCategory: Record<string, number> = {};
  const learningsByStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  let totalActionItems = 0;
  let completedActionItems = 0;

  for (const l of learnings) {
    lessonsByCategory[l.category] = (lessonsByCategory[l.category] ?? 0) + 1;
    learningsByStatus[l.status] = (learningsByStatus[l.status] ?? 0) + 1;
    totalActionItems += l.actionItems.length;
    completedActionItems += l.actionItems.filter((a) => a.status === "DONE").length;
  }

  const recurringWeaknesses = Object.entries(lessonsByCategory)
    .filter(([, count]) => count >= 2)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const roundsNext7Days = rounds.filter(
    (r) => r.scheduledAt && r.scheduledAt >= now && r.scheduledAt <= in7Days && r.status !== "CANCELLED"
  ).length;
  const roundsNext30Days = rounds.filter(
    (r) => r.scheduledAt && r.scheduledAt >= now && r.scheduledAt <= in30Days && r.status !== "CANCELLED"
  ).length;
  const deadlinesUpcoming = applications.filter((a) => a.deadline && a.deadline >= now).length;

  return {
    totalApplications: applications.length,
    activeApplications,
    applicationsByStatus,
    interviewCount,
    assessmentCount,
    offers,
    rejections,
    preparationProgress,
    questionsSolved,
    questionsRecorded: questions.length,
    questionsByCategory,
    mostCommonTopics,
    lessonsByCategory,
    learningsByStatus,
    actionItems: { total: totalActionItems, completed: completedActionItems },
    recurringWeaknesses,
    upcoming: { roundsNext7Days, roundsNext30Days, deadlinesUpcoming },
  };
}

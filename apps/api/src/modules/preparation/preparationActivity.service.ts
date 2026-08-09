import { prisma } from "../../config/prisma";

export async function getActivity(userId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  since.setHours(0, 0, 0, 0);

  const logs = await prisma.preparationLog.findMany({
    where: { userId, date: { gte: since } },
    include: { topic: true },
    orderBy: { date: "asc" },
  });

  const dayMap = new Map<string, { minutes: number; questions: number; topics: Set<string> }>();
  for (const log of logs) {
    const key = log.date.toISOString().slice(0, 10);
    const entry = dayMap.get(key) ?? { minutes: 0, questions: 0, topics: new Set<string>() };
    entry.minutes += log.durationMinutes ?? 0;
    entry.questions += log.questionsSolved;
    if (log.topicId) entry.topics.add(log.topicId);
    dayMap.set(key, entry);
  }

  const days = [...dayMap.entries()].map(([date, v]) => ({
    date,
    minutes: v.minutes,
    questionsSolved: v.questions,
    topicsCount: v.topics.size,
  }));

  const topicMap = new Map<
    string,
    { topicId: string; topicName: string; lastStudied: Date; minutes: number; questionsSolved: number }
  >();
  for (const log of logs) {
    if (!log.topicId || !log.topic) continue;
    const minutes = log.durationMinutes ?? 0;
    const existing = topicMap.get(log.topicId);
    if (existing) {
      existing.minutes += minutes;
      existing.questionsSolved += log.questionsSolved;
      if (log.date > existing.lastStudied) existing.lastStudied = log.date;
    } else {
      topicMap.set(log.topicId, {
        topicId: log.topicId,
        topicName: log.topic.name,
        lastStudied: log.date,
        minutes,
        questionsSolved: log.questionsSolved,
      });
    }
  }

  const recentTopics = [...topicMap.values()]
    .sort((a, b) => b.lastStudied.getTime() - a.lastStudied.getTime())
    .slice(0, 6)
    .map((t) => ({ ...t, lastStudied: t.lastStudied.toISOString() }));

  return { days, recentTopics };
}

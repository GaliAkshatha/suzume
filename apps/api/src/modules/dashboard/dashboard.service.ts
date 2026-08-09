import { prisma } from "../../config/prisma";

const TERMINAL_STATUSES = ["OFFER", "REJECTED", "WITHDRAWN"];

export async function getDashboardSummary(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      company: true,
      rounds: { orderBy: { scheduledAt: "asc" } },
    },
  });

  const experiencesCount = await prisma.experience.count({
    where: { round: { application: { userId } } },
  });

  const now = new Date();

  const activeApplications = applications.filter((a) => !TERMINAL_STATUSES.includes(a.status));

  const allUpcomingRounds = applications
    .flatMap((a) =>
      a.rounds
        .filter((r) => r.scheduledAt && r.scheduledAt >= now && r.status !== "CANCELLED")
        .map((r) => ({ round: r, application: a }))
    )
    .sort((a, b) => (a.round.scheduledAt!.getTime() - b.round.scheduledAt!.getTime()));

  const upcoming = allUpcomingRounds.slice(0, 5).map(({ round, application }) => ({
    id: round.id,
    title: round.title,
    companyName: application.company.name,
    scheduledAt: round.scheduledAt!.toISOString(),
    type: round.type,
  }));

  const topics = await prisma.preparationTopic.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { name: "asc" },
  });
  const progress = await prisma.preparationProgress.findMany({ where: { userId } });
  const progressByTopic = new Map(progress.map((p) => [p.topicId, p]));

  const preparationOverview = topics.map((topic) => {
    const p = progressByTopic.get(topic.id);
    const percent = p && p.questionsTotal > 0
      ? Math.round((p.questionsSolved / p.questionsTotal) * 100)
      : p?.confidence ?? 0;
    return { topicId: topic.id, name: topic.name, progressPercent: percent };
  });

  const activeProcesses = activeApplications.map((application) => {
    const upcomingRound = application.rounds.find(
      (r) => (r.status === "UPCOMING" || r.status === "PREPARING") && r.scheduledAt && r.scheduledAt >= now
    );
    const latestRound = [...application.rounds].reverse()[0];
    const currentRound = upcomingRound ?? latestRound ?? null;

    return {
      applicationId: application.id,
      companyName: application.company.name,
      role: application.role,
      currentRoundTitle: currentRound?.title ?? "Application Submitted",
      currentRoundDate: currentRound?.scheduledAt?.toISOString() ?? null,
      status: application.status,
    };
  });

  return {
    stats: {
      applications: applications.length,
      activeProcesses: activeApplications.length,
      upcomingRounds: allUpcomingRounds.length,
      experiencesLogged: experiencesCount,
    },
    upcoming,
    preparationOverview,
    activeProcesses,
  };
}

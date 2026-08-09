import { prisma } from "../../config/prisma";

export async function getCalendarEvents(userId: string, from?: string, to?: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: { company: true, rounds: true },
  });

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  const inRange = (d: Date) => {
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  };

  const events: Array<{
    id: string;
    title: string;
    companyName: string;
    date: string;
    type: "ROUND" | "DEADLINE";
    status: string;
  }> = [];

  for (const application of applications) {
    if (application.deadline && inRange(application.deadline)) {
      events.push({
        id: `deadline-${application.id}`,
        title: `${application.company.name} Deadline`,
        companyName: application.company.name,
        date: application.deadline.toISOString(),
        type: "DEADLINE",
        status: application.status,
      });
    }

    for (const round of application.rounds) {
      if (round.scheduledAt && inRange(round.scheduledAt)) {
        events.push({
          id: `round-${round.id}`,
          title: `${application.company.name} — ${round.title}`,
          companyName: application.company.name,
          date: round.scheduledAt.toISOString(),
          type: "ROUND",
          status: round.status,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

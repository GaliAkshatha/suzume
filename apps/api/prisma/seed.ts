import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TOPIC_SEED: Array<{ name: string; category: string }> = [
  { name: "DSA", category: "DSA" },
  { name: "DBMS", category: "DBMS" },
  { name: "OS", category: "OS" },
  { name: "SQL", category: "SQL" },
  { name: "System Design", category: "SYSTEM_DESIGN" },
  { name: "CN", category: "CN" },
];

async function main() {
  console.log("Seeding suzume database...");

  const passwordHash = await bcrypt.hash("Password123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "aditya@example.com" },
    update: {},
    create: {
      name: "Aditya",
      email: "aditya@example.com",
      passwordHash,
      preparationSetupCompletedAt: new Date(),
    },
  });

  const topics = new Map<string, string>();
  for (const t of TOPIC_SEED) {
    const topic = await prisma.preparationTopic.upsert({
      where: { name_parentId_userId: { name: t.name, parentId: null as any, userId: null as any } },
      update: {},
      create: { name: t.name, category: t.category },
    });
    topics.set(t.name, topic.id);
  }

  const preparationSeed = [
    { name: "DSA", solved: 164, total: 200, confidence: 82, daysAgo: 1 },
    { name: "DBMS", solved: 32, total: 50, confidence: 64, daysAgo: 3 },
    { name: "OS", solved: 21, total: 49, confidence: 43, daysAgo: 6 },
    { name: "System Design", solved: 7, total: 19, confidence: 37, daysAgo: 10 },
    { name: "SQL", solved: 37, total: 50, confidence: 74, daysAgo: 2 },
    { name: "CN", solved: 14, total: 40, confidence: 45, daysAgo: 5 },
  ];

  for (const p of preparationSeed) {
    const topicId = topics.get(p.name)!;
    await prisma.preparationProgress.upsert({
      where: { userId_topicId: { userId: user.id, topicId } },
      update: {},
      create: {
        userId: user.id,
        topicId,
        questionsSolved: p.solved,
        questionsTotal: p.total,
        confidence: p.confidence,
        lastPracticed: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  const logSeed = [
    { name: "DSA", daysAgo: 0, solved: 8, minutes: 135, notes: "Sliding window pattern, revisited two-pointer problems." },
    { name: "SQL", daysAgo: 1, solved: 5, minutes: 60, notes: "Window functions and CTEs." },
    { name: "DSA", daysAgo: 2, solved: 6, minutes: 90, notes: "Graph traversal — BFS/DFS." },
    { name: "DBMS", daysAgo: 2, solved: 4, minutes: 45, notes: "Normalization forms revision." },
    { name: "CN", daysAgo: 4, solved: 3, minutes: 40, notes: "TCP handshake, congestion control." },
    { name: "OS", daysAgo: 6, solved: 5, minutes: 70, notes: "Deadlock detection & prevention." },
    { name: "System Design", daysAgo: 9, solved: 2, minutes: 100, notes: "Rate limiter design revision notes." },
    { name: "DSA", daysAgo: 12, solved: 10, minutes: 150, notes: "Dynamic programming — knapsack variants." },
  ];

  for (const l of logSeed) {
    const topicId = topics.get(l.name)!;
    await prisma.preparationLog.create({
      data: {
        userId: user.id,
        topicId,
        date: new Date(Date.now() - l.daysAgo * 24 * 60 * 60 * 1000),
        questionsSolved: l.solved,
        durationMinutes: l.minutes,
        notes: l.notes,
      },
    });
  }

  async function ensureCompany(name: string, website: string) {
    return prisma.company.upsert({
      where: { name },
      update: {},
      create: { name, website },
    });
  }

  const inmobi = await ensureCompany("InMobi", "https://www.inmobi.com");
  const amazon = await ensureCompany("Amazon", "https://www.amazon.jobs");
  const google = await ensureCompany("Google", "https://careers.google.com");
  const microsoft = await ensureCompany("Microsoft", "https://careers.microsoft.com");
  const flipkart = await ensureCompany("Flipkart", "https://www.flipkartcareers.com");

  const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const inmobiApp = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: inmobi.id,
      role: "SDE-1 Intern",
      location: "Bangalore",
      applicationDate: daysAgo(4),
      deadline: daysAgo(2),
      internship: true,
      ppoType: "PERFORMANCE_BASED_PPO",
      stipend: 70000,
      ctc: 5350000,
      status: "INTERVIEW",
      notes: "Referral from campus placement cell.",
      rounds: {
        create: [
          { type: "APPLICATION_SUBMITTED", title: "Application Submitted", scheduledAt: daysAgo(4), status: "COMPLETED" },
          { type: "SHORTLISTED", title: "Shortlisted", scheduledAt: daysAgo(1), status: "COMPLETED" },
          { type: "ONLINE_ASSESSMENT", title: "Online Assessment", scheduledAt: daysFromNow(3), duration: 90, mode: "ONLINE", status: "UPCOMING" },
          { type: "TECHNICAL_INTERVIEW", title: "Technical Interview 1", scheduledAt: daysFromNow(5), duration: 60, mode: "ONLINE", status: "UPCOMING" },
          { type: "TECHNICAL_INTERVIEW", title: "Technical Interview 2", scheduledAt: daysFromNow(7), duration: 60, mode: "ONLINE", status: "UPCOMING" },
          { type: "HR_ROUND", title: "HR Round", scheduledAt: daysFromNow(9), duration: 30, mode: "ONLINE", status: "UPCOMING" },
          { type: "FINAL_RESULT", title: "Final Result", scheduledAt: daysFromNow(11), status: "UPCOMING" },
        ],
      },
    },
    include: { rounds: true },
  });

  const inmobiCompletedRound = inmobiApp.rounds.find((r) => r.type === "SHORTLISTED")!;
  const inmobiOaRound = await prisma.round.create({
    data: {
      applicationId: inmobiApp.id,
      type: "ONLINE_ASSESSMENT",
      title: "InMobi Online Assessment (Practice)",
      scheduledAt: daysAgo(6),
      duration: 90,
      mode: "ONLINE",
      status: "COMPLETED",
      source: "PASTED_TEXT",
    },
  });

  const inmobiOaExperience = await prisma.experience.create({
    data: {
      roundId: inmobiOaRound.id,
      summary: "Two DSA problems and a SQL query optimization round.",
      whatWentWell: "Solved both DSA problems within time.",
      whatWentBadly: "Struggled with SQL query optimization under time pressure.",
      confidence: 7,
      overallReflection: "Need to improve query optimization and indexing concepts.",
      topicsCovered: ["DSA (Arrays, HashMap)", "SQL"],
      questions: {
        create: [
          {
            question: "Find the longest subarray with sum equal to k.",
            category: "DSA",
            topic: "Arrays, HashMap",
            difficulty: "MEDIUM",
            performance: "GOOD",
          },
          {
            question: "Optimize a slow query joining three large tables.",
            category: "SQL",
            topic: "Query Optimization",
            difficulty: "HARD",
            performance: "AVERAGE",
          },
        ],
      },
    },
  });

  const inmobiTechRound = await prisma.round.create({
    data: {
      applicationId: inmobiApp.id,
      type: "TECHNICAL_INTERVIEW",
      title: "Technical Interview 1",
      scheduledAt: daysAgo(0),
      duration: 60,
      mode: "ONLINE",
      status: "COMPLETED",
    },
  });

  await prisma.experience.create({
    data: {
      roundId: inmobiTechRound.id,
      summary: "DSA problem, SQL discussion, OOP and project deep-dive.",
      whatWentWell: "Explained approach clearly on the first problem. Handled follow-up questions. Project discussion went well.",
      whatWentBadly: "Rushed into the second problem. Could optimize SQL query better. Need to revise OOP concepts.",
      confidence: 7,
      overallReflection: "Revise HashMap patterns, practice SQL window functions, brush up OOP principles.",
      topicsCovered: ["DSA (Arrays, HashMap)", "SQL", "OOP", "Project Discussion"],
      questions: {
        create: [
          { question: "Two Sum variant with streaming input.", category: "DSA", topic: "HashMap", difficulty: "MEDIUM", performance: "GOOD" },
          { question: "Explain ACID properties with an example.", category: "DBMS", topic: "Transactions", difficulty: "EASY", performance: "GOOD" },
          { question: "Design a rate limiter class using OOP.", category: "OOP", topic: "Design Patterns", difficulty: "MEDIUM", performance: "AVERAGE" },
        ],
      },
    },
  });

  await prisma.learning.create({
    data: {
      userId: user.id,
      title: "Explain Approach Before Coding",
      description: "I tend to jump directly into coding. Need to spend 1-2 minutes explaining the approach first.",
      category: "COMMUNICATION",
      priority: "HIGH",
      sourceType: "ROUND",
      sourceId: inmobiTechRound.id,
      actionItems: {
        create: [{ title: "Practice narrating approach out loud before coding in next 3 mock interviews", status: "PENDING" }],
      },
    },
  });

  await prisma.learning.create({
    data: {
      userId: user.id,
      title: "SQL Query Optimization",
      description: "Need to improve query optimization and indexing concepts.",
      category: "TECHNICAL",
      priority: "HIGH",
      sourceType: "ROUND",
      sourceId: inmobiOaRound.id,
      actionItems: {
        create: [{ title: "Complete SQL indexing chapter and solve 10 optimization problems", status: "PENDING" }],
      },
    },
  });

  const amazonApp = await prisma.application.create({
    data: {
      userId: user.id,
      companyId: amazon.id,
      role: "SDE Internship",
      location: "Hyderabad",
      applicationDate: daysAgo(6),
      internship: true,
      ppoType: "PPO",
      stipend: 80000,
      status: "ASSESSMENT",
      rounds: {
        create: [
          { type: "APPLICATION_SUBMITTED", title: "Application Submitted", scheduledAt: daysAgo(6), status: "COMPLETED" },
          { type: "ONLINE_ASSESSMENT", title: "SDE Internship OA", scheduledAt: daysFromNow(6), duration: 120, mode: "ONLINE", status: "PREPARING" },
        ],
      },
    },
  });

  const amazonOldOaRound = await prisma.round.create({
    data: {
      applicationId: amazonApp.id,
      type: "ONLINE_ASSESSMENT",
      title: "Amazon OA (Practice Set)",
      scheduledAt: daysAgo(10),
      duration: 120,
      mode: "ONLINE",
      status: "COMPLETED",
    },
  });

  await prisma.experience.create({
    data: {
      roundId: amazonOldOaRound.id,
      summary: "Two coding problems and OOP-based design question.",
      whatWentWell: "Handled the first problem confidently.",
      whatWentBadly: "Rushed the second problem, could not attempt the last question, need better time distribution.",
      confidence: 5,
      overallReflection: "Need to revise OOP concepts and practice timed mock tests.",
      topicsCovered: ["DSA", "OOP"],
    },
  });

  await prisma.learning.create({
    data: {
      userId: user.id,
      title: "Time Management in OA",
      description: "Could not attempt last question. Need better time distribution across problems.",
      category: "TIME_MANAGEMENT",
      priority: "MEDIUM",
      sourceType: "ROUND",
      sourceId: amazonOldOaRound.id,
      actionItems: {
        create: [{ title: "Do 5 timed 90-minute mock OA sets before next assessment", status: "PENDING" }],
      },
    },
  });

  await prisma.learning.create({
    data: {
      userId: user.id,
      title: "OOP Design Principles",
      description: "Need to revise SOLID principles and object-oriented design patterns.",
      category: "TECHNICAL",
      priority: "LOW",
      sourceType: null,
      sourceId: null,
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyId: google.id,
      role: "Technical Interview",
      location: "Bangalore",
      applicationDate: daysAgo(8),
      internship: false,
      ppoType: "NONE",
      status: "INTERVIEW",
      rounds: {
        create: [
          { type: "APPLICATION_SUBMITTED", title: "Application Submitted", scheduledAt: daysAgo(8), status: "COMPLETED" },
          { type: "TECHNICAL_INTERVIEW", title: "Technical Interview", scheduledAt: daysFromNow(9), duration: 60, mode: "ONLINE", status: "PREPARING" },
        ],
      },
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyId: microsoft.id,
      role: "SWE Intern",
      location: "Noida",
      applicationDate: daysAgo(1),
      internship: true,
      ppoType: "PERFORMANCE_BASED_PPO",
      status: "APPLIED",
      rounds: {
        create: [{ type: "APPLICATION_SUBMITTED", title: "Application Submitted", scheduledAt: daysAgo(1), status: "COMPLETED" }],
      },
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      companyId: flipkart.id,
      role: "SDE-1 Intern",
      location: "Bangalore",
      applicationDate: daysAgo(15),
      internship: true,
      ppoType: "NONE",
      status: "SHORTLISTED",
      rounds: {
        create: [
          { type: "APPLICATION_SUBMITTED", title: "Application Submitted", scheduledAt: daysAgo(15), status: "COMPLETED" },
          { type: "SHORTLISTED", title: "Shortlisted", scheduledAt: daysAgo(9), status: "COMPLETED" },
          { type: "HR_ROUND", title: "HR Round", scheduledAt: null, status: "UPCOMING", notes: "Date to be confirmed by recruiter." },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log("Demo login -> email: aditya@example.com | password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

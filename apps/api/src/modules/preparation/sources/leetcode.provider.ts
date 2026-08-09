import { NormalizedPreparationActivity, PreparationSourceProvider } from "./preparationSource.types";

function extractUsername(profileUrl: string): string | null {
  const match = profileUrl.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?/i);
  return match ? match[1] : null;
}

// LeetCode has no official public API for third-party apps. This calls the
// same unauthenticated GraphQL endpoint the public profile page itself
// uses to render submission stats — no login, cookies, or scraping of
// rendered HTML/DOM is involved, and only data already public on the
// user's own profile page is read. If LeetCode ever publishes an official
// API, swap the fetch below without touching the provider interface.
export const leetcodeProvider: PreparationSourceProvider = {
  key: "leetcode",
  name: "LeetCode",
  async fetchActivity(profileUrl: string): Promise<NormalizedPreparationActivity> {
    const username = extractUsername(profileUrl);
    if (!username) {
      throw new Error("Could not read a LeetCode username from that URL.");
    }

    const query = `
      query userStats($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
        recentAcSubmissionList(username: $username, limit: 1) { timestamp }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode responded with status ${response.status}`);
    }

    const payload = (await response.json()) as any;
    const stats = payload?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum as
      | Array<{ difficulty: string; count: number }>
      | undefined;

    if (!stats) {
      throw new Error("No public LeetCode data found for this profile.");
    }

    const byDifficulty = (label: string) => stats.find((s) => s.difficulty === label)?.count ?? 0;
    const lastTimestamp = payload?.data?.recentAcSubmissionList?.[0]?.timestamp;

    return {
      totalSolved: byDifficulty("All"),
      easySolved: byDifficulty("Easy"),
      mediumSolved: byDifficulty("Medium"),
      hardSolved: byDifficulty("Hard"),
      lastActivityDate: lastTimestamp ? new Date(Number(lastTimestamp) * 1000).toISOString() : null,
    };
  },
};

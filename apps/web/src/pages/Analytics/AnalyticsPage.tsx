import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAsyncData } from "../../hooks/useAsyncData";
import { analyticsApi } from "../../services/api/analyticsApi";
import { Card } from "../../components/ui/Card";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { titleCase } from "../../utils/format";

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

export default function AnalyticsPage() {
  const { data, loading, error, reload } = useAsyncData(() => analyticsApi.overview());

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const statusData = Object.entries(data.applicationsByStatus).map(([status, count]) => ({
    name: titleCase(status),
    value: count,
  }));

  const categoryData = Object.entries(data.lessonsByCategory).map(([category, count]) => ({
    name: titleCase(category),
    count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Insights derived from your real placement data.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Applications" value={data.totalApplications} />
        <StatCard label="Active Applications" value={data.activeApplications} />
        <StatCard label="Interviews" value={data.interviewCount} />
        <StatCard label="Offers" value={data.offers} accent="text-emerald-600" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Rejections" value={data.rejections} accent="text-red-500" />
        <StatCard label="Rounds in Next 7 Days" value={data.upcoming.roundsNext7Days} />
        <StatCard label="Rounds in Next 30 Days" value={data.upcoming.roundsNext30Days} />
        <StatCard label="Upcoming Deadlines" value={data.upcoming.deadlinesUpcoming} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Applications by Status</h2>
          {statusData.length === 0 ? (
            <EmptyState title="No applications yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Preparation Progress</h2>
            <span className="text-xs text-slate-400">
              {data.questionsSolved} solved · {data.questionsRecorded} interview Qs logged
            </span>
          </div>
          {data.preparationProgress.length === 0 ? (
            <EmptyState title="No preparation data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.preparationProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f0fb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progressPercent" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Most Common Interview Topics</h2>
          {data.mostCommonTopics.length === 0 ? (
            <EmptyState title="No questions logged yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.mostCommonTopics} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f0fb" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Lessons by Category</h2>
          {categoryData.length === 0 ? (
            <EmptyState title="No lessons logged yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f0fb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {data.recurringWeaknesses.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recurring Weaknesses</h2>
          <div className="flex flex-wrap gap-2">
            {data.recurringWeaknesses.map((w) => (
              <span key={w.category} className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
                {titleCase(w.category)} · {w.count} lessons
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Learnings &amp; Action Items</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Open" value={data.learningsByStatus.OPEN ?? 0} />
          <MiniStat label="In Progress" value={data.learningsByStatus.IN_PROGRESS ?? 0} />
          <MiniStat label="Resolved" value={data.learningsByStatus.RESOLVED ?? 0} />
          <MiniStat label="Action Items Done" value={`${data.actionItems.completed} / ${data.actionItems.total}`} />
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card className="p-4">
      <p className={`text-2xl font-bold ${accent ?? "text-slate-900"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </Card>
  );
}

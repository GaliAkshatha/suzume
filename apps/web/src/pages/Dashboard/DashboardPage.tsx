import { Link } from "react-router-dom";
import { Briefcase, Flame, CalendarClock, MessageSquare, ArrowRight } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useAsyncData } from "../../hooks/useAsyncData";
import { dashboardApi } from "../../services/api/dashboardApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { applicationStatusStyles } from "../../utils/statusStyles";
import { formatDateTime, relativeDay, titleCase, timeBasedGreeting } from "../../utils/format";

const STAT_ICONS = [Briefcase, Flame, CalendarClock, MessageSquare];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsyncData(() => dashboardApi.summary());

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const statCards = [
    { label: "Applications", value: data.stats.applications },
    { label: "Active Processes", value: data.stats.activeProcesses },
    { label: "Upcoming Rounds", value: data.stats.upcomingRounds },
    { label: "Experiences Logged", value: data.stats.experiencesLogged },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">{timeBasedGreeting()}, {user?.name ?? "there"} 👋</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <Card key={stat.label} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Upcoming</h2>
          {data.upcoming.length === 0 ? (
            <EmptyState title="Nothing scheduled yet" description="Add rounds to your applications to see them here." />
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {data.upcoming.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {event.companyName} - {event.title}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(event.scheduledAt)}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-500">{relativeDay(event.scheduledAt)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Preparation Overview
          </h2>
          {data.preparationOverview.length === 0 ? (
            <EmptyState title="No preparation topics yet" />
          ) : (
            <div className="flex flex-col gap-3.5">
              {data.preparationOverview.map((topic) => (
                <div key={topic.topicId} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-slate-600">{topic.name}</span>
                  <ProgressBar percent={topic.progressPercent} />
                  <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-700">
                    {topic.progressPercent}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Active Processes</h2>
          <Link to="/applications" className="flex items-center gap-1 text-sm font-medium text-primary-600">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {data.activeProcesses.length === 0 ? (
          <EmptyState
            title="No active processes"
            description="Applications you're actively pursuing will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Company</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 font-medium">Current Round</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.activeProcesses.map((process) => (
                  <tr key={process.applicationId} className="group">
                    <td className="py-3 pr-4">
                      <Link
                        to={`/applications/${process.applicationId}`}
                        className="font-medium text-slate-800 group-hover:text-primary-600"
                      >
                        {process.companyName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{process.role}</td>
                    <td className="py-3 pr-4 text-slate-600">{process.currentRoundTitle}</td>
                    <td className="py-3 pr-4 text-slate-500">
                      {process.currentRoundDate ? formatDateTime(process.currentRoundDate) : "TBD"}
                    </td>
                    <td className="py-3">
                      <Badge className={applicationStatusStyles[process.status]}>
                        {titleCase(process.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

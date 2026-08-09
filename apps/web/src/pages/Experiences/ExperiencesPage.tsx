import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { experienceApi } from "../../services/api/experienceApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { formatDate, titleCase } from "../../utils/format";

export default function ExperiencesPage() {
  const { data: experiences, loading, error, reload } = useAsyncData(() => experienceApi.list());

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Experiences</h1>
        <p className="mt-1 text-sm text-slate-400">Every interview, assessment, and reflection you've logged.</p>
      </div>

      {experiences && experiences.length === 0 && (
        <EmptyState
          icon={<MessageSquare size={32} />}
          title="No experiences recorded yet"
          description="Complete a round on an application to record your interview experience."
        />
      )}

      {experiences && experiences.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <Link key={exp.id} to={`/experiences/${exp.id}`}>
              <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md">
                <div>
                  <p className="font-semibold text-slate-900">
                    {exp.round?.application?.company?.name} — {exp.round?.title}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(exp.createdAt)}</p>
                </div>
                {exp.summary && <p className="line-clamp-2 text-sm text-slate-500">{exp.summary}</p>}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  {exp.confidence !== null && (
                    <Badge className="bg-primary-50 text-primary-700">Confidence {exp.confidence}/10</Badge>
                  )}
                  {exp.questions && <Badge className="bg-slate-100 text-slate-600">{exp.questions.length} questions</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

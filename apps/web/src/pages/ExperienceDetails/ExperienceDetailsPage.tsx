import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import clsx from "clsx";
import { useAsyncData } from "../../hooks/useAsyncData";
import { experienceApi } from "../../services/api/experienceApi";
import { questionApi } from "../../services/api/questionApi";
import { learningApi } from "../../services/api/learningApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { formatDateTime, titleCase } from "../../utils/format";
import { QuestionFormModal } from "../../features/questions/QuestionFormModal";

const TABS = ["Overview", "Questions", "My Performance", "Learnings", "Notes"] as const;
type Tab = (typeof TABS)[number];

const performanceStyles: Record<string, string> = {
  POOR: "bg-red-50 text-red-600",
  AVERAGE: "bg-amber-50 text-amber-700",
  GOOD: "bg-emerald-50 text-emerald-700",
  EXCELLENT: "bg-primary-100 text-primary-700",
};

export default function ExperienceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("Overview");
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const { data: experience, loading, error, reload } = useAsyncData(() => experienceApi.get(id!), [id]);
  const { data: learnings, reload: reloadLearnings } = useAsyncData(() => learningApi.list(), []);

  async function handleAddQuestion(input: any) {
    await questionApi.create(id!, input);
    showToast("Question added");
    reload();
  }

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!experience) return null;

  const relatedLearnings = (learnings ?? []).filter(
    (l) => l.sourceType === "ROUND" && l.sourceId === experience.round?.id
  );

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/experiences")}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Back to Experiences
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {experience.round?.application?.company?.name} — {experience.round?.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{formatDateTime(experience.round?.scheduledAt)}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
            <p className="whitespace-pre-line text-sm text-slate-600">{experience.summary || "No summary added."}</p>
            {experience.confidence !== null && (
              <p className="mt-4 text-sm text-slate-500">
                Overall Confidence <span className="font-semibold text-slate-800">{experience.confidence} / 10</span>
              </p>
            )}
            {experience.topicsCovered.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {experience.topicsCovered.map((t) => (
                  <Badge key={t} className="bg-slate-100 text-slate-600">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">What went well?</h3>
            <p className="whitespace-pre-line text-sm text-slate-600">{experience.whatWentWell || "—"}</p>
          </Card>
          <Card className="p-5 md:col-span-2">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              What could be improved?
            </h3>
            <p className="whitespace-pre-line text-sm text-slate-600">{experience.whatWentBadly || "—"}</p>
          </Card>
          {experience.overallReflection && (
            <Card className="border-primary-100 bg-primary-50/40 p-5 md:col-span-2">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-700">Key Takeaways</h3>
              <p className="whitespace-pre-line text-sm text-slate-700">{experience.overallReflection}</p>
            </Card>
          )}
        </div>
      )}

      {tab === "Questions" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Questions Asked</h3>
            <Button size="sm" onClick={() => setQuestionModalOpen(true)}>
              <Plus size={14} /> Add Question
            </Button>
          </div>
          {!experience.questions || experience.questions.length === 0 ? (
            <EmptyState title="No questions recorded yet" />
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {experience.questions.map((q) => (
                <div key={q.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{q.question}</p>
                    {q.performance && (
                      <Badge className={clsx("shrink-0", performanceStyles[q.performance])}>
                        {titleCase(q.performance)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="bg-slate-100 text-slate-600">{titleCase(q.category)}</Badge>
                    {q.topic && <Badge className="bg-slate-100 text-slate-600">{q.topic}</Badge>}
                    {q.difficulty && <Badge className="bg-slate-100 text-slate-600">{titleCase(q.difficulty)}</Badge>}
                  </div>
                  {q.notes && <p className="text-xs text-slate-500">{q.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "My Performance" && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Performance Breakdown</h3>
          {!experience.questions || experience.questions.length === 0 ? (
            <EmptyState title="No questions recorded yet to derive performance from." />
          ) : (
            <div className="flex flex-col gap-2">
              {experience.questions.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5">
                  <span className="text-sm text-slate-700">{q.question}</span>
                  <Badge className={q.performance ? performanceStyles[q.performance] : "bg-slate-100 text-slate-500"}>
                    {q.performance ? titleCase(q.performance) : "Not rated"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "Learnings" && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Linked Learnings</h3>
            <Button size="sm" variant="secondary" onClick={() => navigate("/learnings")}>
              Manage Learnings
            </Button>
          </div>
          {relatedLearnings.length === 0 ? (
            <EmptyState title="No learnings linked to this round yet" description="Add a learning from the Learnings page and set its source to this round." />
          ) : (
            <div className="flex flex-col gap-2">
              {relatedLearnings.map((l) => (
                <div key={l.id} className="rounded-lg border border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{l.title}</p>
                  {l.description && <p className="mt-1 text-xs text-slate-500">{l.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "Notes" && (
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h3>
          <p className="whitespace-pre-line text-sm text-slate-600">{experience.round?.notes || "No notes added for this round."}</p>
        </Card>
      )}

      <QuestionFormModal open={questionModalOpen} onClose={() => setQuestionModalOpen(false)} onSubmit={handleAddQuestion} />
    </div>
  );
}

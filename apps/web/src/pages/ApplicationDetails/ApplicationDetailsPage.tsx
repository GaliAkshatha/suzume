import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { applicationApi } from "../../services/api/applicationApi";
import { roundApi } from "../../services/api/roundApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Timeline } from "../../components/timeline/Timeline";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { applicationStatusStyles } from "../../utils/statusStyles";
import { formatDate, formatCurrency, titleCase } from "../../utils/format";
import { RoundFormModal } from "../../features/rounds/RoundFormModal";

export default function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: application, loading, error, reload } = useAsyncData(
    () => applicationApi.get(id!),
    [id]
  );

  async function handleAddRound(input: any) {
    await roundApi.create(id!, input);
    showToast("Round added");
    reload();
  }

  async function handleCompleteRound(roundId: string) {
    await roundApi.update(roundId, { status: "COMPLETED" });
    showToast("Round marked as completed");
    reload();
  }

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!application) return null;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/applications")}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Back to Applications
      </button>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{application.company?.name}</h1>
            <Badge className={applicationStatusStyles[application.status]}>{titleCase(application.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{application.role}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Round
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <Detail label="Company" value={application.company?.name} />
            <Detail label="Role" value={application.role} />
            <Detail label="Location" value={application.location ?? "—"} />
            <Detail label="Stipend" value={application.stipend ? `${formatCurrency(application.stipend)} / month` : "—"} />
            <Detail label="PPO" value={application.ppoType === "NONE" ? "No" : titleCase(application.ppoType)} />
            <Detail label="CTC (Full-time)" value={application.ctc ? formatCurrency(application.ctc) : "—"} />
            <Detail label="Applied On" value={formatDate(application.applicationDate)} />
            <Detail label="Status" value={titleCase(application.status)} />
          </dl>
          {application.notes && (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
              <p className="text-sm text-slate-600">{application.notes}</p>
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recruitment Timeline
          </h2>
          {!application.rounds || application.rounds.length === 0 ? (
            <EmptyState
              title="No rounds added yet"
              description="Add rounds as they get scheduled to build out the recruitment timeline."
              action={
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Add Round
                </Button>
              }
            />
          ) : (
            <Timeline rounds={application.rounds} onComplete={handleCompleteRound} />
          )}
        </Card>
      </div>

      <RoundFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddRound} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

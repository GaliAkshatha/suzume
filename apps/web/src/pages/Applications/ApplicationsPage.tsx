import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { applicationApi } from "../../services/api/applicationApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { applicationStatusStyles } from "../../utils/statusStyles";
import { formatDate, formatCurrency, titleCase } from "../../utils/format";
import { ApplicationFormModal } from "../../features/applications/ApplicationFormModal";

export default function ApplicationsPage() {
  const { data: applications, loading, error, reload } = useAsyncData(() => applicationApi.list());
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreate(input: any) {
    await applicationApi.create(input);
    showToast("Application added");
    reload();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete application to ${name}? This cannot be undone.`)) return;
    await applicationApi.remove(id);
    showToast("Application deleted");
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="mt-1 text-sm text-slate-400">Track every company you're pursuing.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Application
        </Button>
      </div>

      {loading && <PageSpinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && applications && applications.length === 0 && (
        <EmptyState
          icon={<Briefcase size={32} />}
          title="No applications yet"
          description="Add your first application to start tracking your placement journey."
          action={
            <Button onClick={() => setModalOpen(true)} size="sm">
              <Plus size={14} /> Add Application
            </Button>
          }
        />
      )}

      {!loading && !error && applications && applications.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/applications/${app.id}`} className="font-semibold text-slate-900 hover:text-primary-600">
                    {app.company?.name}
                  </Link>
                  <p className="text-sm text-slate-500">{app.role}</p>
                </div>
                <button
                  onClick={() => handleDelete(app.id, app.company?.name ?? "")}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete application"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <Badge className={`w-fit ${applicationStatusStyles[app.status]}`}>{titleCase(app.status)}</Badge>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>{app.location ?? "—"}</span>
                <span className="text-right">{app.rounds?.length ?? 0} round(s)</span>
                <span>Applied {formatDate(app.applicationDate)}</span>
                <span className="text-right">
                  {app.internship ? "Internship" : "Full-time"}
                  {app.ppoType && app.ppoType !== "NONE" ? ` · ${titleCase(app.ppoType)}` : ""}
                </span>
              </div>

              {(app.stipend || app.ctc) && (
                <div className="border-t border-slate-100 pt-2 text-xs text-slate-500">
                  {app.stipend && <span>Stipend {formatCurrency(app.stipend)}/mo</span>}
                  {app.stipend && app.ctc && <span> · </span>}
                  {app.ctc && <span>CTC {formatCurrency(app.ctc)}</span>}
                </div>
              )}

              <Link
                to={`/applications/${app.id}`}
                className="mt-1 text-sm font-medium text-primary-600 hover:underline"
              >
                View timeline →
              </Link>
            </Card>
          ))}
        </div>
      )}

      <ApplicationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        onCreated={reload}
      />
    </div>
  );
}

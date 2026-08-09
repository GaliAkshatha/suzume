import { useState } from "react";
import { Plus, CheckSquare, Square, Lightbulb } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { learningApi } from "../../services/api/learningApi";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { priorityStyles } from "../../utils/statusStyles";
import { titleCase } from "../../utils/format";
import { LearningFormModal } from "../../features/learnings/LearningFormModal";
import { LEARNING_CATEGORIES } from "@suzume/shared-types";

export default function LearningsPage() {
  const [category, setCategory] = useState<string>("");
  const { data: learnings, loading, error, reload } = useAsyncData(
    () => learningApi.list(category || undefined),
    [category]
  );
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({});

  async function handleCreate(input: any) {
    await learningApi.create(input);
    showToast("Learning added");
    reload();
  }

  async function handleAddAction(learningId: string) {
    const title = actionInputs[learningId]?.trim();
    if (!title) return;
    await learningApi.addActionItem(learningId, { title, status: "PENDING" });
    setActionInputs((prev) => ({ ...prev, [learningId]: "" }));
    showToast("Action item added");
    reload();
  }

  async function toggleAction(actionId: string, done: boolean) {
    await learningApi.updateActionItem(actionId, { status: done ? "PENDING" : "DONE" });
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learnings &amp; Lessons</h1>
          <p className="mt-1 text-sm text-slate-400">Capture takeaways and turn them into action.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-40">
            <option value="">All</option>
            {LEARNING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </Select>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add Lesson
          </Button>
        </div>
      </div>

      {loading && <PageSpinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && learnings && learnings.length === 0 && (
        <EmptyState icon={<Lightbulb size={32} />} title="No learnings recorded yet" />
      )}

      {!loading && !error && learnings && learnings.length > 0 && (
        <div className="flex flex-col gap-4">
          {learnings.map((learning) => (
            <Card key={learning.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{learning.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-slate-100 text-slate-600">{titleCase(learning.category)}</Badge>
                    <Badge className={priorityStyles[learning.priority]}>{learning.priority}</Badge>
                  </div>
                </div>
              </div>

              {learning.sourceLabel && (
                <p className="mt-3 text-xs font-medium text-slate-400">Source: {learning.sourceLabel}</p>
              )}
              {learning.description && <p className="mt-2 text-sm text-slate-600">{learning.description}</p>}

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Action Items</p>
                <div className="flex flex-col gap-1.5">
                  {learning.actionItems?.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleAction(item.id, item.status === "DONE")}
                      className="flex items-center gap-2 text-left text-sm"
                    >
                      {item.status === "DONE" ? (
                        <CheckSquare size={16} className="shrink-0 text-emerald-500" />
                      ) : (
                        <Square size={16} className="shrink-0 text-slate-300" />
                      )}
                      <span className={item.status === "DONE" ? "text-slate-400 line-through" : "text-slate-700"}>
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={actionInputs[learning.id] ?? ""}
                    onChange={(e) => setActionInputs((prev) => ({ ...prev, [learning.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAction(learning.id)}
                    placeholder="Add an action item…"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <Button size="sm" variant="secondary" onClick={() => handleAddAction(learning.id)}>
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <LearningFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}

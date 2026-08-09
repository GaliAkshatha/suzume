import { FormEvent, useRef, useState } from "react";
import { BookOpen, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { preparationApi } from "../../services/api/preparationApi";
import { Card } from "../../components/ui/Card";
import { CircularProgress } from "../../components/ui/CircularProgress";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { formatDate } from "../../utils/format";
import { ApiError } from "../../services/api/client";
import { PreparationLogFormModal } from "../../features/preparation/PreparationLogFormModal";
import { PreparationSourcesCard } from "../../features/preparation/PreparationSourcesCard";
import { StudyHeatmap } from "../../components/charts/StudyHeatmap";
import { StudyCalendar } from "../../components/charts/StudyCalendar";

const TOPIC_COLORS: Record<string, string> = {
  DSA: "#7c3aed",
  DBMS: "#3b82f6",
  OS: "#f59e0b",
  SYSTEM_DESIGN: "#8b5cf6",
  SQL: "#10b981",
  CN: "#0ea5e9",
};
const CUSTOM_TOPIC_COLOR = "#ec4899";

function relativeDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const diffDays = Math.round((today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1) return `${diffDays} days ago`;
  return formatDate(iso);
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function PreparationPage() {
  const { data: preparation, loading, error, reload } = useAsyncData(() => preparationApi.list());
  const { showToast } = useToast();
  const [editing, setEditing] = useState<(typeof preparation extends (infer U)[] | null ? U : never) | null>(null);
  const [solved, setSolved] = useState("");
  const [total, setTotal] = useState("");
  const [confidence, setConfidence] = useState("");
  const [saving, setSaving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: logs, loading: logsLoading, error: logsError, reload: reloadLogs } = useAsyncData(
    () => preparationApi.listLogs(),
    []
  );
  const { data: activity, reload: reloadActivity } = useAsyncData(() => preparationApi.activity(), []);
  const { data: sources, reload: reloadSources } = useAsyncData(() => preparationApi.listSources(), []);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<(typeof logs extends (infer U)[] | null ? U : never) | null>(null);

  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const dailyTrackerRef = useRef<HTMLDivElement>(null);

  function reloadAll() {
    reload();
    reloadLogs();
    reloadActivity();
  }

  function openEdit(item: any) {
    setEditing(item);
    setSolved(String(item.questionsSolved));
    setTotal(String(item.questionsTotal));
    setConfidence(String(item.confidence));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await preparationApi.update((editing as any).topicId, {
        questionsSolved: Number(solved) || 0,
        questionsTotal: Number(total) || 0,
        confidence: Math.min(100, Math.max(0, Number(confidence) || 0)),
        lastPracticed: new Date().toISOString(),
      });
      showToast("Preparation updated");
      setEditing(null);
      reload();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTopic(e: FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!newTopicName.trim() || !newTopicCategory.trim()) {
      setAddError("Both a name and category are required.");
      return;
    }
    setAdding(true);
    try {
      await preparationApi.createTopic({ name: newTopicName.trim(), category: newTopicCategory.trim() });
      showToast("Topic added");
      setNewTopicName("");
      setNewTopicCategory("");
      setAddModalOpen(false);
      reload();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Unable to add topic.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteTopic(e: React.MouseEvent, topicId: string, name: string) {
    e.stopPropagation();
    if (!confirm(`Remove "${name}" from your preparation topics? Any progress recorded for it will be lost.`)) return;
    try {
      await preparationApi.deleteTopic(topicId);
      showToast("Topic removed");
      reload();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Unable to remove topic.", "error");
    }
  }

  async function handleSaveLog(input: any) {
    if (editingLog) {
      await preparationApi.updateLog(editingLog.id, input);
      showToast("Log entry updated");
    } else {
      await preparationApi.createLog(input);
      showToast("Log entry added");
    }
    setEditingLog(null);
    reloadAll();
  }

  async function handleDeleteLog(id: string) {
    if (!confirm("Delete this log entry?")) return;
    try {
      await preparationApi.deleteLog(id);
      showToast("Log entry deleted");
      reloadAll();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Unable to delete log entry.", "error");
    }
  }

  function focusTopicInTracker(topicId: string) {
    setTopicFilter(topicId);
    dailyTrackerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleLogs = (logs ?? []).filter((l) => !topicFilter || l.topicId === topicFilter);
  const selectedDayLogs = selectedDay ? (logs ?? []).filter((l) => l.date.slice(0, 10) === selectedDay) : [];

  const weeklyMinutesByTopic = new Map<string, number>();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const log of logs ?? []) {
    if (!log.topicId || new Date(log.date).getTime() < weekAgo) continue;
    weeklyMinutesByTopic.set(log.topicId, (weeklyMinutesByTopic.get(log.topicId) ?? 0) + (log.durationMinutes ?? 0));
  }

  const leetcodeSource = (sources ?? []).find((s) => s.provider === "leetcode" && s.metrics);

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Preparation Tracker</h1>
          <p className="mt-1 text-sm text-slate-400">Track your progress across every topic.</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus size={16} /> Add Topic
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {(preparation ?? []).map((item) => {
          const percent =
            item.questionsTotal > 0
              ? Math.round((item.questionsSolved / item.questionsTotal) * 100)
              : item.confidence;
          const isCustom = item.topic?.isCustom;
          const isDsa = item.topic?.name?.toUpperCase() === "DSA";
          const weeklyMinutes = weeklyMinutesByTopic.get(item.topicId) ?? 0;
          return (
            <Card
              key={item.topicId}
              className="group relative flex cursor-pointer flex-col items-center gap-2 p-5 transition-shadow hover:shadow-md"
              onClick={() => openEdit(item)}
            >
              {isCustom && (
                <button
                  onClick={(e) => handleDeleteTopic(e, item.topicId, item.topic?.name ?? "")}
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-300 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Remove topic"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <CircularProgress
                percent={percent}
                color={TOPIC_COLORS[item.topic?.category ?? ""] ?? (isCustom ? CUSTOM_TOPIC_COLOR : "#7c3aed")}
              />
              <p className="text-sm font-semibold text-slate-800">{item.topic?.name}</p>
              <p className="text-xs text-slate-400">
                {item.questionsSolved} / {item.questionsTotal} solved
              </p>
              {item.initialLevel !== null && (
                <p className="text-[11px] text-slate-300">Started at {item.initialLevel}%</p>
              )}
              {weeklyMinutes > 0 && (
                <p className="text-[11px] font-medium text-primary-600">{formatMinutes(weeklyMinutes)} this week</p>
              )}
              {isDsa && leetcodeSource?.metrics && (
                <p className="text-[11px] text-slate-400">{leetcodeSource.metrics.totalSolved} LeetCode</p>
              )}
            </Card>
          );
        })}
      </div>

      <PreparationSourcesCard sources={sources ?? []} onChanged={reloadSources} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Topics</h2>
          {!activity || activity.recentTopics.length === 0 ? (
            <EmptyState
              icon={<Clock size={28} />}
              title="No topics studied yet"
              description="Your recently studied topics will appear here."
            />
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {activity.recentTopics.map((t) => (
                <button
                  key={t.topicId}
                  onClick={() => focusTopicInTracker(t.topicId)}
                  className="flex items-center justify-between py-3 text-left first:pt-0 last:pb-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.topicName}</p>
                    <p className="text-xs text-slate-400">Last studied: {relativeDayLabel(t.lastStudied)}</p>
                  </div>
                  <span className="text-xs font-medium text-primary-600">
                    {formatMinutes(t.minutes)} · {t.questionsSolved} questions
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Study Calendar</h2>
          <StudyCalendar days={activity?.days ?? []} onSelectDay={setSelectedDay} />
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Study Activity</h2>
        <StudyHeatmap days={activity?.days ?? []} onSelectDay={setSelectedDay} />
      </Card>

      <div ref={dailyTrackerRef}>
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Daily Tracker</h2>
          <div className="flex items-center gap-2">
            {topicFilter && (
              <button
                onClick={() => setTopicFilter(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Clear filter ×
              </button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setEditingLog(null);
                setLogModalOpen(true);
              }}
            >
              <Plus size={14} /> Add Log Entry
            </Button>
          </div>
        </div>

        {logsLoading && <PageSpinner />}
        {logsError && <ErrorState message={logsError} onRetry={reloadLogs} />}

        {!logsLoading && !logsError && visibleLogs.length === 0 && (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No entries yet"
            description="Log what you studied today — topic, questions solved, time spent, and any revision notes."
          />
        )}

        {!logsLoading && !logsError && visibleLogs.length > 0 && (
          <div className="flex flex-col divide-y divide-slate-100">
            {visibleLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{formatDate(log.date)}</span>
                    {log.topic && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {log.topic.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{log.questionsSolved} question(s) solved</span>
                    {log.durationMinutes !== null && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {log.durationMinutes} min
                      </span>
                    )}
                  </div>
                  {log.notes && <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{log.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditingLog(log);
                      setLogModalOpen(true);
                    }}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Edit entry"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Update ${(editing as any)?.topic?.name ?? ""}`}>
        <div className="flex flex-col gap-4">
          {editing && (editing as any).initialLevel !== null && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">Initial preparation</span>
              <span className="font-semibold text-slate-700">{(editing as any).initialLevel}%</span>
            </div>
          )}
          {editing && (editing as any).topic?.name?.toUpperCase() === "DSA" && leetcodeSource?.metrics && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-medium text-slate-700">LeetCode activity</p>
              <p className="mt-1 text-slate-500">
                {leetcodeSource.metrics.totalSolved} solved · {leetcodeSource.metrics.easySolved} Easy ·{" "}
                {leetcodeSource.metrics.mediumSolved} Medium · {leetcodeSource.metrics.hardSolved} Hard
              </p>
            </div>
          )}
          <Input label="Questions Solved" type="number" value={solved} onChange={(e) => setSolved(e.target.value)} />
          <Input label="Questions Total" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
          <Input
            label="Confidence (0-100)"
            type="number"
            min={0}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Preparation Topic">
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
          <Input
            label="Topic Name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="e.g. Kubernetes, Aptitude, GATE CS"
          />
          <Input
            label="Category"
            value={newTopicCategory}
            onChange={(e) => setNewTopicCategory(e.target.value)}
            placeholder="e.g. DevOps, Aptitude, CS Fundamentals"
          />
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding…" : "Add Topic"}
            </Button>
          </div>
        </form>
      </Modal>

      <PreparationLogFormModal
        open={logModalOpen}
        onClose={() => {
          setLogModalOpen(false);
          setEditingLog(null);
        }}
        onSubmit={handleSaveLog}
        topics={preparation ?? []}
        initial={editingLog}
      />

      <Modal
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatDate(selectedDay) : ""}
      >
        {selectedDayLogs.length === 0 ? (
          <EmptyState title="No logs for this day" />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {selectedDayLogs.map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  {log.topic && (
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {log.topic.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {log.questionsSolved} questions
                    {log.durationMinutes !== null ? ` · ${formatMinutes(log.durationMinutes)}` : ""}
                  </span>
                </div>
                {log.notes && <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

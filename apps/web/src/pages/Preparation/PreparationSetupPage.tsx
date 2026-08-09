import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PreparationProgress } from "@suzume/shared-types";
import { useAsyncData } from "../../hooks/useAsyncData";
import { preparationApi } from "../../services/api/preparationApi";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { ApiError } from "../../services/api/client";

export default function PreparationSetupPage() {
  const navigate = useNavigate();
  const { data: preparation, loading, error, reload } = useAsyncData(() => preparationApi.list());
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [newSubject, setNewSubject] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [extraTopics, setExtraTopics] = useState<PreparationProgress[]>([]);

  const topics = [...(preparation ?? []), ...extraTopics];

  function levelFor(topicId: string) {
    return levels[topicId] ?? 0;
  }

  async function handleAddSubject() {
    const name = newSubject.trim();
    if (!name) return;
    setAdding(true);
    setFormError(null);
    try {
      const topic = await preparationApi.createTopic({ name, category: "CUSTOM" });
      setExtraTopics((prev) => [...prev, { topicId: topic.id, topic } as PreparationProgress]);
      setNewSubject("");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to add subject.");
    } finally {
      setAdding(false);
    }
  }

  async function handleSave(skipped: boolean) {
    setSaving(true);
    setFormError(null);
    try {
      await preparationApi.setup({
        skipped,
        levels: skipped
          ? []
          : topics.map((t) => ({ topicId: t.topicId, level: levelFor(t.topicId) })),
      });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to save setup.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7f7fb] px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Let's set up your preparation</h1>
          <p className="mt-2 text-sm text-slate-500">Tell Suzume where you are starting from.</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-5">
            {topics.map((t) => (
              <div key={t.topicId}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{t.topic?.name}</span>
                  <span className="text-sm font-semibold text-primary-600">{levelFor(t.topicId)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={levelFor(t.topicId)}
                  onChange={(e) => setLevels((prev) => ({ ...prev, [t.topicId]: Number(e.target.value) }))}
                  className="w-full accent-primary-600"
                />
              </div>
            ))}

            <div className="flex items-end gap-2 border-t border-slate-100 pt-4">
              <Input
                label="Add Subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. React, Aptitude, Machine Learning"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddSubject} disabled={adding || !newSubject.trim()}>
                {adding ? "Adding…" : "+ Add"}
              </Button>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="mt-2 flex justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => handleSave(true)} disabled={saving}>
                Skip for now
              </Button>
              <Button type="button" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? "Saving…" : "Save & Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

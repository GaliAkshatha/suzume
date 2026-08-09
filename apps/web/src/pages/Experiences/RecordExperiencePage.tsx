import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createExperienceSchema } from "@suzume/validation";
import { experienceApi } from "../../services/api/experienceApi";
import { roundApi } from "../../services/api/roundApi";
import { useAsyncData } from "../../hooks/useAsyncData";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/feedback/Spinner";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useToast } from "../../components/feedback/Toast";
import { ApiError } from "../../services/api/client";

export default function RecordExperiencePage() {
  const [params] = useSearchParams();
  const roundId = params.get("roundId") ?? "";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: round, loading, error } = useAsyncData(() => roundApi.get(roundId), [roundId]);

  const [summary, setSummary] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatWentBadly, setWhatWentBadly] = useState("");
  const [confidence, setConfidence] = useState("7");
  const [overallReflection, setOverallReflection] = useState("");
  const [topicsCovered, setTopicsCovered] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const payload = {
      summary: summary || undefined,
      whatWentWell: whatWentWell || undefined,
      whatWentBadly: whatWentBadly || undefined,
      confidence: confidence ? Number(confidence) : null,
      overallReflection: overallReflection || undefined,
      topicsCovered: topicsCovered
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = createExperienceSchema.safeParse(payload);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setSubmitting(true);
    try {
      const experience = await experienceApi.create(roundId, result.data);
      showToast("Experience recorded");
      navigate(`/experiences/${experience.id}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to record experience.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!roundId) return <ErrorState message="Missing round reference. Go back and try again." />;
  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Experience</h1>
        <p className="mt-1 text-sm text-slate-400">
          {round?.application?.company?.name} — {round?.title}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea label="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Brief overview of the round" />
          <Textarea label="What went well?" value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} rows={3} />
          <Textarea label="What could be improved?" value={whatWentBadly} onChange={(e) => setWhatWentBadly(e.target.value)} rows={3} />
          <Input
            label="Confidence (1-10)"
            type="number"
            min={1}
            max={10}
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          />
          <Input
            label="Topics Covered (comma separated)"
            value={topicsCovered}
            onChange={(e) => setTopicsCovered(e.target.value)}
            placeholder="DSA, SQL, OOP"
          />
          <Textarea
            label="Key Takeaways"
            value={overallReflection}
            onChange={(e) => setOverallReflection(e.target.value)}
            rows={3}
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Experience"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

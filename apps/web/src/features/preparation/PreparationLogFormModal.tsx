import { FormEvent, useState } from "react";
import { PreparationProgress } from "@suzume/shared-types";
import { createPreparationLogSchema } from "@suzume/validation";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../services/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: any) => Promise<void>;
  topics: PreparationProgress[];
  initial?: {
    id: string;
    topicId: string | null;
    date: string;
    questionsSolved: number;
    durationMinutes: number | null;
    notes: string | null;
  } | null;
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function PreparationLogFormModal({ open, onClose, onSubmit, topics, initial }: Props) {
  const [topicId, setTopicId] = useState(initial?.topicId ?? "");
  const [date, setDate] = useState(initial ? toDateInput(initial.date) : toDateInput(new Date().toISOString()));
  const [questionsSolved, setQuestionsSolved] = useState(String(initial?.questionsSolved ?? 0));
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      topicId: topicId || null,
      date: new Date(date).toISOString(),
      questionsSolved: Number(questionsSolved) || 0,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      notes: notes || undefined,
    };

    const result = createPreparationLogSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save log entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Log Entry" : "Add Daily Log Entry"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select label="Topic" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            <option value="">General / Unspecified</option>
            {topics.map((t) => (
              <option key={t.topicId} value={t.topicId}>
                {t.topic?.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Questions Solved"
            type="number"
            min={0}
            value={questionsSolved}
            onChange={(e) => setQuestionsSolved(e.target.value)}
          />
          <Input
            label="Time Spent (minutes)"
            type="number"
            min={0}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>
        <Textarea
          label="Notes / Revision Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="What did you work on? Anything to revisit later?"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : initial ? "Save Changes" : "Add Entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

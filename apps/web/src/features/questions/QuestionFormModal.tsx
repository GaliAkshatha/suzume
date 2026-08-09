import { FormEvent, useState } from "react";
import { DIFFICULTIES, PERFORMANCES, QUESTION_CATEGORIES } from "@suzume/shared-types";
import { createQuestionSchema } from "@suzume/validation";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { titleCase } from "../../utils/format";
import { ApiError } from "../../services/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: any) => Promise<void>;
}

export function QuestionFormModal({ open, onClose, onSubmit }: Props) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState(QUESTION_CATEGORIES[0]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [performance, setPerformance] = useState(PERFORMANCES[2]);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload = { question, category, topic: topic || undefined, difficulty, performance, notes: notes || undefined };
    const result = createQuestionSchema.safeParse(payload);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(result.data);
      setQuestion("");
      setTopic("");
      setNotes("");
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to add question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Question">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {QUESTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </Select>
          <Input label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. HashMap" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {titleCase(d)}
              </option>
            ))}
          </Select>
          <Select label="Performance" value={performance} onChange={(e) => setPerformance(e.target.value as any)}>
            {PERFORMANCES.map((p) => (
              <option key={p} value={p}>
                {titleCase(p)}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

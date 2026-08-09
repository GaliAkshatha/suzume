import { FormEvent, useState } from "react";
import { ROUND_MODES, ROUND_STATUSES, ROUND_TYPES } from "@suzume/shared-types";
import { createRoundSchema } from "@suzume/validation";
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

export function RoundFormModal({ open, onClose, onSubmit }: Props) {
  const [type, setType] = useState(ROUND_TYPES[2]);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState(ROUND_MODES[0]);
  const [status, setStatus] = useState(ROUND_STATUSES[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload = {
      type,
      title,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      duration: duration ? Number(duration) : null,
      mode,
      status,
      notes: notes || undefined,
    };
    const result = createRoundSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSubmit(result.data);
      setTitle("");
      setScheduledAt("");
      setDuration("");
      setNotes("");
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to add round.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Round">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="Round Type" value={type} onChange={(e) => setType(e.target.value as any)}>
          {ROUND_TYPES.map((t) => (
            <option key={t} value={t}>
              {titleCase(t)}
            </option>
          ))}
        </Select>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Technical Interview 1" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Scheduled At" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          <Input label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            {ROUND_MODES.map((m) => (
              <option key={m} value={m}>
                {titleCase(m)}
              </option>
            ))}
          </Select>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {ROUND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add Round"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

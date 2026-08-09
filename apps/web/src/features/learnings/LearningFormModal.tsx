import { FormEvent, useState } from "react";
import { LEARNING_CATEGORIES, LEARNING_PRIORITIES } from "@suzume/shared-types";
import { createLearningSchema } from "@suzume/validation";
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

export function LearningFormModal({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(LEARNING_CATEGORIES[0]);
  const [priority, setPriority] = useState(LEARNING_PRIORITIES[1]);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload = { title, description: description || undefined, category, priority };
    const result = createLearningSchema.safeParse(payload);
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(result.data);
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to add learning.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Learning">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Explain Approach Before Coding" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {LEARNING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </Select>
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            {LEARNING_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {titleCase(p)}
              </option>
            ))}
          </Select>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add Learning"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

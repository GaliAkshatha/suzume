import { FormEvent, useState } from "react";
import { APPLICATION_STATUSES, Application, PPO_TYPES } from "@suzume/shared-types";
import { createApplicationSchema } from "@suzume/validation";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { titleCase } from "../../utils/format";
import { ApiError } from "../../services/api/client";

interface Props {
  onSubmit: (input: any) => Promise<void>;
  onCancel: () => void;
  initial?: Application | null;
  prefill?: Partial<{
    companyName: string;
    role: string;
    location: string;
    applicationDate: string;
    deadline: string;
    internship: boolean;
    ppoType: string;
    stipend: string;
    ctc: string;
    status: string;
    notes: string;
  }>;
}

function toDateTimeLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ManualApplicationForm({ onSubmit, onCancel, initial, prefill }: Props) {
  const [companyName, setCompanyName] = useState(prefill?.companyName ?? initial?.company?.name ?? "");
  const [role, setRole] = useState(prefill?.role ?? initial?.role ?? "");
  const [location, setLocation] = useState(prefill?.location ?? initial?.location ?? "");
  const [applicationDate, setApplicationDate] = useState(
    prefill?.applicationDate ? toDateTimeLocal(prefill.applicationDate) : toDateTimeLocal(initial?.applicationDate)
  );
  const [deadline, setDeadline] = useState(
    prefill?.deadline ? toDateTimeLocal(prefill.deadline) : toDateTimeLocal(initial?.deadline)
  );
  const [internship, setInternship] = useState(prefill?.internship ?? initial?.internship ?? false);
  const [ppoType, setPpoType] = useState(prefill?.ppoType ?? initial?.ppoType ?? "NONE");
  const [stipend, setStipend] = useState(prefill?.stipend ?? initial?.stipend?.toString() ?? "");
  const [ctc, setCtc] = useState(prefill?.ctc ?? initial?.ctc?.toString() ?? "");
  const [status, setStatus] = useState(prefill?.status ?? initial?.status ?? "INTERESTED");
  const [notes, setNotes] = useState(prefill?.notes ?? initial?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const payload = {
      companyName,
      role,
      location: location || undefined,
      applicationDate: applicationDate ? new Date(applicationDate).toISOString() : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      internship,
      ppoType,
      stipend: stipend ? Number(stipend) : null,
      ctc: ctc ? Number(ctc) : null,
      status,
      notes: notes || undefined,
    };

    const result = createApplicationSchema.safeParse(payload);
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
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to save application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.companyName} />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} error={errors.role} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Application Date"
          type="datetime-local"
          value={applicationDate}
          onChange={(e) => setApplicationDate(e.target.value)}
        />
        <Input label="Deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Stipend (₹/month)" type="number" value={stipend} onChange={(e) => setStipend(e.target.value)} />
        <Input label="CTC (₹/year)" type="number" value={ctc} onChange={(e) => setCtc(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={internship} onChange={(e) => setInternship(e.target.checked)} className="rounded" />
          Internship
        </label>
        <Select label="PPO" value={ppoType} onChange={(e) => setPpoType(e.target.value)}>
          {PPO_TYPES.map((p) => (
            <option key={p} value={p}>
              {p === "NONE" ? "No PPO" : titleCase(p)}
            </option>
          ))}
        </Select>
      </div>
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : initial ? "Save Changes" : "Add Application"}
        </Button>
      </div>
    </form>
  );
}

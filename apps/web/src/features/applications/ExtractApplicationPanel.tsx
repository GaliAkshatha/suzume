import { useState } from "react";
import { ClipboardPaste, Sparkles, AlertTriangle } from "lucide-react";
import { ExtractionResult, ROUND_MODES, ROUND_TYPES, APPLICATION_STATUSES, PPO_TYPES } from "@suzume/shared-types";
import { extractionApi } from "../../services/api/extractionApi";
import { applicationApi } from "../../services/api/applicationApi";
import { roundApi } from "../../services/api/roundApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useToast } from "../../components/feedback/Toast";
import { ApiError } from "../../services/api/client";
import { titleCase } from "../../utils/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Step = "input" | "loading" | "review" | "error";

export function ExtractApplicationPanel({ onCreated, onCancel }: Props) {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [useExistingId, setUseExistingId] = useState<string | null | "new">(null);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [internship, setInternship] = useState(false);
  const [ppoType, setPpoType] = useState("NONE");
  const [stipend, setStipend] = useState("");
  const [ctc, setCtc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applyStatusUpdate, setApplyStatusUpdate] = useState(true);
  const [status, setStatus] = useState<string>("INTERESTED");

  const [includeRound, setIncludeRound] = useState(true);
  const [roundType, setRoundType] = useState<string>(ROUND_TYPES[2]);
  const [roundTitle, setRoundTitle] = useState("");
  const [roundDate, setRoundDate] = useState("");
  const [roundDuration, setRoundDuration] = useState("");
  const [roundMode, setRoundMode] = useState<string>(ROUND_MODES[0]);

  async function handleExtract() {
    setStep("loading");
    try {
      const extraction = await extractionApi.parse(text);
      setResult(extraction);

      setCompanyName(extraction.company.value ?? "");
      setRole(extraction.role.value ?? "");
      setLocation(extraction.location.value ?? "");
      setInternship(extraction.internship.value ?? false);
      setPpoType(extraction.ppoType.value ?? "NONE");
      setStipend(extraction.stipend.value?.toString() ?? "");
      setCtc(extraction.ctc.value?.toString() ?? "");
      setDeadline(toDateTimeLocal(extraction.deadline.value));
      setStatus(extraction.statusSuggestion.value ?? "INTERESTED");
      setApplyStatusUpdate(!!extraction.statusSuggestion.value);

      setIncludeRound(!!extraction.round);
      if (extraction.round) {
        setRoundType(extraction.round.type);
        setRoundTitle(extraction.round.title);
        setRoundDate(toDateTimeLocal(extraction.round.scheduledAt));
        setRoundDuration(extraction.round.duration?.toString() ?? "");
        setRoundMode(extraction.round.mode ?? ROUND_MODES[0]);
      }

      setUseExistingId(extraction.matchedApplication ? extraction.matchedApplication.id : "new");
      setStep("review");
    } catch {
      setStep("error");
    }
  }

  async function handleConfirm() {
    if (!companyName.trim() || !role.trim()) {
      showToast("Company and role are required before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      let applicationId: string;

      if (useExistingId && useExistingId !== "new") {
        applicationId = useExistingId;
        if (applyStatusUpdate && status) {
          await applicationApi.update(applicationId, { status: status as any });
        }
      } else {
        const created = await applicationApi.create({
          companyName,
          role,
          location: location || undefined,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          internship,
          ppoType,
          stipend: stipend ? Number(stipend) : null,
          ctc: ctc ? Number(ctc) : null,
          status: status as any,
          source: "PASTED_TEXT",
        } as any);
        applicationId = created.id;
      }

      if (includeRound && roundTitle.trim()) {
        await roundApi.create(applicationId, {
          type: roundType as any,
          title: roundTitle,
          scheduledAt: roundDate ? new Date(roundDate).toISOString() : null,
          duration: roundDuration ? Number(roundDuration) : null,
          mode: roundMode as any,
          status: "UPCOMING",
          source: "PASTED_TEXT",
        } as any);
      }

      showToast("Application saved from pasted text");
      onCreated();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Unable to save extracted information.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (step === "input") {
    return (
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste a placement email, notice, job posting, or message to get started."
          className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
        {text.trim().length === 0 && (
          <EmptyState
            icon={<ClipboardPaste size={28} />}
            title="Nothing pasted yet"
            description="Paste a placement cell announcement, recruiter email, or interview notification above."
          />
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setText("")} disabled={!text}>
            Clear
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExtract} disabled={text.trim().length < 10}>
            <Sparkles size={15} /> Extract Information
          </Button>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Analyzing placement information…</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
          <AlertTriangle className="text-red-400" size={26} />
          <p className="text-sm font-medium text-red-700">
            We couldn't confidently extract the required information. You can enter it manually.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setStep("input")}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        Please verify the extracted information before saving. Nothing has been created yet.
      </div>

      {result?.matchedApplication && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3">
          <p className="text-sm font-medium text-primary-800">
            Existing {result.matchedApplication.companyName} application found ({result.matchedApplication.role}).
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setUseExistingId(result.matchedApplication!.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                useExistingId === result.matchedApplication.id
                  ? "bg-primary-600 text-white"
                  : "border border-primary-200 bg-white text-primary-700"
              }`}
            >
              Use Existing Application
            </button>
            <button
              type="button"
              onClick={() => setUseExistingId("new")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                useExistingId === "new"
                  ? "bg-primary-600 text-white"
                  : "border border-primary-200 bg-white text-primary-700"
              }`}
            >
              Create New Application
            </button>
          </div>
        </div>
      )}

      {!result?.matchedApplication && result && result.possibleDuplicates.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">Possible existing application</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {result.possibleDuplicates.map((dup) => (
              <button
                key={dup.id}
                type="button"
                onClick={() => setUseExistingId(dup.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs ${
                  useExistingId === dup.id ? "border-primary-400 bg-white" : "border-amber-200 bg-white/60"
                }`}
              >
                <span className="font-medium text-slate-700">
                  {dup.companyName} — {dup.role}
                </span>
                <span className="text-slate-400">{titleCase(dup.status)}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseExistingId("new")}
              className={`rounded-lg px-3 py-1.5 text-left text-xs font-medium ${
                useExistingId === "new" ? "bg-primary-600 text-white" : "border border-amber-200 bg-white text-amber-700"
              }`}
            >
              Create New Application Anyway
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Company</span>
            {result && <ConfidenceBadge confidence={result.company.confidence} />}
          </div>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Role</span>
            {result && <ConfidenceBadge confidence={result.role.confidence} />}
          </div>
          <Input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Location</span>
            {result && <ConfidenceBadge confidence={result.location.confidence} />}
          </div>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Deadline</span>
          <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Stipend (₹/month)</span>
            {result && <ConfidenceBadge confidence={result.stipend.confidence} />}
          </div>
          <Input type="number" value={stipend} onChange={(e) => setStipend(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">CTC (₹/year)</span>
            {result && <ConfidenceBadge confidence={result.ctc.confidence} />}
          </div>
          <Input type="number" value={ctc} onChange={(e) => setCtc(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={internship} onChange={(e) => setInternship(e.target.checked)} className="rounded" />
          Internship
        </label>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">PPO</span>
            {result && <ConfidenceBadge confidence={result.ppoType.confidence} />}
          </div>
          <Select value={ppoType} onChange={(e) => setPpoType(e.target.value)}>
            {PPO_TYPES.map((p) => (
              <option key={p} value={p}>
                {p === "NONE" ? "No PPO" : titleCase(p)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {result?.statusSuggestion.value && (
        <div className="flex flex-col gap-1 rounded-xl border border-slate-100 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={applyStatusUpdate}
              onChange={(e) => setApplyStatusUpdate(e.target.checked)}
              className="rounded"
            />
            Update status
            <ConfidenceBadge confidence={result.statusSuggestion.confidence} />
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!applyStatusUpdate}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="rounded-xl border border-slate-100 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={includeRound} onChange={(e) => setIncludeRound(e.target.checked)} className="rounded" />
          Add round
          {result?.round && <ConfidenceBadge confidence={result.round.confidence} />}
        </label>
        {includeRound && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Round Type" value={roundType} onChange={(e) => setRoundType(e.target.value)}>
                {ROUND_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </Select>
              <Input label="Round Title" value={roundTitle} onChange={(e) => setRoundTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Date & Time"
                type="datetime-local"
                value={roundDate}
                onChange={(e) => setRoundDate(e.target.value)}
              />
              <Input label="Duration (min)" type="number" value={roundDuration} onChange={(e) => setRoundDuration(e.target.value)} />
              <Select label="Mode" value={roundMode} onChange={(e) => setRoundMode(e.target.value)}>
                {ROUND_MODES.map((m) => (
                  <option key={m} value={m}>
                    {titleCase(m)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {result?.notes && <p className="text-xs text-slate-400">Note: {result.notes}</p>}
      <p className="text-xs text-slate-400">Source: Pasted text</p>

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setStep("input")}>
          Edit Source Text
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={saving}>
          {saving ? "Saving…" : "Confirm & Create"}
        </Button>
      </div>
    </div>
  );
}

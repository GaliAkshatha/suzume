import { FormEvent, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { PreparationSource } from "@suzume/shared-types";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { formatDateTime } from "../../utils/format";
import { ApiError } from "../../services/api/client";
import { preparationApi } from "../../services/api/preparationApi";
import { useToast } from "../../components/feedback/Toast";

interface Props {
  sources: PreparationSource[];
  onChanged: () => void;
}

export function PreparationSourcesCard({ sources, onChanged }: Props) {
  const { showToast } = useToast();
  const [profileUrl, setProfileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const leetcode = sources.find((s) => s.provider === "leetcode");

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!profileUrl.trim()) return;
    setSubmitting(true);
    try {
      const source = await preparationApi.addSource({ provider: "leetcode", profileUrl: profileUrl.trim() });
      setProfileUrl("");
      onChanged();
      if (source.lastSyncError) {
        showToast(source.lastSyncError, "error");
      } else {
        showToast("LeetCode connected");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to connect LeetCode.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefresh(id: string) {
    setRefreshingId(id);
    try {
      const source = await preparationApi.refreshSource(id);
      onChanged();
      if (source.lastSyncError) {
        showToast(source.lastSyncError, "error");
      } else {
        showToast("LeetCode data refreshed");
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Unable to refresh right now.", "error");
    } finally {
      setRefreshingId(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this preparation source? Your Suzume logs and progress are not affected.")) return;
    try {
      await preparationApi.removeSource(id);
      onChanged();
      showToast("Source removed");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Unable to remove source.", "error");
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Preparation Sources</h2>

      {!leetcode ? (
        <form onSubmit={handleConnect} className="flex flex-col gap-3">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">LeetCode</p>
            <Input
              label="Profile URL"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://leetcode.com/u/username"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="mt-3 w-full" disabled={submitting}>
              {submitting ? "Importing…" : "Import Progress"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">LeetCode</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleRefresh(leetcode.id)}
                disabled={refreshingId === leetcode.id}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Refresh"
              >
                <RefreshCw size={14} className={refreshingId === leetcode.id ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => handleRemove(leetcode.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {leetcode.metrics ? (
            <>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {leetcode.metrics.totalSolved ?? 0}{" "}
                <span className="text-sm font-normal text-slate-400">problems solved</span>
              </p>
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <span>Easy {leetcode.metrics.easySolved ?? 0}</span>
                <span>Medium {leetcode.metrics.mediumSolved ?? 0}</span>
                <span>Hard {leetcode.metrics.hardSolved ?? 0}</span>
              </div>
              {leetcode.metrics.lastActivityDate && (
                <p className="mt-2 text-xs text-slate-400">
                  Last activity: {formatDateTime(leetcode.metrics.lastActivityDate)}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No data imported yet.</p>
          )}

          {leetcode.lastSyncError && (
            <p className="mt-2 text-xs text-red-600">Unable to retrieve your LeetCode information right now.</p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Last synced: {leetcode.lastSyncedAt ? formatDateTime(leetcode.lastSyncedAt) : "Never"}
          </p>
        </div>
      )}
    </Card>
  );
}

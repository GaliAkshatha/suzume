import { FormEvent, useState } from "react";
import { changePasswordSchema } from "@suzume/validation";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../services/api/authApi";
import { ApiError } from "../../services/api/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function ChangePasswordModal({ open, onClose, onChanged }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const result = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(result.data);
      reset();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Change Password"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-slate-400">
          You'll be logged out on all devices after changing your password, as a security measure.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating…" : "Change Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

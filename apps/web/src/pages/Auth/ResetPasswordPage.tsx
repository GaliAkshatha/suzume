import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordSchema } from "@suzume/validation";
import { authApi } from "../../services/api/authApi";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../services/api/client";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = resetPasswordSchema.safeParse({ token, newPassword });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(result.data);
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7fb] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-red-600">This reset link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f7fb] px-4">
      <Link to="/" className="mb-6 text-sm font-medium text-slate-400 hover:text-slate-600">
        ← Back to home
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">
            S
          </div>
          <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-400">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

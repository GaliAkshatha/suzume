import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "@suzume/validation";
import { authApi } from "../../services/api/authApi";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../services/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const msg = await authApi.forgotPassword(result.data);
      setMessage(msg);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-sm text-slate-400">We'll send a reset link to your email.</p>
        </div>

        {message ? (
          <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">{message}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

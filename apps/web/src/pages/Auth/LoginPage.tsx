import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginSchema } from "@suzume/validation";
import { useAuth } from "../../app/providers/AuthProvider";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiError } from "../../services/api/client";

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const needsPreparationSetup = await login(result.data);
      navigate(needsPreparationSetup ? "/preparation-setup" : "/dashboard");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Unable to log in. Please try again.");
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
          <h1 className="text-xl font-bold text-slate-900">
            Suzu<span className="text-primary-600">me</span>
          </h1>
          <p className="text-sm text-slate-400">Welcome back. Log in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Link to="/forgot-password" className="-mt-2 self-end text-xs font-medium text-primary-600 hover:underline">
            Forgot password?
          </Link>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

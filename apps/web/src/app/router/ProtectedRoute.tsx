import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f7fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

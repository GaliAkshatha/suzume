import { useState } from "react";
import { KeyRound, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { Sidebar } from "./Sidebar";
import { ChangePasswordModal } from "../../features/auth/ChangePasswordModal";
import { useToast } from "../feedback/Toast";

export function Topbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  async function handlePasswordChanged() {
    setChangePasswordOpen(false);
    showToast("Password changed. Please log in again.");
    await logout();
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-base font-bold text-slate-900">
          Suzu<span className="text-primary-600">me</span>
        </span>
        <div className="w-9" />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 border-r border-slate-100 bg-white">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="relative ml-auto hidden items-center gap-3 md:flex">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <UserIcon size={14} />
          </div>
          {user?.name}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-11 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                setChangePasswordOpen(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <KeyRound size={15} />
              Change Password
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onChanged={handlePasswordChanged}
      />
    </>
  );
}

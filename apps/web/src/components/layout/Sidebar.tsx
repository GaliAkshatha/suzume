import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Briefcase,
  Calendar,
  MessageSquare,
  Lightbulb,
  LineChart,
  GraduationCap,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/experiences", label: "Experiences", icon: MessageSquare },
  { to: "/learnings", label: "Learnings", icon: Lightbulb },
  { to: "/preparation", label: "Preparation", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: LineChart },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          S
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Suzu<span className="text-primary-600">me</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Suzume · Placement Journey &amp; Learning Tracker
        </p>
      </div>
    </div>
  );
}

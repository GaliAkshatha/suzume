import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#f7f7fb]">
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-100 bg-[#f7f7fb] px-4 md:px-8 md:py-4">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

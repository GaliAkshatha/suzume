import { Link } from "react-router-dom";
import { ArrowRight, ClipboardPaste } from "lucide-react";

export function ExtractPreview() {
  return (
    <div className="w-full rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-6 transition-colors hover:border-primary-300">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <ClipboardPaste size={18} />
        </div>
        <p className="text-sm font-medium text-slate-600">Paste email content here</p>
        <p className="text-xs text-slate-400">or drag and drop</p>
      </div>
      <Link
        to="/register"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
      >
        Try it now <ArrowRight size={15} />
      </Link>
    </div>
  );
}

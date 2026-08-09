export function formatDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} · ${timePart}`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} LPA`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function relativeDay(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(iso);
}

export function timeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

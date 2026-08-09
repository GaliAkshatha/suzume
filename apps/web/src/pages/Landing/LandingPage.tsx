import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  LayoutGrid,
  Briefcase,
  Calendar,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  LineChart,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Reveal } from "../../components/ui/Reveal";
import { WorkflowPreview } from "../../features/landing/WorkflowPreview";
import { DashboardPreview } from "../../features/landing/DashboardPreview";
import { HeatmapPreview } from "../../features/landing/HeatmapPreview";
import { ExtractPreview } from "../../features/landing/ExtractPreview";

const NAV_LINKS = [
  { label: "Features", href: "#modules" },
  { label: "How it works", href: "#journey" },
  { label: "For whom", href: "#preparation" },
];

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Dashboard",
    description: "See everything that matters at a glance — active processes, upcoming rounds, and preparation progress.",
    preview: (
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { n: 12, label: "Applications" },
          { n: 5, label: "Active" },
          { n: 8, label: "Logged" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-white py-2 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-800">{s.n}</p>
            <p className="text-[9px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Briefcase,
    title: "Company Timeline",
    description: "Every application becomes a visual recruitment timeline you can add rounds to as they're scheduled.",
    preview: (
      <div className="flex flex-col gap-1.5">
        {[
          { label: "Applied", done: true },
          { label: "Shortlisted", done: true },
          { label: "Interview", done: false },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${step.done ? "bg-primary-600" : "border-2 border-slate-300"}`} />
            <span className={`text-[10px] ${step.done ? "text-slate-600" : "text-slate-400"}`}>{step.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: "Interview Experience",
    description: "Log what was asked, how it went, and what you'd do differently — while it's still fresh.",
    preview: (
      <div className="rounded-lg bg-white p-2.5 shadow-sm">
        <p className="text-[10px] font-medium text-slate-600">"Explain HashMap collision handling"</p>
        <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
          Went well
        </span>
      </div>
    ),
  },
  {
    icon: Lightbulb,
    title: "Learnings & Action Items",
    description: "Turn every interview into a lesson with concrete action items you can actually follow up on.",
    preview: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <CheckSquare size={12} className="shrink-0 text-primary-600" />
          <span className="text-[10px] text-slate-500 line-through">Practice explaining approach first</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 shrink-0 rounded-[3px] border-2 border-slate-300" />
          <span className="text-[10px] text-slate-600">Revise SQL window functions</span>
        </div>
      </div>
    ),
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Deadlines and rounds show up automatically — no separate calendar to maintain by hand.",
    preview: (
      <div>
        <div className="flex gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span
              key={i}
              className={`flex h-4 w-4 items-center justify-center rounded text-[8px] font-medium ${
                i === 3 ? "bg-primary-600 text-white" : "bg-white text-slate-400"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] text-slate-500">InMobi · Online Assessment</p>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    title: "Preparation Tracker",
    description: "Track progress across DSA, DBMS, System Design, or any topic you add yourself.",
    preview: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[9px] text-slate-500">DSA</span>
          <ProgressBar percent={82} color="#7c3aed" />
          <span className="w-6 shrink-0 text-right text-[9px] font-medium text-slate-500">82%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[9px] text-slate-500">DBMS</span>
          <ProgressBar percent={64} color="#3b82f6" />
          <span className="w-6 shrink-0 text-right text-[9px] font-medium text-slate-500">64%</span>
        </div>
      </div>
    ),
  },
];

const PREP_SUBJECTS = [
  { name: "DSA", percent: 82, color: "#7c3aed" },
  { name: "SQL", percent: 74, color: "#10b981" },
  { name: "DBMS", percent: 64, color: "#3b82f6" },
  { name: "System Design", percent: 37, color: "#8b5cf6" },
];

export default function LandingPage() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f7fb]">
      <header className="sticky top-0 z-40 border-b border-transparent bg-[#f7f7fb]/90 backdrop-blur-sm transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Suzu<span className="text-primary-600">me</span>
          </span>
        </div>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-slate-500 hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-2 lg:gap-16 lg:pt-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="reveal reveal-in mb-5 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700">
            Placement Journey &amp; Learning Tracker
          </span>
          <h1
            className="reveal reveal-in text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            Every application, interview, and lesson —{" "}
            <span className="text-primary-600">in one place.</span>
          </h1>
          <p
            className="reveal reveal-in mt-5 max-w-xl text-base text-slate-500 md:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            From applications to final offers, track everything. Learn from every interview. Improve every day.
            Stay organized, stay prepared, stay ahead.
          </p>
          <div className="reveal reveal-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Link to="/register">
              <Button className="w-full transition-transform hover:-translate-y-0.5 sm:w-auto">
                Start Tracking Free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="w-full transition-transform hover:-translate-y-0.5 sm:w-auto">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>

        <div className="reveal reveal-in" style={{ animationDelay: "200ms" }}>
          <DashboardPreview />
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <Reveal className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Your entire journey, connected</h2>
          <p className="mt-3 text-sm text-slate-500 md:text-base">One flow. One system. Complete clarity.</p>
        </Reveal>
        <Reveal delayMs={100}>
          <WorkflowPreview />
        </Reveal>
      </section>

      <section id="modules" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <Reveal className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Everything you need for your placement season</h2>
          <p className="mt-3 text-sm text-slate-500 md:text-base">Six powerful modules. All connected.</p>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, preview }, i) => (
            <Reveal key={title} delayMs={i * 60}>
              <Card className="group flex h-full flex-col gap-3 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{description}</p>
                <div className="mt-auto rounded-lg bg-slate-50/70 p-3">{preview}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="preparation" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <Reveal className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Track your preparation</h2>
          <p className="mt-3 text-sm text-slate-500 md:text-base">
            See your progress, study activity, and focus areas in one place.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Subject Progress</p>
              <div className="flex flex-col gap-4">
                {PREP_SUBJECTS.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-slate-600">{s.name}</span>
                    <ProgressBar percent={s.percent} color={s.color} />
                    <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-700">{s.percent}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delayMs={100}>
            <Card className="h-full p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Study Activity</p>
              <HeatmapPreview />
            </Card>
          </Reveal>
        </div>
      </section>

      <section id="extract" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <Reveal>
          <Card className="grid grid-cols-1 items-center gap-10 p-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Paste to extract</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-base">
                Drop in a placement email or notice — Suzume reads it and fills in the details for you.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {[
                  "Works with placement cell announcements, recruiter emails, and job postings",
                  "Pulls out company, role, stipend, CTC, and interview dates automatically",
                  "You always review and confirm before anything is saved",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckSquare size={15} className="mt-0.5 shrink-0 text-primary-600" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <ExtractPreview />
          </Card>
        </Reveal>
      </section>

      <section id="cta" className="scroll-mt-24 bg-primary-600 py-16">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Stop losing track of your placement journey.
          </h2>
          <p className="mt-3 text-sm text-primary-100 md:text-base">
            Set it up in a couple of minutes. Free to use.
          </p>
          <Link to="/register" className="mt-6">
            <Button className="!bg-white !text-primary-700 transition-transform hover:-translate-y-0.5 hover:!bg-primary-50">
              Get Started with Suzume <ArrowRight size={16} />
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-slate-400">
        Suzume · Placement Journey &amp; Learning Tracker
      </footer>
    </div>
  );
}

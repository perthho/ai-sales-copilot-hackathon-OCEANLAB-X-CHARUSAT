"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
  ChevronRight,
  Clock,
  PhoneIncoming,
} from "lucide-react";
import Link from "next/link";
import { StartCallFAB } from "@/components/start-call-button";
import type { Call } from "@/types";

/* ---------- Stat Card ---------- */
function StatCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "neutral";
  icon: React.ElementType;
  progress?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground font-medium">{label}</span>
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        <p className={`text-xs mt-1 font-medium ${changeType === "up" ? "text-success" : "text-muted-foreground"}`}>
          {changeType === "up" && <ArrowUpRight className="size-3 inline mr-0.5" />}
          {change}
        </p>
      </div>
      {progress !== undefined && (
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

/* ---------- Deal Row ---------- */
function DealRow({
  company,
  initials,
  sub,
  value,
  stage,
  winPct,
  closeDate,
}: {
  company: string;
  initials: string;
  sub: string;
  value: string;
  stage: string;
  winPct: number;
  closeDate: string;
}) {
  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="py-3.5 pl-5 rounded-l-lg">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-accent flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{company}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 text-[13px] font-medium text-foreground">{value}</td>
      <td className="py-3.5">
        <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
          {stage}
        </span>
      </td>
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${winPct}%`,
                backgroundColor: winPct >= 70 ? "var(--success)" : "var(--primary)",
              }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{winPct}%</span>
        </div>
      </td>
      <td className="py-3.5 text-xs text-muted-foreground">{closeDate}</td>
      <td className="py-3.5 pr-5 rounded-r-lg text-right">
        <button className="size-7 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </td>
    </tr>
  );
}

/* ---------- Mobile Deal Card ---------- */
function DealCard({
  company,
  sub,
  value,
  stage,
  winPct,
}: {
  company: string;
  sub: string;
  value: string;
  stage: string;
  winPct: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[15px] font-semibold text-foreground">{company}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <p className="text-[15px] font-heading font-bold text-foreground">{value}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
          {stage}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${winPct}%`,
                backgroundColor: winPct >= 70 ? "var(--success)" : "var(--primary)",
              }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{winPct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Recent Calls Row ---------- */
function RecentCallRow({ call }: { call: Call }) {
  const duration = call.endedAt
    ? `${Math.floor((call.endedAt - call.startedAt) / 60000)}m ${Math.floor(((call.endedAt - call.startedAt) % 60000) / 1000)}s`
    : "In progress";
  const time = new Date(call.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link href={`/call/${call.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors rounded-lg">
      <div className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
        call.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      }`}>
        <PhoneIncoming className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{call.contactName}</p>
        <p className="text-xs text-muted-foreground">{call.contactCompany}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">{time}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
          <Clock className="size-3" />
          {duration}
        </p>
      </div>
      {call.status === "active" && (
        <span className="size-2 rounded-full bg-success animate-pulse shrink-0" />
      )}
    </Link>
  );
}

/* ---------- Page ---------- */
export default function DashboardPage() {
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);

  useEffect(() => {
    fetch("/api/calls")
      .then((res) => res.json())
      .then((data) => setRecentCalls(data.calls ?? []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1200px] space-y-6 md:space-y-8">
      {/* Greeting */}
      <section>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
          Good afternoon, Aman
        </h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          You have <span className="text-primary font-medium">12 deals</span> in your pipeline.
          AI suggests following up with FinServe within 2 hours.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          label="Today's Calls"
          value="24"
          change="+5 vs avg"
          changeType="up"
          icon={Phone}
          progress={75}
        />
        <StatCard
          label="Win Rate"
          value="68.2%"
          change="+2.1% this week"
          changeType="up"
          icon={TrendingUp}
          progress={68}
        />
        <div className="col-span-2 md:col-span-1">
          <StatCard
            label="AI Suggestions Used"
            value="112"
            change="94% acceptance rate"
            changeType="neutral"
            icon={Sparkles}
          />
        </div>
      </section>

      {/* Desktop: Pipeline Table + AI Sidebar */}
      <section className="hidden lg:grid grid-cols-12 gap-6">
        {/* Table */}
        <div className="col-span-8 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-[15px] font-heading font-semibold text-foreground">Active Pipeline</h2>
            <div className="flex gap-1.5">
              <button className="h-7 px-3 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Quarterly
              </button>
              <button className="h-7 px-3 rounded-md bg-primary/10 text-xs font-medium text-primary">
                Active
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pl-5 text-xs font-medium text-muted-foreground">Company</th>
                <th className="py-3 text-xs font-medium text-muted-foreground">Value</th>
                <th className="py-3 text-xs font-medium text-muted-foreground">Stage</th>
                <th className="py-3 text-xs font-medium text-muted-foreground">Win %</th>
                <th className="py-3 text-xs font-medium text-muted-foreground">Close</th>
                <th className="py-3 pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <DealRow company="FinServe Pvt Ltd" initials="FS" sub="Enterprise Core Banking" value="₹15,00,000" stage="Negotiation" winPct={85} closeDate="Apr 24" />
              <DealRow company="Indus Retail" initials="IR" sub="Supply Chain Dashboard" value="₹8,50,000" stage="Discovery" winPct={30} closeDate="May 12" />
              <DealRow company="Lumina Ltd" initials="LL" sub="Logistics AI" value="₹21,00,000" stage="Closing" winPct={95} closeDate="Apr 15" />
            </tbody>
          </table>
        </div>

        {/* AI Sidebar */}
        <div className="col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-secondary" />
              <h3 className="text-[13px] font-semibold text-foreground">AI Suggestions</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-[13px] text-foreground leading-relaxed">
                  2 deals in Closing haven&apos;t been contacted in 48 hours. Follow up today to keep momentum.
                </p>
                <button className="text-xs font-medium text-primary mt-3 hover:underline">
                  Send follow-ups
                </button>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-[13px] text-foreground leading-relaxed">
                  FinServe call shows high sentiment on compliance features. Pivot next demo accordingly.
                </p>
                <button className="text-xs font-medium text-primary mt-3 hover:underline">
                  View insights
                </button>
              </div>
            </div>
          </div>

          {/* Conversion gauge */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground mb-5">Conversion</h3>
            <div className="flex flex-col items-center">
              <div className="relative size-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--muted)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="88" strokeDashoffset="26" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-heading font-bold text-foreground">70%</span>
                  <span className="text-xs text-muted-foreground">on target</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Inbound</p>
                  <p className="text-lg font-heading font-bold text-foreground">42</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Outbound</p>
                  <p className="text-lg font-heading font-bold text-foreground">18</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: Deal Cards */}
      <section className="lg:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-heading font-semibold text-foreground">Active Pipeline</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-0.5">
            View all <ChevronRight className="size-3" />
          </button>
        </div>
        <div className="space-y-3">
          <DealCard company="FinServe Pvt Ltd" sub="Enterprise Core Banking" value="₹15L" stage="Negotiation" winPct={85} />
          <DealCard company="Indus Retail" sub="Supply Chain Dashboard" value="₹8.5L" stage="Discovery" winPct={30} />
          <DealCard company="Lumina Ltd" sub="Logistics AI" value="₹21L" stage="Closing" winPct={95} />
        </div>
      </section>

      {/* Recent Calls from Firestore */}
      {recentCalls.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-heading font-semibold text-foreground">Recent Calls</h2>
            <span className="text-xs text-muted-foreground">{recentCalls.length} calls</span>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
            {recentCalls.slice(0, 5).map((call) => (
              <RecentCallRow key={call.id} call={call} />
            ))}
          </div>
        </section>
      )}

      <StartCallFAB />
    </div>
  );
}

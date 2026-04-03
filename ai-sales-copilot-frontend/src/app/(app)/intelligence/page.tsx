import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Target,
  Users,
  Phone,
  Play,
} from "lucide-react";
import Link from "next/link";

/* ---------- Metric Card ---------- */
function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
      <p className={`text-xs mt-1 font-medium flex items-center gap-0.5 ${
        trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
      }`}>
        {trend === "up" && <ArrowUpRight className="size-3" />}
        {trend === "down" && <TrendingDown className="size-3" />}
        {change}
      </p>
    </div>
  );
}

/* ---------- Rep Row ---------- */
function RepRow({
  name,
  initials,
  calls,
  winRate,
  avgSentiment,
  aiUsage,
  coachNote,
}: {
  name: string;
  initials: string;
  calls: number;
  winRate: number;
  avgSentiment: string;
  aiUsage: string;
  coachNote: string;
}) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="py-3.5 pl-5">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
          <span className="text-[13px] font-semibold text-foreground">{name}</span>
        </div>
      </td>
      <td className="py-3.5 text-[13px] text-foreground">{calls}</td>
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${winRate}%` }} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{winRate}%</span>
        </div>
      </td>
      <td className="py-3.5">
        <span className={`inline-flex items-center h-6 px-2.5 rounded-md text-xs font-medium ${
          avgSentiment === "Positive"
            ? "bg-success/10 text-success"
            : avgSentiment === "Neutral"
              ? "bg-muted text-muted-foreground"
              : "bg-destructive/10 text-destructive"
        }`}>
          {avgSentiment}
        </span>
      </td>
      <td className="py-3.5 text-[13px] text-muted-foreground">{aiUsage}</td>
      <td className="py-3.5 pr-5 text-xs text-muted-foreground max-w-[200px] truncate">
        {coachNote}
      </td>
    </tr>
  );
}

/* ---------- Flagged Call ---------- */
function FlaggedCall({
  company,
  rep,
  reason,
  time,
  callId,
}: {
  company: string;
  rep: string;
  reason: string;
  time: string;
  callId: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="size-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="size-3.5 text-warning" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{company}</p>
        <p className="text-xs text-muted-foreground">{rep} &middot; {time}</p>
        <p className="text-xs text-muted-foreground mt-1">{reason}</p>
      </div>
      <Link
        href={`/call/${callId}`}
        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline shrink-0"
      >
        <Play className="size-3" />
        Review
      </Link>
    </div>
  );
}

/* ---------- Objection Item ---------- */
function ObjectionItem({ text, count, trend }: { text: string; count: number; trend: "up" | "down" }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-3.5 text-muted-foreground" />
        <span className="text-[13px] text-foreground">{text}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{count}x</span>
        {trend === "up" ? (
          <TrendingUp className="size-3 text-destructive" />
        ) : (
          <TrendingDown className="size-3 text-success" />
        )}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function IntelligencePage() {
  return (
    <div className="p-4 md:p-8 max-w-[1200px] space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Intelligence</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Team performance and AI coaching insights — last 30 days
        </p>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard label="Total Calls" value="186" change="+12% vs last month" trend="up" icon={Phone} />
        <MetricCard label="Team Win Rate" value="64.3%" change="+3.2% vs last month" trend="up" icon={Target} />
        <MetricCard label="Avg Sentiment" value="72/100" change="-2 pts" trend="down" icon={BarChart3} />
        <MetricCard label="AI Suggestions Used" value="89%" change="+5% adoption" trend="up" icon={Sparkles} />
      </section>

      {/* Rep Performance Table */}
      <section className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="text-[15px] font-heading font-semibold text-foreground">Rep Performance</h2>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 pl-5 text-xs font-medium text-muted-foreground">Rep</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Calls</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Win Rate</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Sentiment</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">AI Usage</th>
              <th className="py-3 pr-5 text-xs font-medium text-muted-foreground">AI Coaching Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <RepRow name="Aman Sharma" initials="AS" calls={48} winRate={72} avgSentiment="Positive" aiUsage="94%" coachNote="Strong closer. Focus on discovery questions early." />
            <RepRow name="Sneha Patel" initials="SP" calls={52} winRate={61} avgSentiment="Neutral" aiUsage="88%" coachNote="Improve objection handling around pricing." />
            <RepRow name="Raj Kumar" initials="RK" calls={39} winRate={55} avgSentiment="Neutral" aiUsage="76%" coachNote="Talks too much — aim for 40/60 listen ratio." />
            <RepRow name="Meera Joshi" initials="MJ" calls={47} winRate={68} avgSentiment="Positive" aiUsage="91%" coachNote="Great rapport. Could push for commitment earlier." />
          </tbody>
        </table>
      </section>

      {/* Mobile Rep Cards */}
      <section className="md:hidden space-y-3">
        <h2 className="text-[15px] font-heading font-semibold text-foreground">Rep Performance</h2>
        {[
          { name: "Aman Sharma", initials: "AS", winRate: 72, calls: 48, note: "Strong closer" },
          { name: "Sneha Patel", initials: "SP", winRate: 61, calls: 52, note: "Improve objection handling" },
          { name: "Raj Kumar", initials: "RK", winRate: 55, calls: 39, note: "Aim for 40/60 listen ratio" },
          { name: "Meera Joshi", initials: "MJ", winRate: 68, calls: 47, note: "Push for commitment earlier" },
        ].map((rep) => (
          <div key={rep.name} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="size-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {rep.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">{rep.name}</p>
              <p className="text-xs text-muted-foreground">{rep.calls} calls &middot; {rep.winRate}% win rate</p>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom: Flagged Calls + Common Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flagged Calls */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <h3 className="text-[13px] font-semibold text-foreground">Flagged Calls</h3>
            </div>
            <span className="text-xs text-muted-foreground">3 need review</span>
          </div>
          <div className="divide-y divide-border">
            <FlaggedCall company="TechBridge Solutions" rep="Raj Kumar" reason="Customer expressed frustration — sentiment dropped to 28/100" time="Yesterday" callId="call-101" />
            <FlaggedCall company="Nova Fintech" rep="Sneha Patel" reason="Missed buying signal — customer asked about implementation twice" time="2 days ago" callId="call-102" />
            <FlaggedCall company="Indus Retail" rep="Aman Sharma" reason="Competitor mentioned (SecurX) — no counter response given" time="3 days ago" callId="call-103" />
          </div>
        </div>

        {/* Common Objections */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <h3 className="text-[13px] font-semibold text-foreground">Top Objections</h3>
            </div>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <div className="divide-y divide-border">
            <ObjectionItem text="Pricing too high" count={34} trend="up" />
            <ObjectionItem text="Implementation timeline" count={28} trend="down" />
            <ObjectionItem text="Already using competitor" count={19} trend="up" />
            <ObjectionItem text="Need internal approval" count={15} trend="down" />
            <ObjectionItem text="Data security concerns" count={12} trend="down" />
          </div>
        </div>
      </div>
    </div>
  );
}

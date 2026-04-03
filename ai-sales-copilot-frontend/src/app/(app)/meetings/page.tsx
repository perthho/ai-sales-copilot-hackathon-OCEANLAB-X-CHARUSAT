import {
  Clock,
  Phone,
  Video,
  MapPin,
  Plus,
  ChevronRight,
  Calendar,
  Users,
} from "lucide-react";

const today = [
  {
    id: "1",
    time: "10:00 AM",
    duration: "30 min",
    title: "Discovery Call — FinServe Pvt Ltd",
    type: "call" as const,
    participants: ["Rahul Mehta", "Aman Sharma"],
    status: "upcoming" as const,
  },
  {
    id: "2",
    time: "12:30 PM",
    duration: "45 min",
    title: "Product Demo — Nova Fintech",
    type: "video" as const,
    participants: ["Vikram Desai", "Aman Sharma", "Priya (SE)"],
    status: "upcoming" as const,
  },
  {
    id: "3",
    time: "3:00 PM",
    duration: "20 min",
    title: "Follow-up — Indus Retail",
    type: "call" as const,
    participants: ["Priya Nair", "Aman Sharma"],
    status: "upcoming" as const,
  },
];

const tomorrow = [
  {
    id: "4",
    time: "9:30 AM",
    duration: "60 min",
    title: "Contract Review — Lumina Ltd",
    type: "video" as const,
    participants: ["Arjun Singh", "Legal Team", "Aman Sharma"],
    status: "upcoming" as const,
  },
  {
    id: "5",
    time: "2:00 PM",
    duration: "30 min",
    title: "Intro Call — TechBridge Solutions",
    type: "call" as const,
    participants: ["Kavitha Rao", "Aman Sharma"],
    status: "upcoming" as const,
  },
];

const reminders = [
  { id: "r1", text: "Send revised proposal to FinServe", due: "Today, 5:00 PM", done: false },
  { id: "r2", text: "Prepare demo environment for Nova", due: "Tomorrow, 9:00 AM", done: false },
  { id: "r3", text: "Update Zoho notes for Indus Retail", due: "Today, 6:00 PM", done: true },
];

function MeetingCard({ meeting }: { meeting: (typeof today)[0] }) {
  const TypeIcon = meeting.type === "video" ? Video : Phone;
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-4 group hover:border-primary/20 transition-colors">
      {/* Time */}
      <div className="w-16 shrink-0 text-center pt-0.5">
        <p className="text-[13px] font-semibold text-foreground">{meeting.time}</p>
        <p className="text-[11px] text-muted-foreground">{meeting.duration}</p>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-border self-center shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{meeting.title}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TypeIcon className="size-3.5" />
            <span className="text-xs capitalize">{meeting.type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" />
            <span className="text-xs">{meeting.participants.length} people</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <button className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
        Join
      </button>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1200px] space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Meetings</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {today.length + tomorrow.length} upcoming across the next 2 days
          </p>
        </div>
        <button className="h-9 px-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="size-4" />
          <span className="hidden md:inline">Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4 text-primary" />
              <h2 className="text-[13px] font-semibold text-foreground">Today</h2>
              <span className="text-xs text-muted-foreground">&middot; {today.length} meetings</span>
            </div>
            <div className="space-y-3">
              {today.map((m) => (
                <MeetingCard key={m.id} meeting={m} />
              ))}
            </div>
          </section>

          {/* Tomorrow */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold text-foreground">Tomorrow</h2>
              <span className="text-xs text-muted-foreground">&middot; {tomorrow.length} meetings</span>
            </div>
            <div className="space-y-3">
              {tomorrow.map((m) => (
                <MeetingCard key={m.id} meeting={m} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Reminders */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-foreground">Reminders</h3>
              <button className="text-xs text-primary font-medium hover:underline">Add</button>
            </div>
            <div className="space-y-3">
              {reminders.map((r) => (
                <label key={r.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    defaultChecked={r.done}
                    className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-relaxed ${r.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {r.text}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="size-3" />
                      {r.due}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground mb-4">This Week</h3>
            <div className="space-y-3">
              {[
                { label: "Calls completed", value: "12" },
                { label: "Avg call duration", value: "18 min" },
                { label: "Follow-ups sent", value: "8" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-[13px] font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

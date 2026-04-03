"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  PhoneCall,
  MoreHorizontal,
  Brain,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { useStartCall } from "@/components/start-call-dialog";

const recentCalls = [
  { id: "call-1", title: "FinServe Pvt Ltd", href: "/call/call-1" },
  { id: "call-2", title: "Indus Retail Demo", href: "/call/call-2" },
  { id: "call-3", title: "Lumina Ltd Closing", href: "/call/call-3" },
];

const allCalls = [
  { id: "call-1", title: "FinServe Pvt Ltd", desc: "Enterprise Security Solution Pitch", date: "Today", time: "2 hours ago", href: "/call/call-1" },
  { id: "call-2", title: "Indus Retail Demo", desc: "Supply Chain Dashboard walkthrough", date: "Today", time: "5 hours ago", href: "/call/call-2" },
  { id: "call-3", title: "Lumina Ltd Closing", desc: "Final contract negotiation call", date: "Yesterday", time: "Yesterday", href: "/call/call-3" },
  { id: "call-4", title: "Nova Fintech Intro", desc: "Initial discovery and needs assessment", date: "Yesterday", time: "Yesterday", href: "/call/call-4" },
  { id: "call-5", title: "TechBridge Solutions", desc: "Procurement process discussion", date: "Last 7 Days", time: "Apr 1", href: "/call/call-5" },
  { id: "call-6", title: "SecureNet Corp", desc: "Compliance requirements review", date: "Last 7 Days", time: "Mar 31", href: "/call/call-6" },
  { id: "call-7", title: "Apex Industries", desc: "Quarterly business review", date: "Last 7 Days", time: "Mar 30", href: "/call/call-7" },
  { id: "call-8", title: "Meridian Health", desc: "Healthcare platform demo", date: "This Month", time: "Mar 28", href: "/call/call-8" },
  { id: "call-9", title: "CloudFirst Ltd", desc: "Migration strategy discussion", date: "This Month", time: "Mar 25", href: "/call/call-9" },
  { id: "call-10", title: "DataVault Inc", desc: "Data security audit followup", date: "This Month", time: "Mar 22", href: "/call/call-10" },
];

const workflowItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/meetings", label: "Meetings", icon: Calendar },
  { href: "/intelligence", label: "Intelligence", icon: Brain },
];

/* ---------- View All Panel ---------- */
function ViewAllPanel({ open, onClose, onStartCall }: { open: boolean; onClose: () => void; onStartCall: () => void }) {
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open, onClose]);

  const filtered = allCalls.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, typeof allCalls>>((acc, call) => {
    if (!acc[call.date]) acc[call.date] = [];
    acc[call.date].push(call);
    return acc;
  }, {});

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-[60] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 left-0 h-screen w-[35vw] min-w-[360px] max-w-[520px] bg-card border-r border-border z-[70] flex flex-col shadow-2xl transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-[15px] font-heading font-semibold text-foreground">Call History</h2>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
              placeholder="Search calls..."
              type="text"
              autoFocus
            />
          </div>
        </div>

        {/* New call action */}
        <button
          onClick={() => { onClose(); onStartCall(); }}
          className="mx-4 mt-3 mb-1 flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors w-[calc(100%-2rem)]"
        >
          <Plus className="size-4 text-muted-foreground" />
          Start New Call
        </button>

        {/* Call list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-8">No calls found</p>
          )}
          {Object.entries(grouped).map(([date, calls]) => (
            <div key={date} className="mt-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
                {date}
              </p>
              <div className="space-y-0.5">
                {calls.map((call) => (
                  <Link
                    key={call.id}
                    href={call.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {call.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {call.desc}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-4">
                      {call.time}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Sidebar ---------- */
export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { open: openStartCall } = useStartCall();
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const labelCls = cn(
    "whitespace-nowrap transition-[opacity] duration-200 overflow-hidden",
    collapsed ? "opacity-0 w-0" : "opacity-100"
  );

  const itemCls = (isActive: boolean, variant: "default" | "primary" = "default") =>
    cn(
      "flex items-center h-9 rounded-lg text-[13px] font-medium transition-all duration-200 overflow-hidden",
      collapsed ? "w-9 justify-center mx-auto" : "w-full px-3 gap-3",
      variant === "primary"
        ? isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
        : isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border z-50 overflow-hidden transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[60px]" : "w-60"
        )}
      >
        {/* Brand */}
        <div className="h-14 shrink-0 relative flex items-center">
          <Link href="/dashboard" className="w-[60px] flex items-center justify-center shrink-0">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-xs">SC</span>
            </div>
          </Link>
          <div className={cn(
            "flex-1 flex items-center justify-between pr-3 transition-[opacity] duration-200",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <Link href="/dashboard" className="font-heading font-bold text-[15px] text-sidebar-foreground tracking-tight whitespace-nowrap hover:text-primary transition-colors">
              Sales Copilot
            </Link>
            <button
              onClick={toggle}
              title="Collapse sidebar"
              className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-auto"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
        </div>

        {/* Call History */}
        <div className={cn("mt-3 transition-all duration-200", collapsed ? "px-[10.5px]" : "px-3")}>
          <div className={cn("flex items-center justify-between px-3 overflow-hidden transition-all duration-200", collapsed ? "h-0 opacity-0 mb-0" : "h-5 opacity-100 mb-1")}>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              Call History
            </span>
            <button onClick={openStartCall} className="size-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {recentCalls.map((call) => (
              <Link key={call.id} href={call.href} title={call.title} className={itemCls(pathname === call.href)}>
                <PhoneCall className="size-3.5 shrink-0" />
                <span className={cn(labelCls, "truncate")}>{call.title}</span>
              </Link>
            ))}
            <button
              onClick={() => setViewAllOpen(true)}
              className={cn(
                "flex items-center h-9 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 overflow-hidden",
                collapsed ? "w-9 justify-center mx-auto" : "w-full px-3 gap-3"
              )}
            >
              <MoreHorizontal className="size-3.5 shrink-0" />
              <span className={labelCls}>View All</span>
            </button>
          </div>
        </div>

        {/* Workflows */}
        <div className={cn("mt-5 transition-all duration-200", collapsed ? "px-[10.5px]" : "px-3")}>
          <div className={cn("px-3 overflow-hidden transition-all duration-200", collapsed ? "h-0 opacity-0 mb-0" : "h-5 opacity-100 mb-1")}>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              Workflows
            </span>
          </div>
          <div className={cn("bg-sidebar-border mx-auto transition-all duration-200", collapsed ? "h-px w-6 mb-2" : "h-0 w-0 mb-0 opacity-0")} />
          <div className="space-y-0.5">
            {workflowItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.label} href={item.href} title={item.label} className={itemCls(isActive, "primary")}>
                  <item.icon className="size-4 shrink-0" />
                  <span className={labelCls}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="pb-2 space-y-0.5">
          <div className={cn("overflow-hidden transition-all duration-200", collapsed ? "h-9" : "h-0 opacity-0")}>
            <div className={cn("h-9", collapsed ? "mx-[10.5px]" : "mx-3")}>
              <button
                onClick={toggle}
                title="Expand sidebar"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
          </div>
          <Link href="#" title="Help" className={cn(
            "flex items-center h-9 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 overflow-hidden",
            collapsed ? "mx-[10.5px]" : "mx-3"
          )}>
            <span className="w-9 flex items-center justify-center shrink-0"><HelpCircle className="size-4" /></span>
            <span className={labelCls}>Help</span>
          </Link>
          <Link href="/settings" title="Settings" className={itemCls(pathname === "/settings")}>
            <span className="w-9 flex items-center justify-center shrink-0"><Settings className="size-4" /></span>
            <span className={labelCls}>Settings</span>
          </Link>
        </div>

        {/* User */}
        <div className={cn(
          "py-3 border-t border-sidebar-border flex items-center overflow-hidden",
          collapsed ? "px-0 justify-center" : "px-3"
        )}>
          <span className="w-[60px] flex items-center justify-center shrink-0">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
              AS
            </div>
          </span>
          <div className={cn("flex-1 min-w-0 transition-[opacity] duration-200", collapsed ? "opacity-0 w-0" : "opacity-100")}>
            <p className="text-[13px] font-medium text-foreground truncate">Aman Sharma</p>
            <p className="text-[11px] text-muted-foreground truncate">Enterprise Lead</p>
          </div>
        </div>
      </aside>

      {/* View All overlay panel */}
      <ViewAllPanel open={viewAllOpen} onClose={() => setViewAllOpen(false)} onStartCall={openStartCall} />
    </>
  );
}

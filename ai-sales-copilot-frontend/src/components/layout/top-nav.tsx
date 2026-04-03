"use client";

import { Search, Bell, PhoneCall } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { useStartCall } from "@/components/start-call-dialog";

export function TopNav() {
  const { collapsed } = useSidebar();
  const { open: openStartCall } = useStartCall();
  const pathname = usePathname();
  const inCall = pathname === "/call";

  return (
    <header
      className="hidden md:flex fixed top-0 right-0 z-40 bg-background/80 backdrop-blur-xl items-center justify-between px-6 h-16 border-b border-border transition-all duration-200"
      style={{ left: collapsed ? "60px" : "15rem" }}
    >
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none transition-shadow"
          placeholder="Search deals, calls..."
          type="text"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <Bell className="size-[18px]" />
        </button>
        <button
          onClick={openStartCall}
          disabled={inCall}
          className="flex items-center gap-2 h-9 px-4 ml-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <PhoneCall className="size-4" />
          {inCall ? "In Call" : "Start Call"}
        </button>
      </div>
    </header>
  );
}

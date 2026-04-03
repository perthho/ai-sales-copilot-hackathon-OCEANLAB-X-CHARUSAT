"use client";

import { Brain, Bell } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="flex justify-between items-center px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Brain className="size-3.5 text-primary" />
          </div>
          <span className="font-heading font-bold text-[15px] text-foreground tracking-tight">
            Sales Copilot
          </span>
        </div>
        <button className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg transition-colors">
          <Bell className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}

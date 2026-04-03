"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { StartCallProvider } from "@/components/start-call-dialog";

function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <Sidebar />
      <TopNav />
      <MobileHeader />
      <main
        className="md:pt-16 pt-14 pb-16 md:pb-0 min-h-screen transition-[margin] duration-200"
        style={{ marginLeft: undefined }}
      >
        {/*
          We use inline style for the md margin because the collapsed width
          (60px) is dynamic and toggled at runtime. Mobile has no sidebar margin.
        */}
        <div className="hidden md:block fixed inset-0 pointer-events-none" aria-hidden />
        {children}
      </main>
      <BottomNav />

      {/* Responsive margin via inline style tag — avoids CSS-in-JS dep */}
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? "60px" : "15rem"} !important; }
        }
      `}</style>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StartCallProvider>
        <Shell>{children}</Shell>
      </StartCallProvider>
    </SidebarProvider>
  );
}

"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Splash } from "@/components/Splash";
import { PasswordDialog } from "@/components/PasswordDialog";
import { PasswordNudge } from "@/components/PasswordNudge";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwKey, setPwKey] = useState(0); // har ochilishda dialog toza holatda yaratiladi
  const [pwVersion, setPwVersion] = useState(0); // parol o'zgargach banner qayta so'raydi
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Splash />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} scrolled={scrolled} onChangePassword={() => { setPwKey((k) => k + 1); setPwOpen(true); }} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        >
          <PasswordNudge version={pwVersion} onChange={() => { setPwKey((k) => k + 1); setPwOpen(true); }} />
          {children}
        </main>
      </div>
      <PasswordDialog key={pwKey} open={pwOpen} onClose={() => setPwOpen(false)} onChanged={() => setPwVersion((v) => v + 1)} />
    </div>
  );
}

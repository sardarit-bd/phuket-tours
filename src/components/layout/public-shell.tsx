"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

interface PublicShellProps {
  children: React.ReactNode;
}

/**
 * PublicShell conditionally mounts the public Header and Footer.
 * The /dashboard route (and any dashboard subroutes) renders standalone
 * with its own persistent dashboard layout, completely excluding the public
 * website navbar and public website footer.
 */
export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

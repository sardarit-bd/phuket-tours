"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { cn } from "@/lib/utils";

export function Header() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5EAED] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
      <Container className="max-w-[1320px] lg:px-0 flex h-[var(--navbar-height,5rem)] items-center justify-between">
        {/* Left: Official PhuketTours Logo */}
        <Link
          href="/"
          className="inline-flex items-center shrink-0 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="PhuketTours Homepage"
        >
          <Image
            src="/images/logo/Logo.png"
            alt="PhuketTours"
            width={173}
            height={40}
            priority
            className="h-9 w-auto sm:h-10 object-contain"
          />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-8 xl:gap-10"
          aria-label="Main Navigation"
        >
          {mainNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-[#263238] hover:text-primary"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right: Book Now CTA Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            size="default"
            className="hidden sm:inline-flex group rounded-full bg-primary hover:bg-primary-dark text-white font-medium px-5 sm:px-6 h-10 sm:h-11 text-sm shadow-sm transition-all items-center gap-2 cursor-pointer"
          >
            <Link href="/tours">
              <span>Book Now</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#263238] hover:bg-muted lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E5EAED] bg-white px-4 py-6 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-[#263238] hover:bg-muted"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-[#E5EAED]">
              <Button asChild size="lg" className="w-full rounded-full">
                <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
                  <span>Book Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

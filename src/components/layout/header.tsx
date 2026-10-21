"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X, PhoneCall, Sparkles } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      {/* Top micro bar for quick support */}
      <div className="hidden border-b border-border/60 bg-muted/50 py-1.5 text-xs text-muted-foreground md:block">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span>Best Price Guarantee on Andaman Sea & Phuket Island Day Trips</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <PhoneCall className="h-3 w-3 text-primary" />
              <span>{siteConfig.contact.phone}</span>
            </a>
            <span>{siteConfig.contact.hours}</span>
          </div>
        </Container>
      </div>

      <Container className="flex h-20 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <Compass className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              Phuket<span className="text-primary">Tours</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Andaman Excursions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
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
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-foreground/80 hover:text-primary hover:bg-muted/70"
                )}
              >
                {item.title}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" size="sm" className="hidden xl:inline-flex">
            <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}>
              <PhoneCall className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Help Desk
            </a>
          </Button>

          <Button asChild size="default" className="shadow-md shadow-primary/20">
            <Link href="/tours">Explore Tours</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </Container>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-6 shadow-xl lg:hidden">
          <nav className="flex flex-col space-y-3">
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
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-border">
              <Button asChild size="lg" className="w-full">
                <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
                  Explore All Tours
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

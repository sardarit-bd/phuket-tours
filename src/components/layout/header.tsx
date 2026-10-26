"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { mainNav, type DropdownItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { cn } from "@/lib/utils";

export function Header() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [mobileToursOpen, setMobileToursOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

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
            const isTours = item.title === "Tours";
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (isTours && item.dropdown) {
              return (
                <div
                  key={item.title}
                  ref={dropdownRef}
                  className="relative flex items-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
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
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDropdownOpen((prev) => !prev);
                      }
                    }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="Toggle Tours dropdown menu"
                    aria-controls="tours-dropdown-menu"
                    className="p-1 -ml-0.5 text-[#263238] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md cursor-pointer"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 stroke-[2.2]",
                        dropdownOpen ? "rotate-180 text-primary" : "text-[#263238]"
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      id="tours-dropdown-menu"
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-80 rounded-2xl border border-[#E5EAED] bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150 z-50"
                    >
                      <div className="space-y-1">
                        {item.dropdown.map((dropItem: DropdownItem) => {
                          const isDropActive = pathname === dropItem.href;
                          return (
                            <Link
                              key={dropItem.href}
                              href={dropItem.href}
                              role="menuitem"
                              onClick={() => setDropdownOpen(false)}
                              className={cn(
                                "block rounded-xl px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isDropActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-[#263238] hover:bg-muted hover:text-primary"
                              )}
                            >
                              <div className="text-sm font-semibold leading-snug">
                                {dropItem.title}
                              </div>
                              {dropItem.description && (
                                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                  {dropItem.description}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

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
              const isTours = item.title === "Tours";
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              if (isTours && item.dropdown) {
                return (
                  <div key={item.title} className="rounded-xl border border-border/60 p-2">
                    <button
                      type="button"
                      onClick={() => setMobileToursOpen(!mobileToursOpen)}
                      className="flex w-full items-center justify-between px-3 py-2 text-base font-medium text-[#263238] hover:text-primary"
                      aria-expanded={mobileToursOpen}
                    >
                      <span className={isActive ? "text-primary font-semibold" : ""}>
                        {item.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          mobileToursOpen && "rotate-180 text-primary"
                        )}
                      />
                    </button>

                    {mobileToursOpen && (
                      <div className="mt-2 space-y-1 border-t border-border/60 pt-2 pl-3">
                        {item.dropdown.map((dropItem: DropdownItem) => (
                          <Link
                            key={dropItem.href}
                            href={dropItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            {dropItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

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

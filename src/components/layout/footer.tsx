"use client";

import Link from "next/link";
import { Compass, Mail, Phone, MapPin, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/navigation";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0f1719] text-gray-300">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-gray-800/80 bg-[#142024] py-8">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-secondary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Licensed & Insured</h4>
                <p className="text-xs text-gray-400">
                  Official TAT license with comprehensive marine insurance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-secondary">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Best Price Guarantee</h4>
                <p className="text-xs text-gray-400">
                  Direct local operator rates without intermediary markups
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-secondary">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Free Cancellation</h4>
                <p className="text-xs text-gray-400">
                  Full refund on weather cancellations or up to 24h prior
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                  <Compass className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Phuket<span className="text-primary">Tours</span>
                </span>
              </Link>

              <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
                {siteConfig.description}
              </p>

              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{siteConfig.contact.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{siteConfig.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>{siteConfig.contact.email}</span>
                </div>
              </div>
            </div>

            {/* Popular Tours */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Popular Tours
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerNav.tours.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerNav.company.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Get Island Offers
              </h4>
              <p className="mb-4 text-xs text-gray-400">
                Subscribe for seasonal discounts, hidden bay guides, and travel tips.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-2"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-10"
                />
                <Button size="sm" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/80 py-6 text-xs text-gray-500">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© 2026 PhuketTours Co., Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            {footerNav.support.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-gray-300"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}

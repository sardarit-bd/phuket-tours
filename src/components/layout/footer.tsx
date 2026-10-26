"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
      <div className="pt-14 sm:pt-16 lg:pt-20">
        <Container className="max-w-[1320px] lg:px-0">
          {/* Main 4-Column Layout */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:items-start lg:gap-8">
            {/* Column 1: Brand / Logo + Description + Social Icons */}
            <div className="w-full sm:col-span-2 lg:w-auto lg:max-w-[360px] flex flex-col items-start">
              <Link
                href="/"
                className="inline-block shrink-0 transition-opacity hover:opacity-95"
                aria-label="PhuketTours Homepage"
              >
                <Image
                  src="/images/logo/Logo.png"
                  alt="PhuketTours"
                  width={173}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              </Link>

              <p className="mt-5 font-outfit text-sm leading-relaxed text-[#74818A]">
                We are passionate about showcasing the best of Phuket, offering
                a carefully curated selection of exceptional tours and
                experiences.
              </p>

              {/* Social Icons */}
              <div className="mt-6 flex items-center gap-3">
                {/* Facebook (Filled Teal) */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3297A3] text-white hover:bg-[#287A84] transition-colors shadow-xs"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram (Outlined Teal) */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3297A3] text-[#3297A3] hover:bg-[#3297A3]/10 transition-colors"
                >
                  <svg
                    className="h-4 w-4 stroke-current fill-none stroke-2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* X / Twitter (Outlined Teal) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (formerly Twitter)"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3297A3] text-[#3297A3] hover:bg-[#3297A3]/10 transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* WhatsApp (Outlined Teal) */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3297A3] text-[#3297A3] hover:bg-[#3297A3]/10 transition-colors"
                >
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col">
              <h4 className="font-outfit font-bold text-base text-[#18282A]">
                Quick Links
              </h4>
              <ul className="mt-4 sm:mt-5 space-y-3 font-outfit text-sm">
                <li>
                  <Link
                    href="/tours"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Tours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tours"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Tour Packages
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="flex flex-col">
              <h4 className="font-outfit font-bold text-base text-[#18282A]">
                Support
              </h4>
              <ul className="mt-4 sm:mt-5 space-y-3 font-outfit text-sm">
                <li>
                  <Link
                    href="/faq"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Get in Touch */}
            <div className="flex flex-col sm:max-w-[280px]">
              <h4 className="font-outfit font-bold text-base text-[#18282A]">
                Get in Touch
              </h4>
              <div className="mt-4 sm:mt-5 space-y-4 font-outfit text-sm">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#3297A3] shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[#74818A]">
                    611, 1 Patak Rd, Karon,
                    <br />
                    Amphoe Mueang , Phuket
                    <br />
                    83100
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#3297A3] shrink-0" />
                  <a
                    href="tel:+66649780775"
                    className="text-[#74818A] hover:text-[#18282A] transition-colors"
                  >
                    +66 64 978 0775
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Thin Horizontal Divider */}
          <div className="mt-12 sm:mt-16 border-t border-[#E5EAED]" />

          {/* Bottom Bar: Copyright on left, Legal links on right */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-7 font-outfit text-xs sm:text-[13px] text-[#74818A]">
            <p>© 2026 Phuket Tours. All rights reserved.</p>
            <div className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/privacy-policy"
                className="hover:text-[#18282A] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#18282A] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-[#18282A] transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

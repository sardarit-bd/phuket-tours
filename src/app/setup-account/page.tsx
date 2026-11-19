import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SetupAccountForm } from "./setup-account-form";

export const metadata: Metadata = {
  title: "Account Setup — PhuketTours",
  description:
    "Set up your PhuketTours staff account password to begin managing operations, reservations, and guest experiences.",
};

export default function SetupAccountPage() {
  return (
    <main className="w-full bg-[#F8FAFB] pt-4 pb-8 sm:pt-6 sm:pb-10 lg:min-h-[calc(100vh-var(--navbar-height,5rem))] lg:py-16 lg:flex lg:flex-col lg:justify-center">
      <Container className="max-w-[1320px] lg:px-0">
        {/* Back Link */}
        <div className="mb-3 sm:mb-4 mx-auto max-w-[480px]">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md py-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Setup Card */}
        <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-border bg-white p-6 sm:p-9 shadow-xs">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="PhuketTours Homepage"
            >
              <Image
                src="/images/logo/Logo.png"
                alt="PhuketTours"
                width={160}
                height={37}
                className="h-8 w-auto mx-auto object-contain"
                priority
              />
            </Link>

            <h1 className="mt-5 font-outfit text-2xl sm:text-[28px] font-bold text-[#18282A] tracking-tight">
              Staff Account Setup
            </h1>
            <p className="mt-1.5 font-outfit text-xs sm:text-sm text-[#74818A] leading-relaxed">
              Create your confidential password to activate your PhuketTours administrative account.
            </p>
          </div>

          {/* Dynamic Content Wrapped in Suspense */}
          <Suspense
            fallback={
              <div
                className="h-48 w-full animate-pulse rounded-lg bg-muted/30"
                aria-label="Loading account setup..."
              />
            }
          >
            <SetupAccountForm />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}

import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about Phuket boat tours, weather policies, and booking terms.",
};

const faqs = [
  {
    q: "What is your bad weather and cancellation policy?",
    a: "If a tour is cancelled due to adverse weather or marine conditions by the harbor master, you will receive a 100% full refund or free rescheduling to another date.",
  },
  {
    q: "Is hotel pick-up and drop-off included?",
    a: "Yes, complimentary round-trip transfers from Patong, Kata, Karon, and Phuket Town are included in most standard tour packages.",
  },
  {
    q: "What should I bring on an island-hopping tour?",
    a: "We recommend sunscreen, sunglasses, swimwear, towel, beach footwear, waterproof camera bag, and personal pocket money for national park souvenirs.",
  },
  {
    q: "Are national park entrance fees included in the price?",
    a: "Unless explicitly stated as an optional cash fee on site, all national park fees are detailed upfront in the booking price breakdown with zero hidden surprises.",
  },
];

export default function FaqPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <SectionHeader
          badge="Help & Guidance"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know before booking your Phuket island adventure."
          align="left"
        />

        <div className="space-y-4 max-w-3xl">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs"
            >
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                {faq.q}
              </h3>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

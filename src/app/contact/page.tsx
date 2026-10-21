import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/components/contact-form";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the PhuketTours support team for custom charters and bookings.",
};

export default function ContactPage() {
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
          badge="Direct Support"
          title="We're Here to Help"
          subtitle="Have questions regarding custom private charters, weather reports, or hotel pickups? Reach out to our Phuket team."
          align="left"
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Direct Desk</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{siteConfig.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{siteConfig.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{siteConfig.contact.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{siteConfig.contact.hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form (Client Component) */}
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}

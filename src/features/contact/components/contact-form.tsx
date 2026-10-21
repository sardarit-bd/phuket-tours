"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xs">
      <h3 className="text-lg font-semibold text-foreground">Send a Message</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Our response team will get back to you within 2 hours.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground">Your Name</label>
          <Input placeholder="John Doe" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <Input type="email" placeholder="john@example.com" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">Message</label>
          <textarea
            rows={4}
            placeholder="How can we assist you with your Phuket trip?"
            className="mt-1 w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <Button size="default" className="w-full">
          Send Message
        </Button>
      </form>
    </div>
  );
}

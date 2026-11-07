"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { SuccessAlert, ErrorAlert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const validate = (): boolean => {
    const errs: ContactErrors = {};
    if (!name.trim()) {
      errs.name = "Your name is required.";
    } else if (name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!message.trim()) {
      errs.message = "Message cannot be empty.";
    } else if (message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSuccess(false);
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Direct inquiry simulation / placeholder API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setErrors({
        general: "Unable to deliver your message right now. Please try again or contact us via direct email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-xs">
      <h3 className="text-lg font-semibold text-foreground">Send a Message</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Our response team will get back to you within 2 hours.
      </p>

      {isSuccess && (
        <SuccessAlert
          className="mt-4"
          title="Message Sent!"
          description="Thank you for reaching out. A Phuket travel specialist will follow up shortly."
        />
      )}

      {errors.general && (
        <ErrorAlert
          className="mt-4"
          description={errors.general}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="contact-name" className="text-xs font-semibold text-foreground">Your Name</label>
          <Input
            id="contact-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={!!errors.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            disabled={isSubmitting}
            className="mt-1"
          />
          <FieldError id="contact-name-error" error={errors.name} />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-xs font-semibold text-foreground">Email Address</label>
          <Input
            id="contact-email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={!!errors.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            disabled={isSubmitting}
            className="mt-1"
          />
          <FieldError id="contact-email-error" error={errors.email} />
        </div>

        <div>
          <label htmlFor="contact-message" className="text-xs font-semibold text-foreground">Message</label>
          <textarea
            id="contact-message"
            rows={4}
            placeholder="How can we assist you with your Phuket trip?"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            disabled={isSubmitting}
            className={cn(
              "mt-1 w-full rounded-2xl border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground",
              errors.message
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
            )}
          />
          <FieldError id="contact-message-error" error={errors.message} />
        </div>

        <Button size="default" type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Sending...</span>
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  );
}

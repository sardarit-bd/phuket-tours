"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field-error";
import {
  useValidateResetTokenQuery,
  useResetPasswordMutation,
  useForgotPasswordMutation,
} from "@/features/auth/api/auth-api";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  email?: string;
  general?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // 1. Password Reset Request Form State (When NO token is present)
  const [requestEmail, setRequestEmail] = React.useState("");
  const [requestSent, setRequestSent] = React.useState(false);
  const [forgotPassword, { isLoading: isRequestingReset }] =
    useForgotPasswordMutation();

  // 2. Token Validation Query (When token IS present)
  const {
    data: validationData,
    isLoading: isValidating,
    isError: isValidationError,
  } = useValidateResetTokenQuery(token, {
    skip: !token,
  });

  // 3. Reset Password Mutation (When token IS present)
  const [resetPassword, { isLoading: isSubmitting }] =
    useResetPasswordMutation();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);

  // Auto redirect on success
  React.useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/sign-in");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, router]);

  // Handle forgot password submission
  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRequestingReset) return;

    if (!requestEmail || !requestEmail.trim()) {
      setErrors({ email: "Email address is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestEmail.trim())) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }

    setErrors({});

    try {
      await forgotPassword({ email: requestEmail.trim() }).unwrap();
      setRequestSent(true);
    } catch {
      // Security: Always show generic success state to prevent account enumeration
      setRequestSent(true);
    }
  };

  // ── MODE A: NO TOKEN PROVIDED (Forgot Password Request Mode) ───────────
  if (!token) {
    if (requestSent) {
      return (
        <div className="text-center py-6" data-testid="forgot-password-sent-state">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 mb-4">
            <Mail className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-[#18282A]">
            Check Your Email
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#74818A] leading-relaxed max-w-sm mx-auto">
            If an account exists for <strong className="text-[#18282A]">{requestEmail}</strong>, we have sent a secure password reset link. Please check your inbox and spam folder.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/sign-in" className="block">
              <Button className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs h-10">
                Return to Sign In
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => {
                setRequestSent(false);
                setRequestEmail("");
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Didn&apos;t receive it? Try another email
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full" data-testid="forgot-password-request-form">
        <form onSubmit={handleRequestSubmit} noValidate className="space-y-4">
          {errors.general && (
            <ErrorAlert className="mb-4" description={errors.general} />
          )}

          <div>
            <label
              htmlFor="request-email"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Account Email Address
            </label>
            <Input
              id="request-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. yourname@example.com"
              value={requestEmail}
              onChange={(e) => {
                setRequestEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "request-email-error" : undefined}
              error={!!errors.email}
              disabled={isRequestingReset}
            />
            <FieldError id="request-email-error" error={errors.email} />
          </div>

          <p className="text-[11px] text-[#74818A] leading-relaxed">
            Enter the email address associated with your PhuketTours account. We will send you a single-use link to choose a new password.
          </p>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isRequestingReset}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="request-reset-submit-btn"
            >
              {isRequestingReset ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── MODE B: TOKEN PROVIDED ──────────────────────────────────────────────

  // 1. Loading / Verifying Token State
  if (isValidating) {
    return (
      <div className="text-center py-10" data-testid="reset-loading-state">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-xs font-medium text-[#465457]">
          Verifying password reset credentials...
        </p>
      </div>
    );
  }

  // 2. Invalid or Expired Token State
  const isInvalidToken = isValidationError || !validationData?.data?.valid;
  if (isInvalidToken) {
    return (
      <div className="text-center py-6" data-testid="reset-invalid-state">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 mb-4">
          <AlertCircle className="h-6 w-6 text-rose-600" />
        </div>
        <h2 className="text-base font-semibold text-[#18282A]">
          Reset Link Expired or Invalid
        </h2>
        <p className="mt-2 text-xs text-[#74818A] leading-relaxed max-w-sm mx-auto">
          This password reset link is no longer valid. It may have expired (valid for 30 minutes), already been used, or been superseded by a newer request.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link href="/reset-password">
            <Button className="w-full rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold h-10">
              Request a New Reset Link
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full rounded-full border-[#E5EAED] text-xs font-medium text-[#18282A] h-10">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Success State
  if (isSuccess) {
    return (
      <div className="text-center py-6" data-testid="reset-success-state">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-[#18282A]">
          Password Reset Complete!
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#465457] leading-relaxed max-w-sm mx-auto">
          Your new password has been established successfully. All existing sessions have been signed out for security.
        </p>
        <div className="mt-6 space-y-2">
          <Button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-semibold h-11"
            data-testid="reset-signin-cta"
          >
            Sign In with New Password
          </Button>
          <p className="text-[11px] text-[#8A9A9C]">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    );
  }

  // 4. Active Reset Form (Entering new password)
  const targetUser = validationData?.data?.user;

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = "New password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validatePasswordForm()) {
      return;
    }

    setErrors({});

    try {
      await resetPassword({
        token,
        password,
      }).unwrap();

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrors({
        general: getAuthErrorMessage(err),
      });
    }
  };

  return (
    <div className="w-full" data-testid="reset-active-form">
      {/* Target User Identifier Header */}
      {targetUser && (
        <div className="mb-5 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3F5] text-[#176779]">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#18282A] truncate">
                {targetUser.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF3F5] text-[#176779] border border-[#A7D7E0]">
                <ShieldCheck className="h-3 w-3" />
                {targetUser.role.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-[#74818A] truncate">
              {targetUser.email}
            </p>
          </div>
        </div>
      )}

      {errors.general && (
        <ErrorAlert className="mb-4" description={errors.general} />
      )}

      <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
        {/* New Password Field */}
        <div>
          <label
            htmlFor="reset-password-input"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="reset-password-input"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter at least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
              error={!!errors.password}
              className="pr-11"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer transition-colors"
              tabIndex={0}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <FieldError id="reset-password-error" error={errors.password} />
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label
            htmlFor="reset-confirm-password-input"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              id="reset-confirm-password-input"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
              error={!!errors.confirmPassword}
              className="pr-11"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer transition-colors"
              tabIndex={0}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <FieldError id="reset-confirm-password-error" error={errors.confirmPassword} />
        </div>

        <p className="text-[11px] text-[#74818A] leading-relaxed">
          Must be at least 6 characters long. Choose a strong, confidential password.
        </p>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            data-testid="reset-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}


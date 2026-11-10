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
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field-error";
import {
  useValidateInvitationQuery,
  useSetupPasswordMutation,
} from "@/features/auth/api/auth-api";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function SetupAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    data: validationData,
    isLoading: isValidating,
    isError: isValidationError,
  } = useValidateInvitationQuery(token, {
    skip: !token,
  });

  const [setupPassword, { isLoading: isSubmitting }] =
    useSetupPasswordMutation();

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

  // 1. Missing Token State
  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200 mb-4">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-base font-semibold text-[#18282A]">
          Missing Invitation Link
        </h2>
        <p className="mt-2 text-xs text-[#74818A] leading-relaxed max-w-sm mx-auto">
          No setup token was detected. Please make sure you clicked the full link
          provided in your invitation email.
        </p>
        <div className="mt-6">
          <Link href="/sign-in">
            <Button className="w-full rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold h-10">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading / Verifying State
  if (isValidating) {
    return (
      <div className="text-center py-10" data-testid="setup-loading-state">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-xs font-medium text-[#465457]">
          Verifying your invitation credentials...
        </p>
      </div>
    );
  }

  // 3. Invalid or Expired Token State
  const isInvalidToken = isValidationError || !validationData?.data?.valid;
  if (isInvalidToken) {
    return (
      <div className="text-center py-6" data-testid="setup-invalid-state">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 mb-4">
          <AlertCircle className="h-6 w-6 text-rose-600" />
        </div>
        <h2 className="text-base font-semibold text-[#18282A]">
          Invitation Expired or Invalid
        </h2>
        <p className="mt-2 text-xs text-[#74818A] leading-relaxed max-w-sm mx-auto">
          This invitation link is no longer valid. It may have expired after 72
          hours, already been used, or been invalidated by a newer invitation.
        </p>
        <p className="mt-2 text-xs text-[#74818A] leading-relaxed">
          Please contact your administrator to receive a fresh invitation.
        </p>
        <div className="mt-6">
          <Link href="/sign-in">
            <Button className="w-full rounded-full bg-[#18282A] hover:bg-[#25393B] text-white text-xs font-semibold h-10">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Success State
  if (isSuccess) {
    return (
      <div className="text-center py-6" data-testid="setup-success-state">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-[#18282A]">
          Staff Account Activated!
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#465457] leading-relaxed max-w-sm mx-auto">
          Your confidential password has been established successfully. You can
          now sign in to access your administrative workspace.
        </p>
        <div className="mt-6 space-y-2">
          <Button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-semibold h-11"
          >
            Sign In Now
          </Button>
          <p className="text-[11px] text-[#8A9A9C]">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    );
  }

  // 5. Active Setup Form State
  const invitedUser = validationData?.data?.user;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setErrors({});

    try {
      await setupPassword({
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
    <div className="w-full" data-testid="setup-active-form">
      {/* Invited User Profile Header */}
      {invitedUser && (
        <div className="mb-5 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF3F5] text-[#176779]">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#18282A] truncate">
                {invitedUser.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF3F5] text-[#176779] border border-[#A7D7E0]">
                <ShieldCheck className="h-3 w-3" />
                {invitedUser.role.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-[#74818A] truncate">
              {invitedUser.email}
            </p>
          </div>
        </div>
      )}

      {/* General error alert */}
      {errors.general && (
        <ErrorAlert
          className="mb-4"
          description={errors.general}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Password Field */}
        <div>
          <label
            htmlFor="setup-password"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Create Password
          </label>
          <div className="relative">
            <Input
              id="setup-password"
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
              aria-describedby={errors.password ? "setup-password-error" : undefined}
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
          <FieldError id="setup-password-error" error={errors.password} />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="setup-confirm-password"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="setup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
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
              aria-describedby={errors.confirmPassword ? "setup-confirm-password-error" : undefined}
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
          <FieldError id="setup-confirm-password-error" error={errors.confirmPassword} />
        </div>

        {/* Requirements helper */}
        <p className="text-[11px] text-[#74818A] leading-relaxed">
          Must be at least 6 characters long. Keep your credentials confidential.
        </p>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Activating Account...</span>
              </>
            ) : (
              <span>Activate & Complete Setup</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

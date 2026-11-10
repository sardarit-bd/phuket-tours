"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field-error";
import { useRegisterMutation } from "@/features/auth/api/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/slices/auth-slice";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function SignUpForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading: isMutationLoading }] = useRegisterMutation();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isLoading = isSubmitting || isMutationLoading;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password,
      }).unwrap();

      dispatch(setCredentials(response.data));
      setSuccessMessage("Account created successfully! Redirecting...");

      router.push("/dashboard");
    } catch (err: unknown) {
      setErrors({
        general: getAuthErrorMessage(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* General error alert */}
      {errors.general && (
        <ErrorAlert
          className="mb-4"
          description={errors.general}
        />
      )}

      {/* Success alert */}
      {successMessage && (
        <SuccessAlert
          className="mb-4"
          description={successMessage}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            error={!!errors.fullName}
            disabled={isLoading}
          />
          <FieldError id="fullName-error" error={errors.fullName} />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            error={!!errors.email}
            disabled={isLoading}
          />
          <FieldError id="email-error" error={errors.email} />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              error={!!errors.password}
              className="pr-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer transition-colors"
              tabIndex={0}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <FieldError id="password-error" error={errors.password} />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </div>
      </form>

      {/* Link to Sign In */}
      <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminSettingsView } from "./admin-settings-view";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type { SystemSettingsOverview } from "../../types/admin-settings";

const MOCK_SETTINGS_OVERVIEW: SystemSettingsOverview = {
  general: {
    platformName: "PhuketTours",
    supportEmail: "support@phukettours.com",
    supportPhone: "+66 76 123 4567",
    defaultCurrency: "THB",
    timezone: "Asia/Bangkok",
    defaultLanguage: "en",
    maintenanceMode: false,
    isCustomized: true,
  },
  payment: {
    providerName: "Stripe",
    enabled: true,
    environment: "sandbox",
    publishableKey: "pk_test_1234567890",
    hasSecretKey: true,
    maskedSecretKey: "••••••••••••3210",
    merchantId: "acct_test123",
    isCustomized: true,
  },
  webhook: {
    endpointUrl: "https://api.phukettours.com/api/v1/webhooks/payment",
    hasSigningSecret: true,
    maskedSigningSecret: "••••••••••••whsec",
    enabled: true,
    lastEventAt: "2026-11-02T10:00:00.000Z",
    lastEventType: "payment_intent.succeeded",
    lastVerifiedAt: "2026-11-02T10:00:00.000Z",
    lastEventStatus: "VERIFIED",
    isCustomized: true,
  },
  cloudinary: {
    cloudName: "dg83pvgls",
    apiKey: "123456789012345",
    hasApiSecret: true,
    maskedApiSecret: "••••••••••••abcd",
    folder: "phukettours/tours",
    maxFileSizeBytes: 10 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
    connectionStatus: "VERIFIED",
    lastVerifiedAt: "2026-11-02T09:30:00.000Z",
    isCustomized: true,
  },
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "noreply@phukettours.com",
    hasPass: true,
    maskedPass: "••••••••••••pass",
    fromEmail: "noreply@phukettours.com",
    fromName: "PhuketTours",
    enabled: true,
    connectionStatus: "VERIFIED",
    lastVerifiedAt: "2026-11-02T09:30:00.000Z",
    isCustomized: true,
  },
  serverTime: "2026-11-02T17:00:00.000Z",
};

const MOCK_AUDIT_RESPONSE = {
  logs: [
    {
      id: "log-1",
      category: "PAYMENT" as const,
      action: "UPDATE_PAYMENT_SETTINGS",
      actorId: "usr-admin-1",
      actorName: "Super Admin",
      actorEmail: "admin@phukettours.com",
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      status: "SUCCESS" as const,
      errorMessage: null,
      metadata: { environment: "sandbox" },
      createdAt: "2026-11-02T10:00:00.000Z",
    },
  ],
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

describe("AdminSettingsView Integration", () => {
  const mockUpdateGeneral = vi.fn();
  const mockUpdatePayment = vi.fn();
  const mockUpdateWebhook = vi.fn();
  const mockUpdateCloudinary = vi.fn();
  const mockTestCloudinary = vi.fn();
  const mockUpdateSmtp = vi.fn();
  const mockTestSmtp = vi.fn();
  const mockSendTestEmail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminApiModule, "useGetAdminSettingsQuery").mockReturnValue({
      data: { success: true, data: MOCK_SETTINGS_OVERVIEW },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminApiModule, "useGetAdminSettingAuditLogsQuery").mockReturnValue({
      data: { success: true, data: MOCK_AUDIT_RESPONSE },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminApiModule, "useUpdateAdminGeneralSettingsMutation").mockReturnValue([
      mockUpdateGeneral,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useUpdateAdminPaymentSettingsMutation").mockReturnValue([
      mockUpdatePayment,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useUpdateAdminWebhookSettingsMutation").mockReturnValue([
      mockUpdateWebhook,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useUpdateAdminCloudinarySettingsMutation").mockReturnValue([
      mockUpdateCloudinary,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useTestAdminCloudinaryConnectionMutation").mockReturnValue([
      mockTestCloudinary,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useUpdateAdminSmtpSettingsMutation").mockReturnValue([
      mockUpdateSmtp,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useTestAdminSmtpConnectionMutation").mockReturnValue([
      mockTestSmtp,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useSendAdminTestEmailMutation").mockReturnValue([
      mockSendTestEmail,
      { isLoading: false },
    ] as any);
  });

  it("renders the settings dashboard with all 7 navigation tabs", () => {
    render(<AdminSettingsView />);

    expect(screen.getByText("System Settings & Security Center")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Profile$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^General Settings$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Payment Gateway$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Webhook Configuration$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Cloudinary Settings$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Email & SMTP$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Security & Audit Logs$/i })).toBeInTheDocument();
  });

  it("renders General Settings initially and does NOT contain any native HTML select elements", () => {
    const { container } = render(<AdminSettingsView />);

    expect(screen.getByText("Platform & Brand Identity")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PhuketTours")).toBeInTheDocument();

    // Verify ZERO native HTML select elements
    const nativeSelects = container.querySelectorAll("select");
    expect(nativeSelects.length).toBe(0);

    // Verify CustomSelect comboboxes are used instead
    const customSelectButtons = screen.getAllByRole("combobox");
    expect(customSelectButtons.length).toBeGreaterThan(0);
  });

  it("switches to Payment Gateway tab and displays masked secret key safely", () => {
    render(<AdminSettingsView />);

    fireEvent.click(screen.getByRole("button", { name: /Payment Gateway/i }));

    expect(screen.getByText("Payment Gateway & Settlement Credentials")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Stripe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("pk_test_1234567890")).toBeInTheDocument();

    // Masked value should be visible
    expect(screen.getByText("••••••••••••3210")).toBeInTheDocument();
    expect(screen.getByText(/Key Saved & Active/i)).toBeInTheDocument();
  });

  it("switches to Webhook Configuration tab and allows copying endpoint URL", () => {
    render(<AdminSettingsView />);

    fireEvent.click(screen.getByRole("button", { name: /Webhook Configuration/i }));

    expect(
      screen.getByText("Payment Webhook & Asynchronous Event Processing")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("https://api.phukettours.com/api/v1/webhooks/payment")
    ).toBeInTheDocument();
    expect(screen.getByText(/Copy URL/i)).toBeInTheDocument();
  });

  it("switches to Cloudinary tab and provides test connection action", () => {
    render(<AdminSettingsView />);

    fireEvent.click(screen.getByRole("button", { name: /Cloudinary Settings/i }));

    expect(screen.getByText(/Cloudinary Media Storage Configuration/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("dg83pvgls")).toBeInTheDocument();
    expect(screen.getByText("••••••••••••abcd")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Test Cloudinary Connection/i })
    ).toBeInTheDocument();
  });

  it("switches to Email & SMTP tab and shows test connection & test email buttons", () => {
    render(<AdminSettingsView />);

    fireEvent.click(screen.getByRole("button", { name: /Email & SMTP/i }));

    expect(
      screen.getByText(/Email Delivery & SMTP Configuration/i)
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("smtp.gmail.com")).toBeInTheDocument();
    expect(screen.getByText("••••••••••••pass")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Test Connection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Test Email/i })).toBeInTheDocument();
  });

  it("switches to Security & Audit Logs tab and displays log history without native select", () => {
    const { container } = render(<AdminSettingsView />);

    fireEvent.click(screen.getByRole("button", { name: /Security & Audit Logs/i }));

    expect(
      screen.getByText(/Configuration Audit History & Security Log/i)
    ).toBeInTheDocument();
    expect(screen.getByText("UPDATE_PAYMENT_SETTINGS")).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();

    // Verify no native select in audit tab either
    const nativeSelects = container.querySelectorAll("select");
    expect(nativeSelects.length).toBe(0);
  });
});

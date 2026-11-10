import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgencyProfileForm } from "./agency-profile-form";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "../../api/agent-api";
import type { AgentProfileRecord } from "../../types/agent";

vi.mock("../../api/agent-api", () => ({
  useGetAgentProfileQuery: vi.fn(),
  useUpdateAgentProfileMutation: vi.fn(),
}));

const mockUseGetAgentProfileQuery = vi.mocked(useGetAgentProfileQuery);
const mockUseUpdateAgentProfileMutation = vi.mocked(
  useUpdateAgentProfileMutation
);

const AGENT_PROFILE: AgentProfileRecord = {
  id: "agent-1",
  name: "Somchai Agent",
  email: "somchai@andaman.com",
  phone: "+66 81 234 5678",
  role: "agent",
  status: "active",
  agencyName: "Andaman Travel Group",
  createdAt: "2026-01-15T09:00:00.000Z",
};

const mockUpdate = vi.fn();

function mockQuery(overrides: Partial<ReturnType<typeof useGetAgentProfileQuery>> = {}) {
  mockUseGetAgentProfileQuery.mockReturnValue({
    data: { success: true, message: "ok", data: AGENT_PROFILE },
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useGetAgentProfileQuery>);
}

describe("AgencyProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery();
    mockUseUpdateAgentProfileMutation.mockReturnValue([
      mockUpdate,
      { isLoading: false, error: undefined, reset: vi.fn() },
    ] as unknown as ReturnType<typeof useUpdateAgentProfileMutation>);
  });

  it("renders in view mode by default with read-only text", () => {
    render(<AgencyProfileForm />);

    expect(screen.getByTestId("agency-profile-page")).toBeInTheDocument();
    expect(screen.getByTestId("agency-profile-edit-btn")).toBeInTheDocument();
    expect(screen.getByTestId("agency-profile-name-view")).toHaveTextContent(
      "Somchai Agent"
    );
    expect(screen.getByTestId("agency-profile-phone-view")).toHaveTextContent(
      "+66 81 234 5678"
    );
    expect(screen.getByTestId("agency-profile-email-view")).toHaveTextContent(
      "somchai@andaman.com"
    );
    expect(screen.getByTestId("agency-profile-role-view")).toHaveTextContent(
      "Agent (B2B Partner)"
    );
    // The extra agent-only read-only fields render
    expect(screen.getByTestId("agency-profile-status-view")).toHaveTextContent(
      "active"
    );

    // No inputs in view mode
    expect(screen.queryByTestId("agency-profile-name-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("input-agency-name")).not.toBeInTheDocument();
    // Agency name renders as read-only text in view mode
    expect(
      screen.getByTestId("agency-profile-agencyName-view")
    ).toHaveTextContent("Andaman Travel Group");
  });

  it("converts editable fields to inputs in edit mode and keeps restricted fields read-only", () => {
    render(<AgencyProfileForm />);

    fireEvent.click(screen.getByTestId("agency-profile-edit-btn"));

    expect(screen.getByTestId("agency-profile-name-input")).toHaveValue("Somchai Agent");
    expect(screen.getByTestId("input-agency-name")).toHaveValue("Andaman Travel Group");
    expect(screen.getByTestId("agency-profile-phone-input")).toHaveValue("+66 81 234 5678");

    // Restricted fields remain read-only
    expect(screen.getByTestId("agency-profile-email-view")).toHaveTextContent(
      "somchai@andaman.com"
    );
    expect(screen.getByTestId("agency-profile-role-view")).toBeInTheDocument();
  });

  it("disables Save when nothing is dirty and enables it after a change", () => {
    render(<AgencyProfileForm />);

    fireEvent.click(screen.getByTestId("agency-profile-edit-btn"));
    expect(screen.getByTestId("agency-profile-save-btn")).toBeDisabled();

    fireEvent.change(screen.getByTestId("agency-profile-name-input"), {
      target: { value: "Updated Agent" },
    });
    expect(screen.getByTestId("agency-profile-save-btn")).not.toBeDisabled();
  });

  it("saves via the agent profile endpoint and returns to view mode", async () => {
    mockUpdate.mockReturnValue({ unwrap: async () => AGENT_PROFILE });
    render(<AgencyProfileForm />);

    fireEvent.click(screen.getByTestId("agency-profile-edit-btn"));
    fireEvent.change(screen.getByTestId("agency-profile-name-input"), {
      target: { value: "Updated Agent" },
    });
    fireEvent.click(screen.getByTestId("agency-profile-save-btn"));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        name: "Updated Agent",
        agencyName: "Andaman Travel Group",
        phone: "+66 81 234 5678",
      })
    );
    await waitFor(() =>
      expect(screen.getByTestId("agency-profile-edit-btn")).toBeInTheDocument()
    );
    expect(screen.getByTestId("agency-profile-saved")).toBeInTheDocument();
  });

  it("discards changes on Cancel", () => {
    render(<AgencyProfileForm />);

    fireEvent.click(screen.getByTestId("agency-profile-edit-btn"));
    fireEvent.change(screen.getByTestId("agency-profile-name-input"), {
      target: { value: "Discarded" },
    });
    fireEvent.click(screen.getByTestId("agency-profile-cancel-btn"));

    expect(screen.getByTestId("agency-profile-name-view")).toHaveTextContent(
      "Somchai Agent"
    );
  });

  it("blocks save with an empty name (validation preserved)", async () => {
    render(<AgencyProfileForm />);

    fireEvent.click(screen.getByTestId("agency-profile-edit-btn"));
    fireEvent.change(screen.getByTestId("agency-profile-name-input"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByTestId("agency-profile-save-btn"));

    await waitFor(() =>
      expect(screen.getByTestId("agency-profile-save-error")).toHaveTextContent(
        /name is required/i
      )
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("renders a loading state while the profile loads", () => {
    mockQuery({ data: undefined, isLoading: true });
    render(<AgencyProfileForm />);
    expect(screen.getByTestId("agency-profile-loading")).toBeInTheDocument();
  });

  it("renders an error state when the profile fails to load", () => {
    mockQuery({ data: undefined, isError: true, error: new Error("boom") });
    render(<AgencyProfileForm />);
    expect(screen.getByTestId("agency-profile-load-error")).toBeInTheDocument();
  });
});

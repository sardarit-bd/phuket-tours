import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileSettingsView } from "./profile-settings-view";

function Harness({
  initialProfile,
  onSave = vi.fn(async () => true),
  isSaving = false,
  saveError = null,
  isDirty = false,
}: {
  initialProfile: { name: string; email: string; phone: string | null } | null;
  onSave?: () => Promise<boolean>;
  isSaving?: boolean;
  saveError?: unknown;
  isDirty?: boolean;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const enterEdit = () => {
    if (initialProfile) {
      setName(initialProfile.name);
      setPhone(initialProfile.phone ?? "");
    }
  };

  return (
    <ProfileSettingsView
      profile={initialProfile}
      isProfileLoading={false}
      profileLoadError={null}
      onRefetchProfile={() => {}}
      draftName={name}
      draftPhone={phone}
      onDraftNameChange={setName}
      onDraftPhoneChange={setPhone}
      isDirty={isDirty}
      isSaving={isSaving}
      saveError={saveError}
      roleLabel="Administrator"
      badgeLabel="Admin"
      description="Manage your personal contact details."
      onEnterEdit={enterEdit}
      onHandleSave={onSave}
      onHandleCancel={() => {
        if (initialProfile) {
          setName(initialProfile.name);
          setPhone(initialProfile.phone ?? "");
        }
      }}
      testIdPrefix="profile-settings"
      extraReadonlyFields={
        <div>
          <span data-testid="profile-settings-status-view">active</span>
        </div>
      }
    />
  );
}

const PROFILE = {
  name: "Ada Admin",
  email: "ada@phukettours.com",
  phone: "+66 81 234 5678",
};

describe("ProfileSettingsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in view mode by default with read-only text, not inputs", () => {
    render(<Harness initialProfile={PROFILE} />);

    expect(screen.getByTestId("profile-settings-page")).toBeInTheDocument();
    expect(screen.getByTestId("profile-settings-edit-btn")).toBeInTheDocument();
    expect(screen.getByTestId("profile-settings-name-view")).toHaveTextContent("Ada Admin");
    expect(screen.getByTestId("profile-settings-phone-view")).toHaveTextContent("+66 81 234 5678");
    expect(screen.getByTestId("profile-settings-email-view")).toHaveTextContent("ada@phukettours.com");
    expect(screen.getByTestId("profile-settings-role-view")).toHaveTextContent("Administrator");

    // No editable inputs in view mode
    expect(screen.queryByTestId("profile-settings-name-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-settings-phone-input")).not.toBeInTheDocument();
    // No save/cancel actions in view mode
    expect(screen.queryByTestId("profile-settings-save-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-settings-cancel-btn")).not.toBeInTheDocument();
  });

  it("switches to edit mode when Edit Profile is clicked", () => {
    render(<Harness initialProfile={PROFILE} />);

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));

    expect(screen.getByTestId("profile-settings-name-input")).toHaveValue("Ada Admin");
    expect(screen.getByTestId("profile-settings-phone-input")).toHaveValue("+66 81 234 5678");
    expect(screen.getByTestId("profile-settings-save-btn")).toBeInTheDocument();
    expect(screen.getByTestId("profile-settings-cancel-btn")).toBeInTheDocument();
    // Restricted fields stay read-only even in edit mode
    expect(screen.getByTestId("profile-settings-email-view")).toHaveTextContent("ada@phukettours.com");
    expect(screen.getByTestId("profile-settings-role-view")).toHaveTextContent("Administrator");
  });

  it("disables Save when no changes have been made (dirty state)", () => {
    render(<Harness initialProfile={PROFILE} isDirty={false} />);

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));

    expect(screen.getByTestId("profile-settings-save-btn")).toBeDisabled();
    expect(screen.getByText(/No changes yet/i)).toBeInTheDocument();
  });

  it("enables Save when a change is tracked", () => {
    render(<Harness initialProfile={PROFILE} isDirty={true} />);

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));

    expect(screen.getByTestId("profile-settings-save-btn")).not.toBeDisabled();
    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
  });

  it("shows a loading skeleton while profile is loading", () => {
    render(
      <ProfileSettingsView
        profile={null}
        isProfileLoading={true}
        profileLoadError={null}
        onRefetchProfile={() => {}}
        draftName=""
        draftPhone=""
        onDraftNameChange={() => {}}
        onDraftPhoneChange={() => {}}
        isDirty={false}
        isSaving={false}
        saveError={null}
        roleLabel="Staff"
        badgeLabel="Staff"
        description="Manage your contact details."
        onEnterEdit={() => {}}
        onHandleSave={async () => true}
        onHandleCancel={() => {}}
        testIdPrefix="profile-settings"
      />
    );

    expect(screen.getByTestId("profile-settings-loading")).toBeInTheDocument();
  });

  it("shows a load error state with retry", () => {
    const onRefetch = vi.fn();
    render(
      <ProfileSettingsView
        profile={null}
        isProfileLoading={false}
        profileLoadError={new Error("boom")}
        onRefetchProfile={onRefetch}
        draftName=""
        draftPhone=""
        onDraftNameChange={() => {}}
        onDraftPhoneChange={() => {}}
        isDirty={false}
        isSaving={false}
        saveError={null}
        roleLabel="Staff"
        badgeLabel="Staff"
        description="Manage your contact details."
        onEnterEdit={() => {}}
        onHandleSave={async () => true}
        onHandleCancel={() => {}}
        testIdPrefix="profile-settings"
      />
    );

    expect(screen.getByTestId("profile-settings-load-error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows saving state and returns to view mode after a successful save", async () => {
    const onSave = vi.fn(async () => true);
    const { rerender } = render(<Harness initialProfile={PROFILE} isDirty={true} onSave={onSave} />);

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));
    fireEvent.click(screen.getByTestId("profile-settings-save-btn"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // Returns to view mode
    await waitFor(() =>
      expect(screen.getByTestId("profile-settings-edit-btn")).toBeInTheDocument()
    );
    expect(screen.getByTestId("profile-settings-saved")).toBeInTheDocument();

    rerender(<Harness initialProfile={PROFILE} isDirty={true} onSave={onSave} />);
  });

  it("stays in edit mode and shows an error banner when save fails", async () => {
    const onSave = vi.fn(async () => false);
    render(
      <Harness
        initialProfile={PROFILE}
        isDirty={true}
        onSave={onSave}
        saveError={{ message: "Server rejected the update." }}
      />
    );

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));
    fireEvent.click(screen.getByTestId("profile-settings-save-btn"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // Still in edit mode
    expect(screen.getByTestId("profile-settings-save-btn")).toBeInTheDocument();
    expect(screen.getByTestId("profile-settings-save-error")).toHaveTextContent(
      "Server rejected the update."
    );
  });

  it("discards unsaved changes and returns to view mode on Cancel", () => {
    render(<Harness initialProfile={PROFILE} />);

    fireEvent.click(screen.getByTestId("profile-settings-edit-btn"));
    fireEvent.change(screen.getByTestId("profile-settings-name-input"), {
      target: { value: "Changed Name" },
    });
    expect(screen.getByTestId("profile-settings-name-input")).toHaveValue("Changed Name");

    fireEvent.click(screen.getByTestId("profile-settings-cancel-btn"));

    expect(screen.getByTestId("profile-settings-edit-btn")).toBeInTheDocument();
    expect(screen.getByTestId("profile-settings-name-view")).toHaveTextContent("Ada Admin");
  });
});

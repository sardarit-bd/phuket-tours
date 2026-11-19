import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManagePermissionsDialog } from "./manage-permissions-dialog";
import type { AdminUserRecord } from "../../types/admin-users";
import type {
  AdminPermissionsCatalogResponse,
  StaffPermissionsResponse,
} from "../../types/admin-permissions";

const MOCK_STAFF: AdminUserRecord = {
  id: "staff-uuid-1",
  name: "Sarah Staff",
  email: "sarah@phukettours.com",
  phone: "+66 81 222 3333",
  role: "staff",
  status: "active",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  agentProfile: null,
};

const MOCK_CATALOG: AdminPermissionsCatalogResponse = {
  success: true,
  data: {
    totalPermissions: 4,
    modules: [
      {
        module: "tours",
        permissions: [
          {
            id: "tours.view",
            module: "tours",
            name: "View Tours",
            description: "View tour packages",
          },
          {
            id: "tours.create",
            module: "tours",
            name: "Create Tours",
            description: "Create new tour packages",
          },
        ],
      },
      {
        module: "bookings",
        permissions: [
          {
            id: "bookings.view",
            module: "bookings",
            name: "View Bookings",
            description: "View customer bookings",
          },
          {
            id: "bookings.assign",
            module: "bookings",
            name: "Assign Bookings",
            description: "Assign bookings to staff",
          },
        ],
      },
    ],
  },
};

const MOCK_STAFF_PERMS: StaffPermissionsResponse = {
  success: true,
  data: {
    staffId: "staff-uuid-1",
    staffName: "Sarah Staff",
    staffEmail: "sarah@phukettours.com",
    permissions: ["tours.view", "bookings.view"],
  },
};

const mockUpdateStaffPermissions = vi.fn();
let mockCatalogQuery = vi.fn();
let mockStaffQuery = vi.fn();

vi.mock("../../api/admin-api", () => ({
  useGetAdminPermissionsQuery: vi.fn(() => mockCatalogQuery()),
  useGetStaffPermissionsQuery: vi.fn(() => mockStaffQuery()),
  useUpdateStaffPermissionsMutation: vi.fn(() => [
    mockUpdateStaffPermissions,
    { isLoading: false },
  ]),
}));

describe("ManagePermissionsDialog", () => {
  const mockClose = vi.fn();
  const mockSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockCatalogQuery = vi.fn(() => ({
      data: MOCK_CATALOG,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }));

    mockStaffQuery = vi.fn(() => ({
      data: MOCK_STAFF_PERMS,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }));

    mockUpdateStaffPermissions.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Staff permissions successfully updated",
      }),
    });
  });

  it("does not render when isOpen is false", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={false}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.queryByTestId("manage-permissions-dialog")).not.toBeInTheDocument();
  });

  it("renders staff header information and module groups", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.getByTestId("manage-permissions-dialog")).toBeInTheDocument();
    expect(screen.getByText("Manage Staff Permissions")).toBeInTheDocument();
    expect(screen.getByText("Sarah Staff")).toBeInTheDocument();
    expect(screen.getByText(/sarah@phukettours\.com/)).toBeInTheDocument();

    // Module headers
    expect(screen.getByText("Tours & Inventory")).toBeInTheDocument();
    expect(screen.getByText("Bookings & Operations")).toBeInTheDocument();

    // Permissions
    expect(screen.getByText("View Tours")).toBeInTheDocument();
    expect(screen.getByText("Create Tours")).toBeInTheDocument();
    expect(screen.getByText("View Bookings")).toBeInTheDocument();
    expect(screen.getByText("Assign Bookings")).toBeInTheDocument();
  });

  it("marks currently assigned permissions as checked", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    const toursViewCheckbox = screen.getByTestId("perm-checkbox-tours.view");
    const toursCreateCheckbox = screen.getByTestId("perm-checkbox-tours.create");
    const bookingsViewCheckbox = screen.getByTestId("perm-checkbox-bookings.view");
    const bookingsAssignCheckbox = screen.getByTestId("perm-checkbox-bookings.assign");

    expect(toursViewCheckbox).toBeChecked();
    expect(toursCreateCheckbox).not.toBeChecked();
    expect(bookingsViewCheckbox).toBeChecked();
    expect(bookingsAssignCheckbox).not.toBeChecked();
  });

  it("allows toggling permissions and displays unsaved changes indicator", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Initial state: no unsaved changes indicator
    expect(screen.queryByTestId("unsaved-changes-badge")).not.toBeInTheDocument();

    const toursCreateCheckbox = screen.getByTestId("perm-checkbox-tours.create");
    fireEvent.click(toursCreateCheckbox);

    // Now unsaved changes badge should appear
    expect(screen.getByTestId("unsaved-changes-badge")).toBeInTheDocument();
  });

  it("selects all and deselects all permissions within a module", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Click module toggle button on Tours module (initially "Select All" since 1 of 2 is checked)
    const toggleTours = screen.getByTestId("module-toggle-tours");
    fireEvent.click(toggleTours);

    expect(screen.getByTestId("perm-checkbox-tours.view")).toBeChecked();
    expect(screen.getByTestId("perm-checkbox-tours.create")).toBeChecked();

    // Click module toggle button again (now "Clear" since all are checked)
    fireEvent.click(toggleTours);

    expect(screen.getByTestId("perm-checkbox-tours.view")).not.toBeChecked();
    expect(screen.getByTestId("perm-checkbox-tours.create")).not.toBeChecked();
  });

  it("filters permissions using the search input", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    const searchInput = screen.getByTestId("permissions-search-input");
    fireEvent.change(searchInput, { target: { value: "create" } });

    expect(screen.getByText("Create Tours")).toBeInTheDocument();
    expect(screen.queryByText("Assign Bookings")).not.toBeInTheDocument();
  });

  it("saves updated permissions and calls onSuccess and onClose", async () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Toggle tours.create to true
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));

    // Click Save Changes
    const saveButton = screen.getByTestId("save-permissions-btn");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateStaffPermissions).toHaveBeenCalledWith({
        staffId: "staff-uuid-1",
        permissions: expect.arrayContaining(["tours.view", "bookings.view", "tours.create"]),
      });
      expect(mockSuccess).toHaveBeenCalledWith("Permissions for Sarah Staff updated successfully.");
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("displays error message when update mutation rejects", async () => {
    mockUpdateStaffPermissions.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: "Cannot assign unknown permission" },
      }),
    });

    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Toggle to trigger change
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));

    // Save
    fireEvent.click(screen.getByTestId("save-permissions-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("permissions-error-banner")).toBeInTheDocument();
      expect(screen.getByText("Cannot assign unknown permission")).toBeInTheDocument();
    });
  });

  it("does not show the module-view reminder when module-view permissions are selected", () => {
    // Default mock grants tours.view + bookings.view (both module-view).
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.queryByTestId("module-view-reminder")).not.toBeInTheDocument();
  });

  it("shows the module-view reminder when only action-only permissions are selected", () => {
    mockStaffQuery = vi.fn(() => ({
      data: {
        success: true,
        data: {
          staffId: "staff-uuid-1",
          staffName: "Sarah Staff",
          staffEmail: "sarah@phukettours.com",
          permissions: ["tours.create", "media.upload"],
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }));

    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.getByTestId("module-view-reminder")).toBeInTheDocument();
    expect(screen.getByText("No Module Access Yet")).toBeInTheDocument();
  });

  it("does not show the reminder when a module-view permission is present", () => {
    mockStaffQuery = vi.fn(() => ({
      data: {
        success: true,
        data: {
          staffId: "staff-uuid-1",
          staffName: "Sarah Staff",
          staffEmail: "sarah@phukettours.com",
          permissions: ["dashboard.view", "tours.view"],
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }));

    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.queryByTestId("module-view-reminder")).not.toBeInTheDocument();
  });

  it("renders catalog error state with retry button", () => {
    mockCatalogQuery = vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    }));

    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    expect(screen.getByTestId("permissions-error-state")).toBeInTheDocument();
    expect(screen.getByText("Unable to load permissions")).toBeInTheDocument();
    expect(screen.getByTestId("retry-permissions-btn")).toBeInTheDocument();
  });

  it("does not show the confirmation dialog when closing with no unsaved changes", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // No unsaved changes initially, so clicking Cancel should close without confirmation.
    fireEvent.click(screen.getByTestId("cancel-permissions-btn"));

    expect(screen.queryByTestId("discard-changes-confirm")).not.toBeInTheDocument();
    expect(mockClose).toHaveBeenCalled();
  });

  it("shows the in-app confirmation dialog when closing with unsaved changes", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Toggle a permission to create unsaved changes.
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));

    // Click Cancel (which now funnels through handleRequestClose).
    fireEvent.click(screen.getByTestId("cancel-permissions-btn"));

    // The custom confirmation dialog should be visible.
    expect(screen.getByTestId("discard-changes-confirm")).toBeInTheDocument();
    expect(screen.getByText("Discard Unsaved Changes?")).toBeInTheDocument();

    // The outer dialog should not have closed yet.
    expect(mockClose).not.toHaveBeenCalled();
  });

  it("Keep Editing closes the confirmation but keeps the dialog open with changes preserved", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Create unsaved changes.
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));
    expect(screen.getByTestId("perm-checkbox-tours.create")).toBeChecked();

    // Trigger the confirmation via Cancel.
    fireEvent.click(screen.getByTestId("cancel-permissions-btn"));
    expect(screen.getByTestId("discard-changes-confirm")).toBeInTheDocument();

    // Click "Keep Editing" — confirmation closes, outer dialog stays open, change preserved.
    fireEvent.click(screen.getByTestId("keep-editing-btn"));
    expect(screen.queryByTestId("discard-changes-confirm")).not.toBeInTheDocument();
    expect(mockClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("perm-checkbox-tours.create")).toBeChecked();
  });

  it("Discard Changes closes the dialog and resets local selection", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Create unsaved changes (tours.create added).
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));
    expect(screen.getByTestId("unsaved-changes-badge")).toBeInTheDocument();

    // Trigger the confirmation.
    fireEvent.click(screen.getByTestId("cancel-permissions-btn"));
    expect(screen.getByTestId("discard-changes-confirm")).toBeInTheDocument();

    // Click "Discard Changes".
    fireEvent.click(screen.getByTestId("discard-changes-btn"));

    // The outer dialog closes; the parent's onClose is called.
    expect(mockClose).toHaveBeenCalled();
    expect(screen.queryByTestId("discard-changes-confirm")).not.toBeInTheDocument();
  });

  it("Escape key while confirmation is open dismisses the confirmation (Keep Editing behavior)", () => {
    render(
      <ManagePermissionsDialog
        staff={MOCK_STAFF}
        isOpen={true}
        onClose={mockClose}
        onSuccess={mockSuccess}
      />
    );

    // Create unsaved changes and open the confirmation via Cancel.
    fireEvent.click(screen.getByTestId("perm-checkbox-tours.create"));
    fireEvent.click(screen.getByTestId("cancel-permissions-btn"));
    expect(screen.getByTestId("discard-changes-confirm")).toBeInTheDocument();

    // The X button on the confirmation (aria-label "Keep editing") closes only the confirmation.
    const keepEditingX = screen.getByRole("button", { name: "Keep editing" });
    fireEvent.click(keepEditingX);
    expect(screen.queryByTestId("discard-changes-confirm")).not.toBeInTheDocument();
    expect(mockClose).not.toHaveBeenCalled();
  });
});

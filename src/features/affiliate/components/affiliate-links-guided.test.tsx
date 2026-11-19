import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AffiliateLinksView } from "./affiliate-links-view";
import type { Tour } from "@/features/tours/types/tour";

const mockTours: Tour[] = [
  {
    id: "tour-uuid-1",
    slug: "phi-phi-island-deluxe",
    title: "Phi Phi Island Speedboat Adventure",
    description: "Full day island tour with snorkeling",
    categoryId: "cat-1",
    categoryName: "Island Tours",
    images: ["https://images.example.com/phi-phi.jpg"],
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phi Phi Islands",
    destinationCategory: "phi-phi-islands",
    tourType: "island-tours",
    price: { amount: 3200, currency: "THB", hasPrice: true },
  },
  {
    id: "tour-uuid-2",
    slug: "james-bond-island-tour",
    title: "James Bond Island Cruise",
    description: "Canoeing through Phang Nga Bay limestone caves",
    categoryId: "cat-1",
    categoryName: "Island Tours",
    images: ["https://images.example.com/james-bond.jpg"],
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "James Bond Island",
    destinationCategory: "james-bond-island",
    tourType: "island-tours",
    price: { amount: 2800, currency: "THB", hasPrice: true },
  },
];

const mockLinks = [
  {
    id: "link-1",
    affiliateId: "aff-1",
    label: "Instagram Bio Link",
    tourId: null,
    targetPath: "/",
    isActive: true,
    clickCount: 125,
    createdAt: "2026-11-18T10:00:00Z",
  },
  {
    id: "link-2",
    affiliateId: "aff-1",
    label: "Phi Phi Island Speedboat Adventure",
    tourId: "tour-uuid-1",
    targetPath: "/tours/tour-uuid-1",
    isActive: true,
    clickCount: 54,
    createdAt: "2026-11-19T08:00:00Z",
  },
  {
    id: "link-3",
    affiliateId: "aff-1",
    label: "Old Facebook Post",
    tourId: null,
    targetPath: "/",
    isActive: false,
    clickCount: 88,
    createdAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "link-url-bug",
    affiliateId: "aff-1",
    label: "http://localhost:3000/tours/phi-phi",
    tourId: "tour-uuid-1",
    targetPath: "/tours/tour-uuid-1",
    isActive: true,
    clickCount: 12,
    createdAt: "2026-11-17T10:00:00Z",
  },
];

const mockCreateLink = vi.fn();
const mockUpdateLink = vi.fn();
const mockDeleteLink = vi.fn();

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetToursQuery: vi.fn(() => ({
    data: { data: mockTours, total: 2, page: 1, limit: 10, totalPages: 1 },
    isLoading: false,
    isFetching: false,
    isError: false,
  })),
}));

vi.mock("../api/affiliate-api", () => ({
  useGetMyAffiliateLinksQuery: vi.fn(),
  useCreateMyAffiliateLinkMutation: vi.fn(() => [
    mockCreateLink,
    { isLoading: false },
  ]),
  useUpdateMyAffiliateLinkMutation: vi.fn(() => [
    mockUpdateLink,
    { isLoading: false },
  ]),
  useDeleteMyAffiliateLinkMutation: vi.fn(() => [
    mockDeleteLink,
    { isLoading: false },
  ]),
}));

import * as affiliateApiHooks from "../api/affiliate-api";

describe("AffiliateLinksView (Guided Non-Technical Experience)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(affiliateApiHooks.useGetMyAffiliateLinksQuery).mockReturnValue({
      data: {
        data: {
          code: "AFF1025",
          links: mockLinks,
        },
      },
      isLoading: false,
      isError: false,
    } as any);
  });

  it("renders guided sections: website link, guided generator, and saved links table", () => {
    render(<AffiliateLinksView />);

    expect(screen.getByRole("heading", { name: /Affiliate Referral Links/i })).toBeInTheDocument();
    expect(screen.getByText("Your Website Referral Link")).toBeInTheDocument();
    expect(screen.getByText("Create Affiliate Link")).toBeInTheDocument();
    expect(screen.getByText(/Saved Referral Links \(4\)/i)).toBeInTheDocument();
  });

  it("displays the general website referral link with ref query param", () => {
    render(<AffiliateLinksView />);

    const generalInput = screen.getByLabelText("Your Website Referral Link") as HTMLInputElement;
    expect(generalInput.value).toContain("/?ref=AFF1025");
  });

  it("fixes label mapping bug: formats raw URL label to user-friendly campaign name", () => {
    render(<AffiliateLinksView />);

    // Link with raw url label "http://localhost:3000/tours/phi-phi" should be mapped to "Specific Tour Campaign"
    expect(screen.getAllByText("Specific Tour Campaign").length).toBeGreaterThan(0);
  });

  it("generates a general website link with default fallback campaign label", async () => {
    mockCreateLink.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            id: "new-link-1",
            label: "PhuketTours Website",
            targetPath: "/",
            isActive: true,
            clickCount: 0,
          },
        }),
    });

    render(<AffiliateLinksView />);

    const generateBtn = screen.getByRole("button", { name: "Generate Affiliate Link" });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith({
        label: undefined,
        tourId: undefined,
      });
    });

    expect(await screen.findByText(/Link Ready: PhuketTours Website/i)).toBeInTheDocument();
  });

  it("allows selecting a specific tour and generates a tour-specific referral link", async () => {
    mockCreateLink.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          data: {
            id: "new-tour-link-1",
            label: "Phi Phi Island Speedboat Adventure",
            targetPath: "/tours/tour-uuid-1",
            isActive: true,
            clickCount: 0,
          },
        }),
    });

    render(<AffiliateLinksView />);

    // Click 'Specific Tour'
    const tourOptionBtn = screen.getByRole("button", { name: /Specific Tour/i });
    fireEvent.click(tourOptionBtn);

    // Tour selection step should now be visible
    expect(screen.getByText(/Select a Tour/i)).toBeInTheDocument();
    expect(screen.getAllByText("Phi Phi Island Speedboat Adventure")[0]).toBeInTheDocument();

    // Select the tour
    const selectTourButtons = screen.getAllByRole("button", { name: /Select/i });
    fireEvent.click(selectTourButtons[0]);

    // Fill an optional campaign name
    const campaignInput = screen.getByPlaceholderText(/Phi Phi Island Speedboat Adventure Campaign/i);
    fireEvent.change(campaignInput, { target: { value: "Instagram Reel 2026" } });

    // Click Generate Link
    const generateBtn = screen.getByRole("button", { name: "Generate Affiliate Link" });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith({
        label: "Instagram Reel 2026",
        tourId: "tour-uuid-1",
      });
    });
  });

  it("filters active and archived saved links", () => {
    render(<AffiliateLinksView />);

    expect(screen.getAllByText("Instagram Bio Link")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Old Facebook Post")[0]).toBeInTheDocument();

    // Switch to 'Active' tab
    const activeTabBtn = screen.getByRole("button", { name: /^Active/i });
    fireEvent.click(activeTabBtn);

    expect(screen.getAllByText("Instagram Bio Link")[0]).toBeInTheDocument();
    expect(screen.queryByText("Old Facebook Post")).not.toBeInTheDocument();

    // Switch to 'Archived' tab
    const archivedTabBtn = screen.getByRole("button", { name: /^Archived/i });
    fireEvent.click(archivedTabBtn);

    expect(screen.queryByText("Instagram Bio Link")).not.toBeInTheDocument();
    expect(screen.getAllByText("Old Facebook Post")[0]).toBeInTheDocument();
  });

  it("opens archive confirmation dialog and calls updateLink when confirmed", async () => {
    mockUpdateLink.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: "link-1", isActive: false } }),
    });

    render(<AffiliateLinksView />);

    const archiveButtons = screen.getAllByTitle("Archive Link");
    fireEvent.click(archiveButtons[0]);

    expect(screen.getByText("Archive Referral Link?")).toBeInTheDocument();
    expect(screen.getByText(/deactivates it for future visitor tracking/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Yes, Archive Link" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockUpdateLink).toHaveBeenCalledWith({
        id: "link-1",
        isActive: false,
      });
    });
  });

  it("opens delete confirmation dialog and calls deleteLink when confirmed", async () => {
    mockDeleteLink.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: "link-1", deleted: true } }),
    });

    render(<AffiliateLinksView />);

    const deleteButtons = screen.getAllByTitle("Delete Link");
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText("Delete Referral Link?")).toBeInTheDocument();
    expect(screen.getByText(/All historical clicks, referred bookings, and commission records will remain safely saved/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Yes, Delete Link" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteLink).toHaveBeenCalledWith("link-1");
    });
  });

  it("renders friendly empty state when affiliate has zero saved links", () => {
    vi.mocked(affiliateApiHooks.useGetMyAffiliateLinksQuery).mockReturnValue({
      data: {
        data: {
          code: "AFF1025",
          links: [],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AffiliateLinksView />);

    expect(screen.getByText("Your affiliate links will appear here.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create My First Link" })).toBeInTheDocument();
  });

  it("copies link to clipboard on Copy button click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<AffiliateLinksView />);

    const copyButtons = screen.getAllByRole("button", { name: /Copy/i });
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("/?ref=AFF1025"));
    });
  });

  it("toggles the collapsible help section", () => {
    render(<AffiliateLinksView />);

    expect(screen.queryByText("1. Generate & Share")).not.toBeInTheDocument();

    const helpToggleBtn = screen.getByRole("button", {
      name: /How do PhuketTours affiliate referral links work\?/i,
    });
    fireEvent.click(helpToggleBtn);

    expect(screen.getByText("1. Generate & Share")).toBeInTheDocument();
    expect(screen.getByText("2. 30-Day Attribution Window")).toBeInTheDocument();
  });
});

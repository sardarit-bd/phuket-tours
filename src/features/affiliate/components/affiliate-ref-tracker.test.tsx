import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { AffiliateRefTracker } from "./affiliate-ref-tracker";

let mockPathname = "/tours/phi-phi";
let mockSearchParams = new URLSearchParams("ref=AFFB5XAWS");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

const mockTrackClick = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

vi.mock("../api/affiliate-api", () => ({
  useTrackAffiliateClickMutation: vi.fn(() => [mockTrackClick]),
}));

describe("AffiliateRefTracker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/tours/phi-phi";
    mockSearchParams = new URLSearchParams("ref=AFFB5XAWS");
  });

  it("extracts referral code from URL and fires trackAffiliateClick", async () => {
    render(<AffiliateRefTracker />);

    await waitFor(() => {
      expect(mockTrackClick).toHaveBeenCalledTimes(1);
      expect(mockTrackClick).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "AFFB5XAWS",
          landingUrl: "/tours/phi-phi?ref=AFFB5XAWS",
        })
      );
    });
  });

  it("does not fire trackAffiliateClick when no ref query param is present", async () => {
    mockSearchParams = new URLSearchParams("");
    render(<AffiliateRefTracker />);

    await waitFor(() => {
      expect(mockTrackClick).not.toHaveBeenCalled();
    });
  });

  it("handles general homepage referral links (/?ref=AFFB5XAWS)", async () => {
    mockPathname = "/";
    mockSearchParams = new URLSearchParams("ref=AFFB5XAWS");
    render(<AffiliateRefTracker />);

    await waitFor(() => {
      expect(mockTrackClick).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "AFFB5XAWS",
          landingUrl: "/?ref=AFFB5XAWS",
        })
      );
    });
  });
});

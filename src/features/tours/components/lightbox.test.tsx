import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Lightbox } from "./lightbox";

// Mock next/image to render a plain img element.
// The factory is hoisted above imports, so it must not reference
// any module-level bindings. We capture React.createElement lazily
// via the component's own React import.
vi.mock("next/image", () => {
  // Defer React access to call-time (not factory-time) to avoid TDZ
  let _createElement: any;
  const getCreateElement = () => {
    if (!_createElement) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      _createElement = require("react").createElement;
    }
    return _createElement;
  };
  return {
    __esModule: true,
    default: (props: any) => {
      const { src, alt, ...rest } = props;
      const createElement = getCreateElement();
      return createElement("img", {
        src,
        alt,
        "data-testid": "lightbox-img",
        className: rest.className,
      });
    },
  };
});

describe("Lightbox", () => {
  const images = [
    "https://images.example.com/1.jpg",
    "https://images.example.com/2.jpg",
    "https://images.example.com/3.jpg",
  ];

  const renderLightbox = (
    activeIndex: number | undefined,
    overrides: any = {}
  ) =>
    render(
      <Lightbox
        images={images}
        activeIndex={activeIndex}
        onIndexChange={vi.fn()}
        onClose={vi.fn()}
        title="Test Tour"
        {...overrides}
      />
    );

  it("renders nothing when activeIndex is undefined", () => {
    const { container } = renderLightbox(undefined);
    expect(container.firstChild).toBeNull();
  });

  it("renders when activeIndex is a number", () => {
    renderLightbox(0);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the counter correctly", () => {
    renderLightbox(0);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("displays the correct counter for index 2", () => {
    renderLightbox(2);
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("calls onIndexChange when Next is clicked", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(0, { onIndexChange });
    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(onIndexChange).toHaveBeenCalledWith(1);
    unmount();
  });

  it("calls onIndexChange when Previous is clicked", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(2, { onIndexChange });
    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(onIndexChange).toHaveBeenCalledWith(1);
    unmount();
  });

  it("wraps around: Previous from index 0 goes to last", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(0, { onIndexChange });
    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(onIndexChange).toHaveBeenCalledWith(2);
    unmount();
  });

  it("wraps around: Next from last index goes to first", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(2, { onIndexChange });
    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(onIndexChange).toHaveBeenCalledWith(0);
    unmount();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    const { unmount } = renderLightbox(0, { onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    unmount();
  });

  it("calls onIndexChange when ArrowRight is pressed", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(0, { onIndexChange });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(1);
    unmount();
  });

  it("calls onIndexChange when ArrowLeft is pressed", () => {
    const onIndexChange = vi.fn();
    const { unmount } = renderLightbox(1, { onIndexChange });
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenCalledWith(0);
    unmount();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const { unmount } = renderLightbox(0, { onClose });
    fireEvent.click(screen.getByLabelText("Close photo preview"));
    expect(onClose).toHaveBeenCalled();
    unmount();
  });

  it("does NOT show prev/next buttons when only 1 image", () => {
    const { unmount } = render(
      <Lightbox
        images={["https://images.example.com/only.jpg"]}
        activeIndex={0}
        onIndexChange={vi.fn()}
        onClose={vi.fn()}
        title="Test Tour"
      />
    );
    expect(screen.queryByLabelText("Previous photo")).toBeNull();
    expect(screen.queryByLabelText("Next photo")).toBeNull();
    unmount();
  });

  it("locks body scroll when open and restores when closed", () => {
    const { unmount } = renderLightbox(0);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("sets role=dialog and aria-modal", () => {
    renderLightbox(0);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});

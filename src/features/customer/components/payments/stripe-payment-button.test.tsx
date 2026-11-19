/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { StripePaymentButton } from "./stripe-payment-button";
import { useCreateStripeSessionMutation } from "../../api/customer-api";

vi.mock("../../api/customer-api", () => ({
  useCreateStripeSessionMutation: vi.fn(),
}));

describe("StripePaymentButton", () => {
  const mockCreateStripeSession = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useCreateStripeSessionMutation).mockReturnValue([
      mockCreateStripeSession,
      { isLoading: false } as any,
    ]);
  });

  function renderButton(props = {}) {
    const store = makeStore();
    return render(
      <Provider store={store}>
        <StripePaymentButton
          bookingId="b1111111-1111-1111-1111-111111111111"
          amount={2500}
          currency="THB"
          {...props}
        />
      </Provider>,
    );
  }

  it("renders with correct formatted amount and currency", () => {
    renderButton();
    const button = screen.getByTestId("pay-with-stripe-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Pay THB 2,500.00 with Card");
  });

  it("calls createStripeSession mutation with bookingId and redirect URLs on click", async () => {
    mockCreateStripeSession.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          success: true,
          data: {
            sessionUrl: "https://checkout.stripe.com/c/pay/cs_test_url",
            sessionId: "cs_test_url",
          },
        }),
    });

    renderButton();
    const button = screen.getByTestId("pay-with-stripe-button");
    fireEvent.click(button);

    expect(mockCreateStripeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "b1111111-1111-1111-1111-111111111111",
        successUrl: expect.stringContaining("/checkout/success?bookingId=b1111111-1111-1111-1111-111111111111"),
        cancelUrl: expect.stringContaining("/checkout/cancel?bookingId=b1111111-1111-1111-1111-111111111111"),
      }),
    );
  });

  it("prevents repeated clicks when disabled or loading", () => {
    vi.mocked(useCreateStripeSessionMutation).mockReturnValue([
      mockCreateStripeSession,
      { isLoading: true } as any,
    ]);

    renderButton({ disabled: true });
    const button = screen.getByTestId("pay-with-stripe-button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockCreateStripeSession).not.toHaveBeenCalled();
  });

  it("displays friendly error message when payment session creation fails", async () => {
    mockCreateStripeSession.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          data: { message: "This booking is already paid" },
        }),
    });

    renderButton();
    const button = screen.getByTestId("pay-with-stripe-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("stripe-payment-error")).toHaveTextContent("This booking is already paid");
    });
  });
});


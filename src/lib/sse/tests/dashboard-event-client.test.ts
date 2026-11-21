import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DashboardEventClient } from "../dashboard-event-client";

describe("DashboardEventClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not connect if access token is missing and defers retry", () => {
    const onEvent = vi.fn();
    const client = new DashboardEventClient({
      url: "https://api.example.com/api/v1/events/stream",
      getAccessToken: () => null,
      onEvent,
      minRetryDelayMs: 100,
      maxRetryDelayMs: 1000,
    });

    client.start();
    expect(mockFetch).not.toHaveBeenCalled();

    client.stop();
  });

  it("connects with Authorization: Bearer header when token is available", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'id: 1\nevent: message\ndata: {"id":"1","type":"booking.created","entityId":"b1"}\n\n'
          )
        );
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
    });

    const onEvent = vi.fn();
    const onConnectionChange = vi.fn();

    const client = new DashboardEventClient({
      url: "https://api.example.com/api/v1/events/stream",
      getAccessToken: () => "mock-jwt-token",
      onEvent,
      onConnectionChange,
    });

    client.start();

    // Allow async connect to run microtasks
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/events/stream",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-jwt-token",
            Accept: "text/event-stream",
          }),
        })
      );
    });

    await vi.waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith({
        id: "1",
        type: "booking.created",
        entityId: "b1",
      });
    });

    client.stop();
  });

  it("handles comments/heartbeats without emitting events", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
    });

    const onEvent = vi.fn();
    const client = new DashboardEventClient({
      url: "https://api.example.com/api/v1/events/stream",
      getAccessToken: () => "mock-jwt-token",
      onEvent,
    });

    client.start();

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(onEvent).not.toHaveBeenCalled();

    client.stop();
  });

  it("tracks Last-Event-ID across reconnects", async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'id: evt-999\ndata: {"id":"evt-999","type":"booking.updated","entityId":"b2"}\n\n'
              )
            );
            controller.close();
          },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          body: stream,
        });
      } else {
        const stream = new ReadableStream({
          start(controller) {
            controller.close();
          },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          body: stream,
        });
      }
    });

    const onEvent = vi.fn();
    const client = new DashboardEventClient({
      url: "https://api.example.com/api/v1/events/stream",
      getAccessToken: () => "mock-jwt-token",
      onEvent,
      minRetryDelayMs: 50,
      maxRetryDelayMs: 100,
    });

    client.start();

    await vi.waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith({
        id: "evt-999",
        type: "booking.updated",
        entityId: "b2",
      });
    });

    // Advance timers for reconnect
    vi.advanceTimersByTime(200);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        "https://api.example.com/api/v1/events/stream",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Last-Event-ID": "evt-999",
          }),
        })
      );
    });

    client.stop();
  });
});

export interface DashboardEvent {
  id: string;
  type: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardEventClientOptions {
  url: string;
  getAccessToken: () => string | null | undefined;
  onEvent: (event: DashboardEvent) => void;
  onError?: (error: unknown) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  minRetryDelayMs?: number;
  maxRetryDelayMs?: number;
}

/**
 * Production-grade Server-Sent Events client using Fetch with ReadableStream.
 * Standard browser EventSource does not support passing Authorization: Bearer headers.
 * This client sends proper Bearer headers, tracks Last-Event-ID, and handles exponential
 * backoff with jitter on reconnects.
 */
export class DashboardEventClient {
  private abortController: AbortController | null = null;
  private isRunning = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private lastEventId: string | null = null;

  constructor(private options: DashboardEventClientOptions) {}

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.retryCount = 0;
    this.connect();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.options.onConnectionChange?.(false);
  }

  private async connect(): Promise<void> {
    if (!this.isRunning) return;

    const token = this.options.getAccessToken();
    if (!token) {
      // Defer connection if access token is not yet ready
      this.scheduleReconnect(1000);
      return;
    }

    this.abortController = new AbortController();
    const headers: Record<string, string> = {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    };

    if (this.lastEventId) {
      headers["Last-Event-ID"] = this.lastEventId;
    }

    try {
      const response = await fetch(this.options.url, {
        headers,
        credentials: "include",
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid, stop or let parent refresh
          this.options.onError?.(new Error(`Unauthorized SSE connection: ${response.status}`));
          this.scheduleReconnect(5000);
          return;
        }
        throw new Error(`SSE stream connection failed: HTTP ${response.status}`);
      }

      const body = response.body;
      if (!body) {
        throw new Error("No response body received from SSE endpoint");
      }

      this.retryCount = 0;
      this.options.onConnectionChange?.(true);

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (this.isRunning) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split(/\r\n\r\n|\n\n/);
        buffer = messages.pop() ?? "";

        for (const rawMessage of messages) {
          if (!rawMessage.trim()) continue;
          this.parseAndDispatchMessage(rawMessage);
        }
      }

      // Stream closed normally or finished
      if (this.isRunning) {
        this.scheduleReconnect();
      }
    } catch (err: unknown) {
      if (!this.isRunning || (err instanceof DOMException && err.name === "AbortError")) {
        return;
      }
      this.options.onError?.(err);
      this.scheduleReconnect();
    } finally {
      this.options.onConnectionChange?.(false);
    }
  }

  private parseAndDispatchMessage(rawMessage: string): void {
    const lines = rawMessage.split(/\r?\n/);
    let eventName = "message";
    let data = "";
    let id: string | null = null;

    for (const line of lines) {
      if (line.startsWith(":")) {
        // SSE comment (heartbeat)
        continue;
      }
      if (line.startsWith("event:")) {
        eventName = line.substring(6).trim();
      } else if (line.startsWith("data:")) {
        data += (data ? "\n" : "") + line.substring(5).trim();
      } else if (line.startsWith("id:")) {
        id = line.substring(3).trim();
      }
    }

    if (id) {
      this.lastEventId = id;
    }

    if (data) {
      try {
        const parsed = JSON.parse(data) as DashboardEvent;
        this.options.onEvent(parsed);
      } catch {
        // Non-JSON SSE event data
      }
    }
  }

  private scheduleReconnect(explicitDelayMs?: number): void {
    if (!this.isRunning) return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const minDelay = this.options.minRetryDelayMs ?? 1000;
    const maxDelay = this.options.maxRetryDelayMs ?? 30000;

    let delay = explicitDelayMs;
    if (delay === undefined) {
      // Exponential backoff with jitter
      const exp = Math.min(Math.pow(2, this.retryCount) * minDelay, maxDelay);
      const jitter = Math.random() * 1000;
      delay = Math.min(exp + jitter, maxDelay);
      this.retryCount++;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebhookConfiguration } from "./WebhookConfiguration";

const mockUseQuery = vi.fn();
const mockSaveMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockTestMutate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      webhookConfig: {
        getConfigurations: {
          invalidate: mockInvalidate,
        },
      },
    }),
    webhookConfig: {
      getConfigurations: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
      saveConfiguration: {
        useMutation: () => ({
          mutate: mockSaveMutate,
          isPending: false,
        }),
      },
      deleteConfiguration: {
        useMutation: () => ({
          mutate: mockDeleteMutate,
          isPending: false,
        }),
      },
      testWebhook: {
        useMutation: () => ({
          mutate: mockTestMutate,
          isPending: false,
        }),
      },
    },
  },
}));

describe("WebhookConfiguration", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockSaveMutate.mockReset();
    mockDeleteMutate.mockReset();
    mockTestMutate.mockReset();
    mockInvalidate.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("toggles an enabled configuration by sending opposite enabled state", () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 5,
          platform: "slack",
          webhookUrl: "https://hooks.slack.com/services/test",
          channelName: "alerts",
          enabled: 1,
        },
      ],
      isLoading: false,
    });

    render(<WebhookConfiguration />);

    fireEvent.click(screen.getByRole("switch"));

    expect(mockSaveMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        platform: "slack",
        webhookUrl: "https://hooks.slack.com/services/test",
        enabled: false,
      }),
    );
  });

  it("uses platform and webhook URL when triggering test webhook", () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 7,
          platform: "teams",
          webhookUrl: "https://example.org/webhook",
          channelName: "ops",
          enabled: 1,
        },
      ],
      isLoading: false,
    });

    render(<WebhookConfiguration />);

    const iconButtons = screen
      .getAllByRole("button")
      .filter(button => button.textContent === "");
    fireEvent.click(iconButtons[0]!);

    expect(mockTestMutate).toHaveBeenCalledWith({
      platform: "teams",
      webhookUrl: "https://example.org/webhook",
    });
  });
});

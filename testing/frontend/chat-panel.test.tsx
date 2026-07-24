import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ChatPanel from "../../frontend/src/components/chat/ChatPanel";

describe("chat panel", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("sends the name and conversation, then renders the reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ text: "**He listens.** Stay close, Anna." }), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);
    render(<ChatPanel userName="Anna" />);

    const input = screen.getByLabelText("Type your message");
    fireEvent.change(input, { target: { value: "Which tunnel is safe?" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      messages: [
        { role: "user", content: "My name is Anna." },
        { role: "assistant", content: expect.any(String) },
        { role: "user", content: "Which tunnel is safe?" },
      ],
    });
    expect(await screen.findByText("Stay close, Anna.")).toBeInTheDocument();
    expect(screen.getByText("He listens.")).toHaveClass("italic");
  });

  test("removes a rejected message and shows the usage-limit dialog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ details: "Message limit reached.", retry_after_seconds: 18000 }),
          { status: 429 },
        ),
      ),
    );

    render(<ChatPanel userName="Pavel" />);
    fireEvent.change(screen.getByLabelText("Type your message"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(await screen.findByRole("dialog", { name: "Message limit reached" })).toBeInTheDocument();
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Type your message")).toBeDisabled();
  });
});

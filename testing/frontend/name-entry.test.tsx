import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import NameEntryOverlay from "../../frontend/src/components/name-entry/NameEntryOverlay";

describe("name entry", () => {
  test("does not enter with a blank name and trims a valid name", () => {
    const onEnter = vi.fn();
    render(<NameEntryOverlay onEnter={onEnter} />);

    const input = screen.getByLabelText("Enter your survivor name");
    fireEvent.submit(input.closest("form")!);

    expect(onEnter).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "  Anna  " } });
    fireEvent.submit(input.closest("form")!);

    expect(onEnter).toHaveBeenCalledWith("Anna");
  });
});

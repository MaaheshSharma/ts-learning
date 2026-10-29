// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("recovers when a rendering error stops and the user retries", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  let shouldThrow = true;

  function FlakyChild() {
    if (shouldThrow) {
      throw new Error("Temporary rendering error");
    }

    return <p>Recovered successfully</p>;
  }

  render(
    <ErrorBoundary>
      <FlakyChild />
    </ErrorBoundary>,
  );

  expect(screen.getByRole("alert")).toBeTruthy();

  shouldThrow = false;

  fireEvent.click(screen.getByRole("button", { name: "Try again" }));

  expect(screen.getByText("Recovered successfully")).toBeTruthy();
});

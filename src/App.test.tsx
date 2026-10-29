// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

vi.mock("./components/ApiProducts", () => ({
  default: function BrokenApiProducts() {
    throw new Error("Forced render error for the test.");
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("shows a fallback when a child component crashes during rendering", () => {
  // React jaanbujhkar throw kiye gaye test error ko console mein log karega.
  vi.spyOn(console, "error").mockImplementation(() => {});

  render(<App />);

  expect(screen.getByRole("alert")).toBeTruthy();

  expect(
    screen.getByRole("heading", {
      name: "Something went wrong",
    }),
  ).toBeTruthy();
});

it("renders children when no error occurs", () => {
  render(
    <ErrorBoundary>
      <p>Catalog is ready</p>
    </ErrorBoundary>,
  );

  expect(screen.getByText("Catalog is ready")).toBeTruthy();
});

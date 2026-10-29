// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { getProducts } from "../api/products";
import type { ApiProduct } from "../types/product";
import ApiProducts from "./ApiProducts";

vi.mock("../api/products", () => ({
  getProducts: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetAllMocks();
});

function createDeferred<T>() {
  let resolvePromise: (value: T) => void = () => {};
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve: (value: T) => resolvePromise(value),
  };
}

describe("ApiProducts", () => {
  it("shows loading UI while products are being fetched", () => {
    vi.mocked(getProducts).mockReturnValue(new Promise<ApiProduct[]>(() => {}));

    render(<ApiProducts />);

    expect(screen.getByRole("status")).toBeTruthy();

    expect(screen.getByText("Loading products...")).toBeTruthy();

    expect(
      screen.queryByRole("heading", {
        name: "Product Catalogue",
      }),
    ).toBeNull();
  });

  it("shows an error and successfully retries after the user clicks Try Again", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(products);

    render(<ApiProducts />);

    expect(await screen.findByText("Error loading products")).toBeTruthy();

    expect(screen.getByRole("alert").textContent).toBe("Failed to fetch");

    const retryButton = screen.getByRole("button", {
      name: "Try Again",
    });

    // Keyboard se button par focus lao.
    await user.tab();

    expect(document.activeElement).toBe(retryButton);

    // Enter key se button activate karo.
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("heading", {
        name: "Product Catalogue",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: "Wireless Mouse" }),
    ).toBeTruthy();

    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it("keeps previously loaded products visible when a refresh fails", async () => {
    const user = userEvent.setup();

    const initialProducts: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts)
      .mockResolvedValueOnce(initialProducts)
      .mockRejectedValueOnce(new TypeError("Refresh failed"));

    render(<ApiProducts />);

    // Initial products successfully load.
    expect(
      await screen.findByRole("heading", { name: "Wireless Mouse" }),
    ).toBeTruthy();

    // The next API request fails.
    await user.click(screen.getByRole("button", { name: "Refresh products" }));

    // The refresh error is announced, but old products remain visible.
    expect(
      await screen.findByText(
        "We couldn't refresh products. Showing previously loaded products.",
      ),
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: "Wireless Mouse" }),
    ).toBeTruthy();

    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it("clears the refresh error when a retry succeeds", async () => {
    const user = userEvent.setup();

    const initialProducts: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    const refreshedProducts: ApiProduct[] = [
      {
        id: 2,
        title: "Mechanical Keyboard",
        price: 75,
        category: "accessories",
        thumbnail: "https://example.com/keyboard.jpg",
      },
    ];

    vi.mocked(getProducts)
      .mockResolvedValueOnce(initialProducts)
      .mockRejectedValueOnce(new TypeError("Refresh failed"))
      .mockResolvedValueOnce(refreshedProducts);

    render(<ApiProducts />);

    expect(
      await screen.findByRole("heading", { name: "Wireless Mouse" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh products" }));

    const refreshError =
      "We couldn't refresh products. Showing previously loaded products.";

    expect(await screen.findByText(refreshError)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh products" }));

    expect(
      await screen.findByRole("heading", { name: "Mechanical Keyboard" }),
    ).toBeTruthy();

    expect(screen.queryByText(refreshError)).toBeNull();
    expect(getProducts).toHaveBeenCalledTimes(3);
  });

  it("keeps the latest products when overlapping refreshes resolve out of order", async () => {
    const user = userEvent.setup();
    const initialProducts: ApiProduct[] = [
      {
        id: 1,
        title: "Initial Product",
        price: 10,
        category: "test",
        thumbnail: "https://example.com/initial.jpg",
      },
    ];
    const staleProducts: ApiProduct[] = [
      {
        id: 2,
        title: "Stale Product",
        price: 20,
        category: "test",
        thumbnail: "https://example.com/stale.jpg",
      },
    ];
    const latestProducts: ApiProduct[] = [
      {
        id: 3,
        title: "Latest Product",
        price: 30,
        category: "test",
        thumbnail: "https://example.com/latest.jpg",
      },
    ];
    const staleRequest = createDeferred<ApiProduct[]>();
    const latestRequest = createDeferred<ApiProduct[]>();

    vi.mocked(getProducts)
      .mockResolvedValueOnce(initialProducts)
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(latestRequest.promise);

    render(<ApiProducts />);

    expect(
      await screen.findByRole("heading", { name: "Initial Product" }),
    ).toBeTruthy();

    const refreshButton = screen.getByRole("button", {
      name: "Refresh products",
    });

    await user.click(refreshButton);
    await user.click(refreshButton);

    expect(getProducts).toHaveBeenCalledTimes(3);

    await act(async () => {
      latestRequest.resolve(latestProducts);
    });

    expect(
      await screen.findByRole("heading", { name: "Latest Product" }),
    ).toBeTruthy();

    await act(async () => {
      staleRequest.resolve(staleProducts);
    });

    expect(
      screen.getByRole("heading", { name: "Latest Product" }),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Stale Product" })).toBeNull();
  });

  it("shows a fallback message when the API rejects with a non-Error value", async () => {
    vi.mocked(getProducts).mockRejectedValue("unexpected rejection");

    render(<ApiProducts />);

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe("Something went wrong");
  });

  it("gives each product's add-to-cart button a product-specific accessible name", async () => {
    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
      {
        id: 2,
        title: "Mechanical Keyboard",
        price: 80,
        category: "accessories",
        thumbnail: "https://example.com/keyboard.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    render(<ApiProducts />);

    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    expect(
      screen.getByRole("button", {
        name: "Add Wireless Mouse to cart",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", {
        name: "Add Mechanical Keyboard to cart",
      }),
    ).toBeTruthy();
  });

  it("shuffles displayed products on refresh without mutating the original array", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
      {
        id: 2,
        title: "Mechanical Keyboard",
        price: 80,
        category: "accessories",
        thumbnail: "https://example.com/keyboard.jpg",
      },
      {
        id: 3,
        title: "Monitor",
        price: 150,
        category: "electronics",
        thumbnail: "https://example.com/monitor.jpg",
      },
    ];

    const originalOrder = products.map((product) => product.title);

    vi.mocked(getProducts).mockResolvedValue(products);

    render(<ApiProducts />);

    await screen.findByRole("heading", { name: "Monitor" });

    // Fisher-Yates shuffle mein dono swaps ko deterministic banate hain.
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0);

    await user.click(screen.getByRole("button", { name: "Refresh products" }));

    const displayedProductNames = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent)
      .filter((name) => name !== "Cart Preview");

    expect(displayedProductNames).toEqual([
      "Mechanical Keyboard",
      "Monitor",
      "Wireless Mouse",
    ]);

    // Shuffle original API array ko mutate nahi karna chahiye.
    expect(products.map((product) => product.title)).toEqual(originalOrder);
  });

  it("announces cart item count changes through a polite live region", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    render(<ApiProducts />);

    const initialCount = await screen.findByText("0 items");

    expect(initialCount.getAttribute("aria-live")).toBe("polite");
    expect(initialCount.getAttribute("aria-atomic")).toBe("true");

    await user.click(
      screen.getByRole("button", {
        name: "Add Wireless Mouse to cart",
      }),
    );

    const updatedCount = screen.getByText("1 item");

    expect(updatedCount.getAttribute("aria-live")).toBe("polite");
    expect(updatedCount.getAttribute("aria-atomic")).toBe("true");
  });

  it("updates item count and subtotal when the same product is added twice", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    render(<ApiProducts />);

    // Wait until the product is displayed.
    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    const addButton = screen.getByRole("button", {
      name: "Add Wireless Mouse to cart",
    });

    // Add the same product twice.
    await user.click(addButton);
    await user.click(addButton);

    // Verify total quantity.
    expect(screen.getByText("2 items")).toBeTruthy();

    // Verify subtotal: $25 × 2 = $50.
    expect(screen.getByText("$50.00")).toBeTruthy();
  });

  it("updates subtotal when quantity changes and removes the item correctly", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    render(<ApiProducts />);

    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    const addButton = screen.getByRole("button", {
      name: "Add Wireless Mouse to cart",
    });

    await user.click(addButton);
    await user.click(addButton);

    // Quantity 2: subtotal should be $50.
    expect(screen.getByText("2 items")).toBeTruthy();
    expect(screen.getByText("$50.00")).toBeTruthy();

    const decreaseButton = screen.getByRole("button", {
      name: "Decrease Wireless Mouse quantity",
    });

    const increaseButton = screen.getByRole("button", {
      name: "Increase Wireless Mouse quantity",
    });

    // Decrease quantity from 2 to 1.
    await user.click(decreaseButton);

    expect(screen.getByText("1 item")).toBeTruthy();
    expect(screen.getByText("$25.00")).toBeTruthy();

    // Quantity 1 is the minimum: decrease must be disabled.
    expect((decreaseButton as HTMLButtonElement).disabled).toBe(true);

    // Increasing quantity to 2 should work again.
    await user.click(increaseButton);

    expect(screen.getByText("2 items")).toBeTruthy();
    expect(screen.getByText("$50.00")).toBeTruthy();

    expect((decreaseButton as HTMLButtonElement).disabled).toBe(false);

    // Remove the entire cart item.
    await user.click(
      screen.getByRole("button", {
        name: "Remove Wireless Mouse from cart",
      }),
    );

    expect(screen.getByText("0 items")).toBeTruthy();
    expect(screen.getByText("Your cart is empty")).toBeTruthy();
    expect(screen.queryByText("$50.00")).toBeNull();
  });

  it("restores the cart from localStorage after remounting", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    // First mount: load products and add an item.
    const firstRender = render(<ApiProducts />);

    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    await user.click(
      screen.getByRole("button", { name: "Add Wireless Mouse to cart" }),
    );

    expect(await screen.findByText("$25.00")).toBeTruthy();
    expect(screen.getByText("1 item")).toBeTruthy();

    // Simulate a fresh component mount while preserving localStorage.
    firstRender.unmount();

    render(<ApiProducts />);

    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    // The saved cart should be restored.
    expect(screen.getByText("1 item")).toBeTruthy();
    expect(screen.getByText("$25.00")).toBeTruthy();
  });

  it("falls back to an empty cart when saved JSON is malformed", async () => {
    localStorage.setItem("react-ts-learning-cart", "{invalid-json");

    vi.mocked(getProducts).mockResolvedValue([]);

    render(<ApiProducts />);

    // The component should render without crashing.
    expect(await screen.findByText("Your cart is empty")).toBeTruthy();

    expect(screen.getByText("0 items")).toBeTruthy();

    // The malformed value should be replaced with a valid empty cart.
    expect(
      JSON.parse(localStorage.getItem("react-ts-learning-cart") ?? "null"),
    ).toEqual({ items: [] });
  });

  it("keeps the cart usable when storage operations fail", async () => {
    const user = userEvent.setup();

    const products: ApiProduct[] = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    vi.mocked(getProducts).mockResolvedValue(products);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "SecurityError");
    });

    render(<ApiProducts />);

    await screen.findByRole("heading", {
      name: "Wireless Mouse",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Add Wireless Mouse to cart",
      }),
    );

    // Cart should still update in memory.
    expect(screen.getByText("1 item")).toBeTruthy();
    expect(screen.getByText("$25.00")).toBeTruthy();
  });

  it("displays an empty-catalogue message when the API returns an empty product array", async () => {
    vi.mocked(getProducts).mockResolvedValue([]);

    render(<ApiProducts />);

    expect(
      await screen.findByText("No products available right now."),
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: "Product Catalogue" }),
    ).toBeTruthy();

    expect(screen.queryByText("Error loading products")).toBeNull();

    expect(screen.getByText("Your cart is empty")).toBeTruthy();
    expect(screen.getByText("0 items")).toBeTruthy();
  });

  it("aborts the pending products request when unmounting and safely handles rejection", async () => {
    let capturedSignal: AbortSignal | undefined;
    const abortError = new DOMException(
      "The operation was aborted.",
      "AbortError",
    );

    vi.mocked(getProducts).mockImplementation((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise<ApiProduct[]>((_resolve, reject) => {
        if (signal.aborted) {
          reject(abortError);
          return;
        }

        signal.addEventListener(
          "abort",
          () => {
            reject(abortError);
          },
          { once: true },
        );
      });
    });

    const { unmount } = render(<ApiProducts />);

    expect(getProducts).toHaveBeenCalledTimes(1);
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);

    // Allow microtasks in the effect's rejection handler to settle
    await Promise.resolve();

    // Verify error state was suppressed on abort during cleanup
    expect(screen.queryByText("Error loading products")).toBeNull();
  });

  it("shows an accessible fallback when a product image fails", async () => {
    const product: ApiProduct = {
      id: 1,
      title: "Wireless Mouse",
      price: 25,
      category: "accessories",
      thumbnail: "https://example.com/mouse.jpg",
    };

    vi.mocked(getProducts).mockResolvedValue([product]);

    render(<ApiProducts />);

    const image = await screen.findByRole("img", {
      name: "Wireless Mouse",
    });

    fireEvent.error(image);

    expect(
      screen.getByRole("img", {
        name: "Image unavailable: Wireless Mouse",
      }),
    ).toBeTruthy();

    expect(screen.getByText("Image unavailable")).toBeTruthy();
  });
});

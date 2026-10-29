 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { afterEach, describe, expect, it, vi } from "vitest";
import { getProducts } from "./products";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getProducts", () => {
  it("returns products when the API response is valid", async () => {
    const products = [
      {
        id: 1,
        title: "Wireless Mouse",
        price: 25,
        category: "accessories",
        thumbnail: "https://example.com/mouse.jpg",
      },
    ];

    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products,
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    const result = await getProducts(signal);

    expect(result).toEqual(products);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://dummyjson.com/products?limit=12",
      { signal },
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws an error when the server responds with HTTP 503", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow("Request failed: 503");

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an API response with an invalid products structure", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: "not-an-array",
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a product with an invalid price type", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
          {
            id: 1,
            title: "Wireless Mouse",
            price: "25",
            category: "accessories",
            thumbnail: "https://example.com/mouse.jpg",
          },
        ],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("propagates a network error when fetch fails", async () => {
    const signal = new AbortController().signal;
    const networkError = new TypeError("Failed to fetch");
    const mockFetch = vi.fn().mockRejectedValue(networkError);

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toBe(networkError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("propagates an error when JSON parsing fails", async () => {
    const signal = new AbortController().signal;
    const parseError = new SyntaxError("Invalid JSON");

    const mockJson = vi.fn().mockRejectedValue(parseError);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: mockJson,
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toBe(parseError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledTimes(1);
  });

  it("propagates request cancellation when the signal is aborted", async () => {
    const controller = new AbortController();

    const abortError = new DOMException(
      "The operation was aborted.",
      "AbortError",
    );

    const mockFetch = vi.fn(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = _optionalChain([init, 'optionalAccess', _ => _.signal]);

          if (!signal) {
            reject(new Error("Missing request signal"));
            return;
          }

          if (signal.aborted) {
            reject(abortError);
            return;
          }

          signal.addEventListener("abort", () => reject(abortError), {
            once: true,
          });
        }),
    );

    vi.stubGlobal("fetch", mockFetch);

    const request = getProducts(controller.signal);

    controller.abort();

    await expect(request).rejects.toBe(abortError);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://dummyjson.com/products?limit=12",
      { signal: controller.signal },
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-object API response", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue("invalid-string-response"),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an API response with negative response metadata", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [],
        total: -1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a response containing more products than its reported limit", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
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
        ],
        total: 2,
        skip: 0,
        limit: 1,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an API response containing a non-object product", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [null],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an API response containing duplicate product IDs", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
          {
            id: 1,
            title: "Wireless Mouse",
            price: 25,
            category: "accessories",
            thumbnail: "https://example.com/mouse.jpg",
          },
          {
            id: 1,
            title: "Mechanical Keyboard",
            price: 80,
            category: "accessories",
            thumbnail: "https://example.com/keyboard.jpg",
          },
        ],
        total: 2,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a product with an invalid thumbnail URL protocol", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
          {
            id: 1,
            title: "Wireless Mouse",
            price: 25,
            category: "accessories",
            thumbnail: "ftp://example.com/mouse.jpg",
          },
        ],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a product with a malformed thumbnail URL", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
          {
            id: 1,
            title: "Wireless Mouse",
            price: 25,
            category: "accessories",
            thumbnail: "not a valid url",
          },
        ],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a product with a blank thumbnail URL", async () => {
    const signal = new AbortController().signal;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products: [
          {
            id: 1,
            title: "Wireless Mouse",
            price: 25,
            category: "accessories",
            thumbnail: "   ",
          },
        ],
        total: 1,
        skip: 0,
        limit: 12,
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(getProducts(signal)).rejects.toThrow(
      "The server returned an invalid products response.",
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

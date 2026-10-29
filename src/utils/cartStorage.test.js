// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { initialCartState } from "../reducers/cartReducer";
import { loadCartState } from "./cartStorage";

const CART_STORAGE_KEY = "react-ts-learning-cart";

describe("cartStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("restores valid items, filters out invalid records, and falls back if JSON is unparseable", () => {
    const mixedPayload = {
      items: [
        {
          id: "valid-1",
          name: "Mechanical Keyboard",
          price: 80,
          quantity: 2,
        },

        // Malformed item: negative price
        {
          id: "invalid-negative-price",
          name: "Negative Price",
          price: -5,
          quantity: 1,
        },

        // Malformed item: blank ID
        {
          id: "   ",
          name: "Blank ID",
          price: 10,
          quantity: 1,
        },

        // Malformed item: blank name
        {
          id: "invalid-blank-name",
          name: "   ",
          price: 10,
          quantity: 1,
        },

        // Malformed item: unsafe quantity
        {
          id: "invalid-quantity",
          name: "Unsafe Quantity",
          price: 10,
          quantity: Number.MAX_SAFE_INTEGER + 1,
        },

        // Malformed item: invalid ID type
        {
          id: 123,
          name: "Invalid ID",
          price: 20,
          quantity: 1,
        },
        // Malformed item: non-finite price
        {
          id: "invalid-2",
          name: "Invalid Price",
          price: NaN,
          quantity: 1,
        },
        // Malformed item: quantity less than 1
        {
          id: "invalid-3",
          name: "Zero Quantity",
          price: 15,
          quantity: 0,
        },
        // Malformed item: non-object / null
        "invalid-entry",
        null,
      ],
    };

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mixedPayload));

    const loaded = loadCartState(initialCartState);

    expect(loaded.items).toEqual([
      {
        id: "valid-1",
        name: "Mechanical Keyboard",
        price: 80,
        quantity: 2,
      },
    ]);

    // Fallback behavior when stored data cannot be parsed
    localStorage.setItem(CART_STORAGE_KEY, "invalid-json{");
    const fallback = loadCartState(initialCartState);
    expect(fallback).toEqual(initialCartState);
  });

  it("falls back to initialCartState when stored JSON has an invalid items structure", () => {
    // 1. "items" property is not an array
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items: "not-an-array" }),
    );
    expect(loadCartState(initialCartState)).toEqual(initialCartState);

    // 2. "items" property is missing
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ otherField: [] }));
    expect(loadCartState(initialCartState)).toEqual(initialCartState);

    // 3. Stored JSON is a non-object primitive (number, boolean, null)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(12345));
    expect(loadCartState(initialCartState)).toEqual(initialCartState);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(null));
    expect(loadCartState(initialCartState)).toEqual(initialCartState);
  });
});
it("ignores duplicate product IDs when restoring the cart", () => {
  const duplicatePayload = {
    items: [
      {
        id: "duplicate-1",
        name: "Mechanical Keyboard",
        price: 80,
        quantity: 2,
      },
      {
        id: "duplicate-1",
        name: "Mechanical Keyboard",
        price: 80,
        quantity: 3,
      },
      {
        id: "unique-1",
        name: "Wireless Mouse",
        price: 25,
        quantity: 1,
      },
    ],
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(duplicatePayload));

  const loaded = loadCartState(initialCartState);

  expect(loaded.items).toEqual([
    {
      id: "duplicate-1",
      name: "Mechanical Keyboard",
      price: 80,
      quantity: 2,
    },
    {
      id: "unique-1",
      name: "Wireless Mouse",
      price: 25,
      quantity: 1,
    },
  ]);
});

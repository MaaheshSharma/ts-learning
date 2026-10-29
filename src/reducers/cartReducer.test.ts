import { describe, expect, it } from "vitest";
import {
  cartReducer,
  initialCartState,
  type CartState,
} from "./cartReducer";

describe("cartReducer", () => {
  it("adds a new product with quantity 1", () => {
    const action = {
      type: "ADD_ITEM" as const,
      payload: {
        id: "1",
        name: "Wireless Mouse",
        price: 25,
      },
    };

    const state = cartReducer(initialCartState, action);

    expect(state.items).toEqual([
      {
        id: "1",
        name: "Wireless Mouse",
        price: 25,
        quantity: 1,
      },
    ]);
  });

  it("adds a duplicate product by incrementing quantity without mutating the previous state", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 1,
        },
      ],
    };

    Object.freeze(initialState);
    Object.freeze(initialState.items);
    Object.freeze(initialState.items[0]);

    const action = {
      type: "ADD_ITEM" as const,
      payload: {
        id: "1",
        name: "Wireless Mouse",
        price: 25,
      },
    };

    const nextState = cartReducer(initialState, action);

    expect(nextState.items).toEqual([
      {
        id: "1",
        name: "Wireless Mouse",
        price: 25,
        quantity: 2,
      },
    ]);

    expect(initialState.items[0].quantity).toBe(1);
    expect(nextState).not.toBe(initialState);
    expect(nextState.items).not.toBe(initialState.items);
  });

  it("increases and decreases quantity correctly and never drops below 1", () => {
    const startingState: CartState = {
      items: [
        {
          id: "1",
          name: "Mechanical Keyboard",
          price: 80,
          quantity: 1,
        },
      ],
    };

    // 1. Increase quantity from 1 to 2
    const increasedState = cartReducer(startingState, {
      type: "INCREASE_QUANTITY",
      payload: { id: "1" },
    });
    expect(increasedState.items[0].quantity).toBe(2);

    // 2. Decrease quantity from 2 back to 1
    const decreasedState = cartReducer(increasedState, {
      type: "DECREASE_QUANTITY",
      payload: { id: "1" },
    });
    expect(decreasedState.items[0].quantity).toBe(1);

    // 3. Decrease quantity at 1 should remain 1 (never decreases below 1)
    const clampedState = cartReducer(decreasedState, {
      type: "DECREASE_QUANTITY",
      payload: { id: "1" },
    });
    expect(clampedState.items[0].quantity).toBe(1);
  });

  it("leaves other products unchanged while adding or increasing a cart item", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 1,
        },
        {
          id: "2",
          name: "Desk Mat",
          price: 15,
          quantity: 1,
        },
      ],
    };

    const afterAddingDuplicate = cartReducer(initialState, {
      type: "ADD_ITEM",
      payload: { id: "1", name: "Wireless Mouse", price: 25 },
    });

    expect(afterAddingDuplicate.items).toEqual([
      { id: "1", name: "Wireless Mouse", price: 25, quantity: 2 },
      { id: "2", name: "Desk Mat", price: 15, quantity: 1 },
    ]);

    const afterIncreasingOtherItem = cartReducer(afterAddingDuplicate, {
      type: "INCREASE_QUANTITY",
      payload: { id: "2" },
    });

    expect(afterIncreasingOtherItem.items).toEqual([
      { id: "1", name: "Wireless Mouse", price: 25, quantity: 2 },
      { id: "2", name: "Desk Mat", price: 15, quantity: 2 },
    ]);
  });

  it("removes only the matching product without mutating the previous state", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 2,
        },
        {
          id: "2",
          name: "Desk Mat",
          price: 15,
          quantity: 1,
        },
      ],
    };

    Object.freeze(initialState);
    Object.freeze(initialState.items);

    const nextState = cartReducer(initialState, {
      type: "REMOVE_ITEM",
      payload: { id: "1" },
    });

    expect(nextState.items).toEqual([
      {
        id: "2",
        name: "Desk Mat",
        price: 15,
        quantity: 1,
      },
    ]);

    expect(initialState.items).toHaveLength(2);
    expect(nextState).not.toBe(initialState);
  });

  it("empties the cart on CLEAR_CART without mutating the previous state", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 2,
        },
      ],
    };

    Object.freeze(initialState);
    Object.freeze(initialState.items);

    const nextState = cartReducer(initialState, {
      type: "CLEAR_CART",
    });

    expect(nextState.items).toEqual([]);
    expect(initialState.items).toHaveLength(1);
    expect(nextState).not.toBe(initialState);
  });

  it("returns unchanged state when increasing or decreasing quantity for a nonexistent product ID", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 2,
        },
      ],
    };

    const stateAfterIncrease = cartReducer(initialState, {
      type: "INCREASE_QUANTITY",
      payload: { id: "nonexistent-id" },
    });
    expect(stateAfterIncrease).toBe(initialState);

    const stateAfterDecrease = cartReducer(initialState, {
      type: "DECREASE_QUANTITY",
      payload: { id: "nonexistent-id" },
    });
    expect(stateAfterDecrease).toBe(initialState);
  });

  it("returns unchanged state for an unsupported runtime action through the default branch", () => {
    const initialState: CartState = {
      items: [
        {
          id: "1",
          name: "Wireless Mouse",
          price: 25,
          quantity: 1,
        },
      ],
    };

    // @ts-expect-error Testing unsupported runtime action
    const nextState = cartReducer(initialState, { type: "UNKNOWN_ACTION" });

    expect(nextState).toBe(initialState);
  });
});

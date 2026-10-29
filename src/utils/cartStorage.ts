import type { CartItem, CartState } from "../reducers/cartReducer";

const CART_STORAGE_KEY = "react-ts-learning-cart";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity >= 1
  );
}

export function loadCartState(initialState: CartState): CartState {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return initialState;
    }

    const parsed: unknown = JSON.parse(savedCart);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items)
    ) {
      return initialState;
    }

    const validItems = parsed.items.filter(isCartItem);
    const seenIds = new Set<string>();

    const uniqueItems = validItems.filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    });

    return {
      items: uniqueItems,
    };
  } catch {
    return initialState;
  }
}

export function saveCartState(cartState: CartState): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch {
    // Storage unavailable ho to bhi current-session cart chalega.
  }
}

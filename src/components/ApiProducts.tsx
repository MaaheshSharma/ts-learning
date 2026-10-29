import { useEffect, useState, useReducer, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import { cartReducer, initialCartState } from "../reducers/cartReducer";
import { loadCartState, saveCartState } from "../utils/cartStorage";
import CatalogProductCard from "./CatalogProductCard";
import type { ApiProduct } from "../types/product";

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
}

function ApiProducts() {
  const { products, loading, error, retry } = useProducts();
  const [displayedProducts, setDisplayedProducts] = useState<ApiProduct[]>([]);
  const shuffleNextProducts = useRef(false);
  const [cartState, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    loadCartState,
  );

  useEffect(() => {
    const nextProducts = shuffleNextProducts.current
      ? shuffleArray(products)
      : products;

    shuffleNextProducts.current = false;
    setDisplayedProducts(nextProducts);
  }, [products]);

  const handleRefresh = () => {
    shuffleNextProducts.current = true;
    retry();
  };

  // Cart mein sabhi items ki total quantity
  const totalItemCount = cartState.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Cart ka subtotal: har item ka price × quantity
  const subtotal = cartState.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    saveCartState(cartState);
  }, [cartState]);

  // 1. Loading State UI
  if (loading && products.length === 0) {
    return (
      <div
        role="status"
        aria-atomic="true"
        className="flex min-h-[300px] flex-col items-center justify-center py-16"
      >
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"
        />

        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading products...
        </p>
      </div>
    );
  }

  // 2. Error State UI
  if (error && products.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="font-semibold text-rose-700">Error loading products</p>

        <p role="alert" className="mt-1 text-sm text-rose-600">
          {error}
        </p>

        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. Products Catalogue UI
  return (
    <section className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Product Catalogue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse our collection fetched live from DummyJSON API.
          </p>
        </div>

        {loading && (
          <p role="status" className="mb-4 text-sm text-indigo-600">
            Refreshing products...
          </p>
        )}

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M20 11a8.1 8.1 0 0 0-14.5-4L4 9" />
            <path d="M4 4v5h5" />
            <path d="M4 13a8.1 8.1 0 0 0 14.5 4L20 15" />
            <path d="M20 20v-5h-5" />
          </svg>
          Refresh products
        </button>
      </header>

      {error && products.length > 0 && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        >
          We couldn't refresh products. Showing previously loaded products.
        </p>
      )}

      {displayedProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No products available right now.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedProducts.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              onAddToCart={() =>
                dispatch({
                  type: "ADD_ITEM",
                  payload: {
                    id: String(product.id),
                    name: product.title,
                    price: product.price,
                  },
                })
              }
            />
          ))}
        </div>
      )}

      {/* Cart Preview Section */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Cart Preview</h2>

          <span
            className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700"
            aria-live="polite"
            aria-atomic="true"
          >
            {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {cartState.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Your cart is empty</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {cartState.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{item.name}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    ${item.price} each
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        dispatch({
                          type: "DECREASE_QUANTITY",
                          payload: { id: item.id },
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-l-lg text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="min-w-9 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() =>
                        dispatch({
                          type: "INCREASE_QUANTITY",
                          payload: { id: item.id },
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-r-lg text-lg hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_ITEM",
                        payload: { id: item.id },
                      })
                    }
                    className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cartState.items.length > 0 && (
          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">
                Subtotal
              </span>

              <span className="text-xl font-bold text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Taxes and shipping are not included.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

export default ApiProducts;

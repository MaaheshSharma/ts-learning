import type { ApiProduct, ProductsResponse } from "../types/product";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isApiProduct(value: unknown): value is ApiProduct {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.category === "string" &&
    value.category.trim().length > 0 &&
    isHttpUrl(value.thumbnail)
  );
}

function isValidProductsArray(value: unknown): value is ApiProduct[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const products: unknown[] = value;
  const seenIds = new Set<number>();

  for (const product of products) {
    if (!isApiProduct(product) || seenIds.has(product.id)) {
      return false;
    }

    seenIds.add(product.id);
  }

  return true;
}

function isProductsResponse(value: unknown): value is ProductsResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isValidProductsArray(value.products) &&
    isNonNegativeInteger(value.total) &&
    isNonNegativeInteger(value.skip) &&
    isNonNegativeInteger(value.limit) &&
    value.products.length <= value.limit
  );
}

export async function getProducts(signal: AbortSignal): Promise<ApiProduct[]> {
  const response = await fetch("https://dummyjson.com/products?limit=12", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isProductsResponse(data)) {
    throw new Error("The server returned an invalid products response.");
  }

  return data.products;
}

import type { ApiProduct } from "../types/product";
import ProductImage from "./ProductImage";

type CatalogProductCardProps = {
  product: ApiProduct;
  onAddToCart: () => void;
};

export default function CatalogProductCard({
  product,
  onAddToCart,
}: CatalogProductCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <ProductImage
          key={product.thumbnail}
          src={product.thumbnail}
          alt={product.title}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
            {product.category}
          </span>

          <h2 className="mt-2 text-base font-bold text-slate-900 line-clamp-1">
            {product.title}
          </h2>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xl font-extrabold text-slate-900">
            ${product.price}
          </span>

          <span className="text-xs font-medium text-slate-400">
            ID: #{product.id}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          aria-label={`Add ${product.title} to cart`}
          className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

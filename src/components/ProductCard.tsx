type ProductCardProps = {
  productName: string;
  price: number;
  badge?: string;
};

function ProductCard({ productName, price, badge }: ProductCardProps) {
  return (
    <article className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div>
        {/* Badge UI */}
        {badge && (
          <div className="mb-4 min-h-[26px] absolute top-0 left-6 -translate-y-1/2">
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              {badge}
            </span>
          </div>
        )}

        {/* Product Name UI */}
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {productName}
        </h2>
      </div>

      {/* Price UI */}
      <div className="mt-6 flex items-baseline justify-between border-t border-slate-100 pt-4">
        <div>
          <span className="text-xs font-medium text-slate-400">Price</span>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">
            ${price}
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}

export default ProductCard;

import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
};

export default function ProductImage({ src, alt }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={`Image unavailable: ${alt}`}
        className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-slate-500"
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
    />
  );
}

import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  children: ReactNode;
};

function FeatureCard({ title, children }: FeatureCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <h2 className="px-6 py-4 text-lg font-bold text-gray-900">{title}</h2>

      <div className="space-y-2 px-6 py-4 text-gray-700">{children}</div>
    </div>
  );
}

export default FeatureCard;

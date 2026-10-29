import type { ReactNode } from "react";

type InfoPanelProps = {
  title: string;
  children: ReactNode;
};

function InfoPanel({ title, children }: InfoPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <div className="mt-3 space-y-2 text-sm text-slate-600">{children}</div>
    </section>
  );
}

export default InfoPanel;

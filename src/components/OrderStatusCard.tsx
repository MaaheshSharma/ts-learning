const statusBadgeStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

type OrderStatusCardProps = {
  orderID: string;
  status: keyof typeof statusBadgeStyles;
};

function OrderStatusCard({ orderID, status }: OrderStatusCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-700">
          Order ID: {orderID}
        </h2>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeStyles[status]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default OrderStatusCard;

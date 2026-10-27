import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There is no information to display.",
  action,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-brand-50 p-4">
        <Icon size={28} className="text-brand-600" />
      </div>

      <h3 className="font-semibold text-ink">{title}</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
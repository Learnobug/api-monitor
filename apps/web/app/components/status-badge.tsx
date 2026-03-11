import type { ApiStatus } from "../types/api";

export function StatusBadge({ status }: { status: ApiStatus }) {
  const styles: Record<ApiStatus, string> = {
    healthy: "bg-green-100 text-green-700",
    degraded: "bg-yellow-100 text-yellow-700",
    down: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "healthy"
            ? "bg-green-500"
            : status === "degraded"
              ? "bg-yellow-500"
              : "bg-red-500"
        }`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

import type { ApiEndpoint, ApiCheck, DashboardStats, Alert, AlertLog, RecentCheck } from "../types/api";

export async function fetchApis(): Promise<ApiEndpoint[]> {
  const res = await fetch("/api/apis");
  if (!res.ok) throw new Error("Failed to fetch APIs");
  return res.json();
}

export async function fetchApiById(id: string): Promise<ApiEndpoint | undefined> {
  const res = await fetch(`/api/apis/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Failed to fetch API");
  return res.json();
}

export async function fetchApiChecks(apiId: string): Promise<ApiCheck[]> {
  const res = await fetch(`/api/apis/${apiId}/checks`);
  if (!res.ok) throw new Error("Failed to fetch checks");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function createApi(
  data: Omit<ApiEndpoint, "id" | "status" | "lastChecked" | "avgResponseTime" | "uptime" | "createdAt">
): Promise<ApiEndpoint> {
  const res = await fetch("/api/apis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create API");
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function createAlert(data: { apiId: string; email: string }): Promise<Alert> {
  const res = await fetch("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}

export async function deleteAlert(id: string): Promise<void> {
  const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete alert");
}

export async function toggleAlert(id: string, enabled: boolean): Promise<Alert> {
  const res = await fetch(`/api/alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to toggle alert");
  return res.json();
}

export async function triggerCheck(apiId: string): Promise<void> {
  const res = await fetch(`/api/apis/${apiId}/hit`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger check");
}

export async function fetchAlertLogs(): Promise<AlertLog[]> {
  const res = await fetch("/api/alert-logs");
  if (!res.ok) throw new Error("Failed to fetch alert logs");
  return res.json();
}

export async function verifyEndpoint(
  url: string,
  method: string,
  body?: string,
  bodyType?: string
): Promise<{ reachable: boolean; status?: number; statusText?: string; error?: string }> {
  const res = await fetch("/api/apis/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, method, body, bodyType }),
  });
  return res.json();
}

export async function deleteApi(id: string): Promise<void> {
  const res = await fetch(`/api/apis/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete API");
}

export async function triggerCheckAll(): Promise<{ enqueued: number; total: number }> {
  const res = await fetch("/api/apis/hit-all", { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger checks");
  return res.json();
}

export async function fetchAllChecks(): Promise<RecentCheck[]> {
  const res = await fetch("/api/checks");
  if (!res.ok) throw new Error("Failed to fetch checks");
  return res.json();
}


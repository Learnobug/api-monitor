export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ApiStatus = "healthy" | "degraded" | "down";

export interface ApiEndpoint {
  id: string;
  monitorId?: string | null;
  name: string;
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  expectedStatus: number;
  timeout: number;
  frequency: number;
  status: ApiStatus;
  lastChecked: string | null;
  avgResponseTime: number | null;
  uptime: number;
  createdAt: string;
}

export interface ApiCheck {
  id: string;
  apiId: string;
  status: number;
  responseTime: number;
  success: boolean;
  checkedAt: string;
  error?: string;
  trigger: "cron" | "manual";
}

export interface DashboardStats {
  totalApis: number;
  healthyApis: number;
  degradedApis: number;
  downApis: number;
  avgResponseTime: number;
  overallUptime: number;
}

export interface Alert {
  id: string;
  apiId: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  api: {
    id: string;
    name: string;
    url: string;
  };
}

export interface AlertLog {
  id: string;
  alertId: string;
  checkId: string;
  sentAt: string;
  error?: string | null;
  alert: {
    email: string;
    api: {
      id: string;
      name: string;
      url: string;
    };
  };
  check: {
    status: number;
    responseTime: number;
    success: boolean;
    error?: string | null;
  };
}

export interface RecentCheck extends ApiCheck {
  api: {
    id: string;
    name: string;
    url: string;
    method: string;
  };
}

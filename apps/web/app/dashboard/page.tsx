
"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats, useApis } from "../hooks/use-apis";
import { StatusBadge } from "../components/status-badge";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: apis, isLoading: apisLoading } = useApis();

  if (statsLoading || apisLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total APIs" value={stats?.totalApis ?? 0} color="indigo" />
        <StatCard label="Healthy" value={stats?.healthyApis ?? 0} color="green" />
        <StatCard label="Degraded" value={stats?.degradedApis ?? 0} color="yellow" />
        <StatCard label="Down" value={stats?.downApis ?? 0} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response time chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Avg Response Time (last 24h)
          </h2>
          <div className="h-64">
            {apis && apis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={apis.map((a) => ({
                    name: a.name,
                    time: Math.round(a.avgResponseTime ?? 0),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="ms" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm flex items-center justify-center h-full">
                No API data yet — add your first endpoint to see metrics.
              </p>
            )}
          </div>
        </div>

        {/* Uptime overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Overall Uptime
          </h2>
          <div className="flex flex-col items-center justify-center h-64">
            <span className="text-5xl font-bold text-indigo-600">
              {stats?.overallUptime.toFixed(1)}%
            </span>
            <span className="mt-2 text-sm text-gray-500">across all APIs</span>
          </div>
        </div>
      </div>

      {/* Recent APIs table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">API Endpoints</h2>
          <Link
            href="/dashboard/apis"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Avg Response</th>
                <th className="px-5 py-3 font-medium">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {apis?.map((api) => (
                <tr
                  key={api.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/apis/${api.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {api.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500 truncate max-w-50">
                    {api.url}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                      {api.method}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={api.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {api.avgResponseTime != null
                      ? `${api.avgResponseTime}ms`
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{api.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "indigo" | "green" | "yellow" | "red";
}) {
  const bg: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${bg[color]?.split(" ")[1]}`}>
        {value}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 h-80" />
        <div className="bg-white rounded-xl border border-gray-200 h-80" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 h-64" />
    </div>
  );
}

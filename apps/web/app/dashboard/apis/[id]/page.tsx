"use client";

import { useParams, useRouter } from "next/navigation";
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
import { useApi, useApiChecks, useTriggerCheck, useDeleteApi } from "../../../hooks/use-apis";
import { StatusBadge } from "../../../components/status-badge";

export default function ApiDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: api, isLoading } = useApi(id);
  const { data: checks } = useApiChecks(id);
  const triggerCheck = useTriggerCheck();
  const deleteApi = useDeleteApi();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-xl border h-32" />
        <div className="bg-white rounded-xl border h-80" />
      </div>
    );
  }

  if (!api) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-700">API not found</h2>
        <Link href="/dashboard/apis" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          ← Back to APIs
        </Link>
      </div>
    );
  }

  const chartData =
    checks
      ?.slice()
      .reverse()
      .map((c) => ({
        time: new Date(c.checkedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        responseTime: Math.round(c.responseTime),
      })) ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/apis"
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        ← Back to APIs
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
              <StatusBadge status={api.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{api.url}</p>
          </div>
          <div className="flex items-center gap-3 self-start">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded font-mono text-sm font-medium">
              {api.method}
            </span>
            <button
              onClick={() => triggerCheck.mutate(id)}
              disabled={triggerCheck.isPending}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {triggerCheck.isPending ? "Checking…" : "Hit Endpoint"}
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this endpoint? All checks and alerts will be removed.")) {
                  deleteApi.mutate(id, { onSuccess: () => router.push("/dashboard/apis") });
                }
              }}
              disabled={deleteApi.isPending}
              className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleteApi.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <DetailStat label="Uptime" value={`${api.uptime}%`} />
          <DetailStat
            label="Avg Response Time"
            value={api.avgResponseTime != null ? `${api.avgResponseTime}ms` : "—"}
          />
          <DetailStat label="Timeout" value={`${api.timeout}ms`} />
          <DetailStat
            label="Check Frequency"
            value={formatFrequency(api.frequency)}
          />
        </div>
      </div>

      {/* Response time chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Response Time History
        </h2>
        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="ms" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-10 text-center">
            No check data yet
          </p>
        )}
      </div>

      {/* Recent checks – split by trigger */}
      {(() => {
        const cronChecks = checks?.filter((c) => c.trigger === "cron") ?? [];
        const manualChecks = checks?.filter((c) => c.trigger !== "cron") ?? [];

        return (
          <>
            {/* Cron (Scheduled) Checks */}
            <div className="bg-white rounded-xl border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 p-5 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                Scheduled Checks (Cron)
                <span className="ml-auto text-xs font-normal text-gray-400">{cronChecks.length} results</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Response Time</th>
                      <th className="px-5 py-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronChecks.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No scheduled checks yet</td></tr>
                    ) : (
                      cronChecks.slice(0, 10).map((check) => (
                        <tr key={check.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 text-gray-600">{new Date(check.checkedAt).toLocaleString()}</td>
                          <td className="px-5 py-3 font-mono">{check.status}</td>
                          <td className="px-5 py-3 text-gray-600">{Math.round(check.responseTime)}ms</td>
                          <td className="px-5 py-3">
                            {check.success ? (
                              <span className="text-green-600 font-medium">✓ Pass</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ Fail</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Checks */}
            <div className="bg-white rounded-xl border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 p-5 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                Manual Checks
                <span className="ml-auto text-xs font-normal text-gray-400">{manualChecks.length} results</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Response Time</th>
                      <th className="px-5 py-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualChecks.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No manual checks yet</td></tr>
                    ) : (
                      manualChecks.slice(0, 10).map((check) => (
                        <tr key={check.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 text-gray-600">{new Date(check.checkedAt).toLocaleString()}</td>
                          <td className="px-5 py-3 font-mono">{check.status}</td>
                          <td className="px-5 py-3 text-gray-600">{Math.round(check.responseTime)}ms</td>
                          <td className="px-5 py-3">
                            {check.success ? (
                              <span className="text-green-600 font-medium">✓ Pass</span>
                            ) : (
                              <span className="text-red-600 font-medium">✗ Fail</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function formatFrequency(ms: number): string {
  const map: Record<number, string> = {
    86400000: "Every day",
    172800000: "Every 2 days",
    259200000: "Every 3 days",
    345600000: "Every 4 days",
    604800000: "Weekly",
  };
  return map[ms] ?? `${(ms / 1000).toFixed(0)}s`;
}

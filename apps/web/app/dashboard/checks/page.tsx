"use client";

import { useState } from "react";
import Link from "next/link";
import { useAllChecks } from "../../hooks/use-apis";

export default function RecentHitsPage() {
  const { data: checks, isLoading } = useAllChecks();
  const [filter, setFilter] = useState<"all" | "cron" | "manual">("all");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-14" />
        ))}
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? checks
      : checks?.filter((c) => c.trigger === filter);

  const cronCount = checks?.filter((c) => c.trigger === "cron").length ?? 0;
  const manualCount = checks?.filter((c) => c.trigger !== "cron").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Recent Hits</h2>
        <p className="text-sm text-gray-500 mt-1">
          All endpoint checks across every API — {checks?.length ?? 0} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: "all", label: `All (${checks?.length ?? 0})` },
            { key: "cron", label: `Scheduled (${cronCount})` },
            { key: "manual", label: `Manual (${manualCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">API</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Response</th>
                <th className="px-5 py-3 font-medium">Trigger</th>
                <th className="px-5 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No checks found
                  </td>
                </tr>
              )}
              {filtered?.map((check) => (
                <tr
                  key={check.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/apis/${check.api.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {check.api.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-50 truncate">
                    {check.api.url}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(check.checkedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-mono">{check.status}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {Math.round(check.responseTime)}ms
                  </td>
                  <td className="px-5 py-3">
                    {check.trigger === "cron" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Cron
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Manual
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {check.success ? (
                      <span className="text-green-600 font-medium">✓ Pass</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Fail</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

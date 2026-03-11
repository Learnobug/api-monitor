"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApis, useDeleteApi, useTriggerCheckAll } from "../../hooks/use-apis";
import { StatusBadge } from "../../components/status-badge";

export default function ApisListPage() {
  const { data: apis, isLoading } = useApis();
  const deleteApi = useDeleteApi();
  const checkAll = useTriggerCheckAll();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-20" />
        ))}
      </div>
    );
  }

  const filtered = apis?.filter((api) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      api.name.toLowerCase().includes(q) ||
      api.url.toLowerCase().includes(q) ||
      api.method.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Endpoints</h2>
          <p className="text-sm text-gray-500 mt-1">
            {apis?.length ?? 0} endpoints configured
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => checkAll.mutate()}
            disabled={checkAll.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {checkAll.isPending ? "Checking…" : "⚡ Check All"}
          </button>
          <Link
            href="/dashboard/apis/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + New API
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, URL, or method…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Check all result banner */}
      {checkAll.isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          Successfully enqueued checks for {checkAll.data.enqueued} of {checkAll.data.total} endpoints. Results will appear shortly.
        </div>
      )}
      {checkAll.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Failed to trigger checks: {(checkAll.error as Error).message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered?.map((api) => (
          <div
            key={api.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <Link
              href={`/dashboard/apis/${api.id}`}
              className="block"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {api.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {api.url}
                  </p>
                </div>
                <StatusBadge status={api.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-400">Method</p>
                  <p className="text-sm font-mono font-medium text-gray-700">
                    {api.method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Response</p>
                  <p className="text-sm font-medium text-gray-700">
                    {api.avgResponseTime != null
                      ? `${api.avgResponseTime}ms`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="text-sm font-medium text-gray-700">
                    {api.uptime}%
                  </p>
                </div>
              </div>
            </Link>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete "${api.name}"? All checks and alerts will be removed.`)) {
                    deleteApi.mutate(api.id);
                  }
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

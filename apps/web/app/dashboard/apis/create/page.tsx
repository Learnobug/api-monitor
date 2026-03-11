"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCreateApi } from "../../../hooks/use-apis";
import { verifyEndpoint } from "../../../services/api";
import type { HttpMethod } from "../../../types/api";

export default function CreateApiPage() {
  const router = useRouter();
  const createApi = useCreateApi();

  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "GET" as HttpMethod,
    expectedStatus: "200",
    timeout: "5000",
    frequency: "86400000",
  });

  const [verifyState, setVerifyState] = useState<{
    loading: boolean;
    result?: { reachable: boolean; status?: number; statusText?: string; error?: string };
  }>({ loading: false });

  function generatemonitorID(){
    return Math.random().toString(36).substr(2, 9);
  }

  async function handleVerify() {
    if (!form.url) return;
    setVerifyState({ loading: true });
    const result = await verifyEndpoint(form.url, form.method);
    setVerifyState({ loading: false, result });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const monitorId = generatemonitorID();
    createApi.mutate(
      {
        name: form.name,
        url: form.url,
        method: form.method,
        expectedStatus: Number(form.expectedStatus),
        timeout: Number(form.timeout),
        frequency: Number(form.frequency),
        monitorId,
      },
      {
        onSuccess: () => router.push("/dashboard/apis"),
      }
    );
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "url" || field === "method") {
      setVerifyState({ loading: false });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Add New API Endpoint
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. User Service"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL
          </label>
          <div className="flex gap-2">
            <input
              id="url"
              type="url"
              required
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://api.example.com/health"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={!form.url || verifyState.loading}
              className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              {verifyState.loading ? "Checking…" : "Verify"}
            </button>
          </div>
          {verifyState.result && (
            <div
              className={`mt-2 text-sm flex items-center gap-1.5 ${
                verifyState.result.reachable ? "text-green-600" : "text-red-600"
              }`}
            >
              {verifyState.result.reachable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Reachable — {verifyState.result.status} {verifyState.result.statusText}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Unreachable — {verifyState.result.error}
                </>
              )}
            </div>
          )}
        </div>

        {/* Method */}
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            HTTP Method
          </label>
          <select
            id="method"
            value={form.method}
            onChange={(e) => update("method", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        {/* Expected status & timeout in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expectedStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Status Code
            </label>
            <input
              id="expectedStatus"
              type="number"
              required
              value={form.expectedStatus}
              onChange={(e) => update("expectedStatus", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
              Timeout (ms)
            </label>
            <input
              id="timeout"
              type="number"
              required
              value={form.timeout}
              onChange={(e) => update("timeout", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Check Frequency
          </label>
          <select
            id="frequency"
            value={form.frequency}
            onChange={(e) => update("frequency", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="86400000">Every day</option>
            <option value="172800000">Every 2 days</option>
            <option value="259200000">Every 3 days</option>
            <option value="345600000">Every 4 days</option>
            <option value="604800000">Weekly</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createApi.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {createApi.isPending ? "Creating..." : "Create API"}
          </button>
        </div>
      </form>
    </div>
  );
}

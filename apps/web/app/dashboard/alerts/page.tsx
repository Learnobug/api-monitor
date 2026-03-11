"use client";

import { useState, type FormEvent } from "react";
import {
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  useToggleAlert,
  useApis,
  useAlertLogs,
} from "../../hooks/use-apis";

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const { data: apis } = useApis();
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();
  const toggleAlert = useToggleAlert();
  const { data: alertLogs, isLoading: logsLoading } = useAlertLogs();

  const [apiId, setApiId] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!apiId || !email) return;
    createAlert.mutate(
      { apiId, email },
      {
        onSuccess: () => {
          setApiId("");
          setEmail("");
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Alerts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure email alerts for your API endpoints
        </p>
      </div>

      {/* Create alert form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold text-gray-700">
          Add New Alert
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="apiId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Endpoint
            </label>
            <select
              id="apiId"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select an API...</option>
              {apis?.map((api) => (
                <option key={api.id} value={api.id}>
                  {api.name} — {api.url}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alerts@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={createAlert.isPending}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createAlert.isPending ? "Adding..." : "Add Alert"}
            </button>
          </div>
        </div>
      </form>

      {/* Alerts list */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border h-16"
            />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-lg font-semibold text-gray-700">
            No alerts configured
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Add an alert above to get notified when an API fails.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {alert.api.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {alert.api.url} → {alert.email}
                </p>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() =>
                    toggleAlert.mutate({
                      id: alert.id,
                      enabled: !alert.enabled,
                    })
                  }
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    alert.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {alert.enabled ? "Enabled" : "Disabled"}
                </button>
                <button
                  onClick={() => deleteAlert.mutate(alert.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 p-5 border-b border-gray-100">
          Alert History
        </h2>
        {logsLoading ? (
          <div className="animate-pulse p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        ) : !alertLogs || alertLogs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-sm">No alert notifications sent yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">API</th>
                  <th className="px-5 py-3 font-medium">Sent To</th>
                  <th className="px-5 py-3 font-medium">Status Code</th>
                  <th className="px-5 py-3 font-medium">Error</th>
                  <th className="px-5 py-3 font-medium">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {alertLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">
                        {log.alert.api.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {log.alert.email}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      <span
                        className={
                          log.check.success
                            ? "text-green-600"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {log.check.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-50 truncate">
                      {log.check.error || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {log.error ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Sent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

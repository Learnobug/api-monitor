export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your monitoring preferences
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm">General</h3>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Default check frequency
            </p>
            <p className="text-xs text-gray-400">
              Used when creating new API endpoints
            </p>
          </div>
          <select className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
            <option>15 seconds</option>
            <option>30 seconds</option>
            <option selected>60 seconds</option>
            <option>5 minutes</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Default timeout
            </p>
            <p className="text-xs text-gray-400">
              Maximum wait time per request
            </p>
          </div>
          <select className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
            <option>3000ms</option>
            <option selected>5000ms</option>
            <option>10000ms</option>
          </select>
        </div>
      </div>
    </div>
  );
}

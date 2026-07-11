import { useEffect, useState, useCallback } from "react";
import { fetchAssets } from "../api/assetApi";
import AssetFormModal from "./AssetFormModal";
import AssetDetailsModal from "./AssetDetailsModal";

const STATUS_STYLES = {
  Operational: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  "Issue Reported": "bg-amber-900/40 text-amber-300 border-amber-700",
  "Under Inspection": "bg-sky-900/40 text-sky-300 border-sky-700",
  "Under Maintenance": "bg-violet-900/40 text-violet-300 border-violet-700",
  "Out of Service": "bg-red-900/40 text-red-300 border-red-700",
  Retired: "bg-gray-800 text-gray-400 border-gray-700",
};

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAssets({ search, status: statusFilter });
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(loadAssets, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [loadAssets]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-sm text-gray-400">
            Register and manage every physical asset
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition self-start"
        >
          + Register Asset
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or asset code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm outline-none focus:border-violet-500 transition"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm outline-none focus:border-violet-500 transition"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg py-2 px-3 mb-4">
          {error}
        </p>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-850 border-b border-gray-800 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Asset</th>
              <th className="text-left px-4 py-3 font-semibold">Code</th>
              <th className="text-left px-4 py-3 font-semibold">Category</th>
              <th className="text-left px-4 py-3 font-semibold">Location</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">
                Next Service
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No assets found
                </td>
              </tr>
            )}
            {!loading &&
              assets.map((asset) => (
                <tr
                  key={asset._id}
                  onClick={() => setSelectedAssetId(asset._id)}
                  className="border-b border-gray-800 last:border-0 hover:bg-gray-800/60 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {asset.assetCode}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{asset.category}</td>
                  <td className="px-4 py-3 text-gray-400">{asset.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[asset.status] || ""}`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {asset.nextServiceDate
                      ? new Date(asset.nextServiceDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <AssetFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadAssets();
          }}
        />
      )}

      {selectedAssetId && (
        <AssetDetailsModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onUpdated={loadAssets}
        />
      )}
    </div>
  );
}

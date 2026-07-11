import { useEffect, useState } from "react";
import {
  fetchAssetById,
  updateAssetRequest,
  retireAssetRequest,
} from "../api/assetApi";

const STATUS_OPTIONS = [
  "Operational",
  "Issue Reported",
  "Under Inspection",
  "Under Maintenance",
  "Out of Service",
  "Retired",
];

export default function AssetDetailsModal({ assetId, onClose, onUpdated }) {
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Link");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAssetById(assetId);
      setAsset(data.asset);
      setHistory(data.history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const handleStatusChange = async (status) => {
    setMessage("");
    try {
      const updated = await updateAssetRequest(assetId, { status });
      setAsset(updated);
      setMessage(`Status updated to ${status}`);
      onUpdated?.();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRetire = async () => {
    if (
      !confirm("Retire this asset? It will remain readable but marked Retired.")
    )
      return;
    try {
      const updated = await retireAssetRequest(assetId);
      setAsset(updated);
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyLink = async () => {
    if (!asset) return;
    await navigator.clipboard.writeText(asset.publicUrl);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy Link"), 1500);
  };

  const handleDownloadQr = () => {
    if (!asset) return;
    const link = document.createElement("a");
    link.href = asset.qrCodeDataUrl;
    link.download = `${asset.assetCode}-qr.png`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-100 text-xl leading-none"
        >
          &times;
        </button>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {error && (
          <p className="text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-lg py-2 px-3 mb-4">
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs text-violet-300 bg-violet-950/40 border border-violet-800 rounded-lg py-2 px-3 mb-4">
            {message}
          </p>
        )}

        {asset && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: details */}
            <div>
              <h2 className="text-xl font-bold">{asset.name}</h2>
              <p className="text-xs text-gray-500 font-mono mb-4">
                {asset.assetCode}
              </p>

              <dl className="text-sm space-y-2 mb-5">
                <Row label="Category" value={asset.category} />
                <Row label="Location" value={asset.location} />
                <Row label="Condition" value={asset.condition} />
                <Row
                  label="Last Service"
                  value={
                    asset.lastServiceDate
                      ? new Date(asset.lastServiceDate).toLocaleDateString()
                      : "—"
                  }
                />
                <Row
                  label="Next Service"
                  value={
                    asset.nextServiceDate
                      ? new Date(asset.nextServiceDate).toLocaleDateString()
                      : "—"
                  }
                />
                {asset.model && <Row label="Model" value={asset.model} />}
                {asset.serialNumber && (
                  <Row label="Serial No." value={asset.serialNumber} />
                )}
              </dl>

              <label className="text-xs text-gray-400 mb-1 block">Status</label>
              <select
                value={asset.status}
                disabled={asset.isRetired}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition mb-4"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {!asset.isRetired && (
                <button
                  onClick={handleRetire}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Retire this asset
                </button>
              )}

              <h3 className="text-sm font-semibold mt-6 mb-2">
                Activity History
              </h3>
              <ul className="text-xs text-gray-400 space-y-2 max-h-40 overflow-y-auto pr-1">
                {history.length === 0 && <li>No history yet</li>}
                {history.map((h) => (
                  <li key={h._id} className="border-l-2 border-gray-800 pl-3">
                    <span className="text-gray-300">{h.action}</span>
                    <br />
                    <span className="text-gray-600">
                      {new Date(h.createdAt).toLocaleString()}{" "}
                      {h.actor?.name ? `· ${h.actor.name}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: QR + public actions */}
            <div className="flex flex-col items-center bg-gray-950 border border-gray-800 rounded-xl p-5">
              <img
                src={asset.qrCodeDataUrl}
                alt="Asset QR code"
                className="w-40 h-40 mb-4 rounded-lg bg-white p-2"
              />
              <p className="text-xs text-gray-500 break-all text-center mb-4">
                {asset.publicUrl}
              </p>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleDownloadQr}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  Download QR
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm font-semibold py-2 rounded-lg transition"
                >
                  {copyLabel}
                </button>
                <a
                  href={asset.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm font-semibold py-2 rounded-lg transition"
                >
                  Open Public Page
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-200">{value}</dd>
    </div>
  );
}

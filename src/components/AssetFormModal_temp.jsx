import { useState } from "react";
import { createAssetRequest } from "../api/assetApi";

export default function AssetFormModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    condition: "Good",
    lastServiceDate: "",
    nextServiceDate: "",
    model: "",
    serialNumber: "",
    purchaseCost: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createAssetRequest({
        ...form,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : 0,
        lastServiceDate: form.lastServiceDate || null,
        nextServiceDate: form.nextServiceDate || null,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-100 text-xl leading-none"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-1">Register Asset</h2>
        <p className="text-xs text-gray-400 mb-5">
          A unique asset code and QR link will be generated automatically
        </p>

        {error && (
          <p className="text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-lg py-2 px-3 mb-4">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <Field label="Asset Name *">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Classroom Projector 01"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <input
                required
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Electronics"
                className={inputClass}
              />
            </Field>
            <Field label="Location *">
              <input
                required
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Room 204"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value)}
              className={inputClass}
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
              <option>Critical</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Last Service Date">
              <input
                type="date"
                value={form.lastServiceDate}
                onChange={(e) => update("lastServiceDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Next Service Date">
              <input
                type="date"
                value={form.nextServiceDate}
                onChange={(e) => update("nextServiceDate", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Model">
              <input
                value={form.model}
                onChange={(e) => update("model", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Serial Number">
              <input
                value={form.serialNumber}
                onChange={(e) => update("serialNumber", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Purchase Cost">
            <input
              type="number"
              min="0"
              value={form.purchaseCost}
              onChange={(e) => update("purchaseCost", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Internal Notes (never shown publicly)">
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Asset"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

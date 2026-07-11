import { useState } from "react";
import { reportIssueRequest } from "../api/issueApi";

export default function IssueReportModal({ assetCode, onClose }) {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe what the problem is");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const issue = await reportIssueRequest(assetCode, {
        description,
        priority,
        reporterName,
        reporterContact,
      });
      setSubmittedIssue(issue);
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-100 text-xl leading-none"
        >
          &times;
        </button>

        {submittedIssue ? (
          <div className="text-center py-4">
            <h2 className="text-xl font-bold mb-2">Issue Reported ✅</h2>
            <p className="text-sm text-gray-400 mb-1">Reference number</p>
            <p className="text-lg font-mono text-violet-400 mb-4">
              {submittedIssue.issueNumber}
            </p>
            <p className="text-xs text-gray-500">
              Save this number if you'd like to check the status later.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm font-semibold py-2.5 rounded-lg transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-1">Report an Issue</h2>
            <p className="text-xs text-gray-400 mb-5">
              Tell us what's wrong with this asset
            </p>

            {error && (
              <p className="text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-lg py-2 px-3 mb-4">
                {error}
              </p>
            )}

            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  What's the problem? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI"
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (safety concern)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Your Name (optional)
                </label>
                <input
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Phone / Email (optional)
                </label>
                <input
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="For follow-up if needed"
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

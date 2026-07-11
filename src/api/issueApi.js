const API_BASE = "http://localhost:5000/api/issues";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchIssuesForAsset = async (assetId) => {
  const res = await fetch(`${API_BASE}?asset=${assetId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Issues load nahi ho sakay");
  return data.issues;
};

export const triageIssueRequest = async (assetCode, complaint) => {
  const res = await fetch(`${API_BASE}/triage/${assetCode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complaint }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "AI Triage available nahi hai");
  return data.suggestion;
};

export const reportIssueRequest = async (assetCode, payload) => {
  const res = await fetch(`${API_BASE}/public/${assetCode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Issue report nahi ho saki");
  return data.issue;
};

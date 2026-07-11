const API_BASE = "http://localhost:5000/api/assets";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchAssets = async ({
  search = "",
  category = "",
  location = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (location) params.set("location", location);
  if (status) params.set("status", status);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Assets load nahi ho sake");
  return data.assets;
};

export const fetchAssetById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Asset load nahi hua");
  return data; // { asset, history }
};

export const fetchPublicAsset = async (assetCode) => {
  const res = await fetch(`${API_BASE}/public/${assetCode}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Asset nahi mila");
  return data; // { asset, recentActivity }
};

export const createAssetRequest = async (payload) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Asset create nahi hua");
  return data.asset;
};

export const updateAssetRequest = async (id, payload) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Asset update nahi hua");
  return data.asset;
};

export const retireAssetRequest = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/retire`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Asset retire nahi hua");
  return data.asset;
};

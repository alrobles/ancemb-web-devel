// API client for the AncEmb backend (FastAPI, read-only db_mvp mirror).
// CORS is open; override with VITE_API_BASE when pointing at a staging API.
export const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://ancemb.ecoseek.org';

async function get(path, params = {}) {
  const url = new URL(API_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => get('/api/health'),
  stats: () => get('/api/stats'),
  families: () => get('/api/families'),
  family: (family) => get(`/api/families/${encodeURIComponent(family)}`),
  familySequences: (family, params = {}) =>
    get(`/api/families/${encodeURIComponent(family)}/sequences`, params),
  familyRanking: (family, params = {}) =>
    get(`/api/families/${encodeURIComponent(family)}/ranking`, params),
  nodeScores: (family, node) =>
    get(`/api/families/${encodeURIComponent(family)}/nodes/${encodeURIComponent(node)}/scores`),
  sequence: (family, sid) =>
    get(`/api/sequences/${encodeURIComponent(family)}/${encodeURIComponent(sid)}`),
  embedding: (family, sid, dims = 0) =>
    get(`/api/sequences/${encodeURIComponent(family)}/${encodeURIComponent(sid)}/embedding`, { dims }),
  neighbours: (family, sid, top = 10) =>
    get('/api/neighbours', { family, sequence_id: sid, top }),
  pca: (family) => get(`/api/families/${encodeURIComponent(family)}/embedding_pca`),
  fileUrl: (family, name) =>
    `${API_BASE}/api/families/${encodeURIComponent(family)}/files/${encodeURIComponent(name)}`,
};

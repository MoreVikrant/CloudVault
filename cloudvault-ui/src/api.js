// Every call goes to Drive-Service (/api/...). Storage-Service stays internal.
async function parse(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const b = await res.json(); msg = b.detail || b.message || msg; } catch { /* empty body */ }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const listItems = (parentId) =>
  fetch('/api/items' + (parentId ? `?parentId=${parentId}` : '')).then(parse);

export const createFolder = (name, parentId) =>
  fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentId: parentId || null }),
  }).then(parse);

export const uploadFile = (file, parentId) => {
  const form = new FormData();
  form.append('file', file);
  if (parentId) form.append('parentId', parentId);
  return fetch('/api/files', { method: 'POST', body: form }).then(parse);
};

export const deleteItem = (id) => fetch('/api/items/' + id, { method: 'DELETE' }).then(parse);

export const downloadUrl = (id) => '/api/files/' + id;
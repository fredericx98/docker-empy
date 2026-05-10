const BASE = import.meta.env.VITE_API_URL ?? ''

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  get:  (path)        => request(path),
  post: (path, body)  => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put:  (path, body)  => request(path, { method: 'PUT',  body: JSON.stringify(body) }),
  del:  (path)        => request(path, { method: 'DELETE' }),
}

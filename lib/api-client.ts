// Client HTTP léger pour communiquer avec les routes API Next.js.

async function handle(res: Response) {
  if (!res.ok) {
    let msg = "Erreur réseau"
    try {
      const data = await res.json()
      msg = data.error || msg
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  list: (resource: string) => fetch(`/api/${resource}`).then(handle),
  create: (resource: string, body: unknown) =>
    fetch(`/api/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  update: (resource: string, id: string, body: unknown) =>
    fetch(`/api/${resource}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),
  remove: (resource: string, id: string) =>
    fetch(`/api/${resource}/${id}`, { method: "DELETE" }).then(handle),
}

// Fetcher pour SWR
export const fetcher = (url: string) => fetch(url).then(handle)

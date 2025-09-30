import { useEffect, useState } from "react"

export default function App() {
  const [persons, setPersons] = useState([])
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/persons")
        if (!res.ok) throw new Error(`GET /api/persons ${res.status}`)
        const data = await res.json()
        if (!cancelled) setPersons(data)
      } catch (e) {
        if (!cancelled) setError(e.message || "Fetch failed")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, number }),
      })
      if (!res.ok) {
        const maybeJson = await res.json().catch(() => ({}))
        throw new Error(maybeJson.error || `POST /api/persons ${res.status}`)
      }
      const created = await res.json()
      setPersons(prev => prev.concat(created))
      setName("")
      setNumber("")
    } catch (e) {
      setError(e.message || "Create failed")
    }
  }

  async function handleDelete(id) {
    setError("")
    try {
      const res = await fetch(`/api/persons/${id}`, { method: "DELETE" })
      if (!res.ok && res.status !== 204) throw new Error(`DELETE /api/persons/${id} ${res.status}`)
      setPersons(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      setError(e.message || "Delete failed")
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Puhelinluettelo</h1>

      <section style={{ marginBottom: "1rem" }}>
        <h2>Lisää uusi</h2>
        <form onSubmit={handleAdd} style={{ display: "grid", gap: ".5rem", maxWidth: 420 }}>
          <label>
            Nimi
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label>
            Puhelinnumero
            <input value={number} onChange={e => setNumber(e.target.value)} required />
          </label>
          <button type="submit">Lisää</button>
        </form>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </section>

      <section>
        <h2>Numerot</h2>
        {loading && <p>Ladataan…</p>}
        {!loading && persons.length === 0 && <p>Ei numeroita.</p>}
        <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: ".5rem" }}>
          {persons.map(p => (
            <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #ddd", padding: ".5rem .75rem", borderRadius: 8 }}>
              <span>{p.name} — {p.number}</span>
              <button onClick={() => handleDelete(p.id)}>delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

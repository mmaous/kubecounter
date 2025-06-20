import { useState, useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

type Counter = {
  id: number;
  name: string;
  value: number;
};

export default function CounterForm() {
  const [name, setName] = useState("");
  const [value, setValue] = useState(0);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchCounters = async () => {
    try {
      const res = await fetch(`${apiUrl}/counters`);
      if (!res.ok) throw new Error("Failed to fetch counters");
      const data = await res.json();
      setCounters(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading counters.");
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const method = editingId !== null ? "PUT" : "POST";
      const url =
        editingId !== null
          ? `${apiUrl}/counter/${editingId}`
          : `${apiUrl}/counter`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: Number(value) }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit data");
      }

      setName("");
      setValue(0);
      setEditingId(null);
      setError("");
      fetchCounters();
    } catch (err: any) {
      setError(err.message || "Something went wrong during submission.");
    }
  };

  const startEdit = (counter: Counter) => {
    setName(counter.name);
    setValue(counter.value);
    setEditingId(counter.id);
    setError("");
  };

  const deleteCounter = async (id: number) => {
    if (!confirm("Are you sure you want to delete this counter?")) return;
    try {
      const res = await fetch(`${apiUrl}/counter/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete counter");
      fetchCounters();
    } catch (err: any) {
      setError(err.message || "Something went wrong during deletion.");
    }
  };
  return (
    <div style={styles.container}>
        {error && <div style={styles.alert}>{error}</div>}
        <form onSubmit={submit} style={styles.form}>
          <h1 style={{ textAlign: "center" }}>kube-counter</h1>
          <input
            style={styles.input}
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            required
          />
          <button type="submit" style={styles.button}>
            {editingId !== null ? "Update" : "Submit"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              style={{ ...styles.button, backgroundColor: "grey", marginTop: "4px" }}
              onClick={() => {
                setEditingId(null);
                setName("");
                setValue(0);
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div style={styles.list}>
          <h2>Saved Counters</h2>
          {(counters ?? []).map((c) => (
            <div key={c.id} style={styles.card}>
              <span><strong>{c.id} : </strong>{c.name} = {c.value}</span>
              <div>
              <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={() => startEdit(c)}>
                edit
              </button>
              <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => deleteCounter(c.id)}>
                delete
              </button>
              </div>

            </div>
          ))}
        </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "2rem",
    flexDirection: "row" as const, 
    gap: "1rem"
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    minWidth: "300px",
    minHeight: "250px",
  },
  input: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "5px",
    backgroundColor: "#fff",
  },
  button: {
    cursor: "pointer",
    color: "white",
    background: "#00050a",
    borderRadius: "10px",
    padding: "0.5rem 1rem",
    border: "none",
  },
  list: {
    backgroundColor: "#fff",
    padding: "1rem",
    border: "1px solid #eee",
    borderRadius: "8px",        
    minWidth: "300px",
        minHeight: "250px",
  },
  card: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    marginLeft: "1rem",
    cursor: "pointer",
    backgroundColor: "#00050a",
    border: "none",
    color: "white",
    borderRadius: "5px",
    padding: "2px 8px",
    fontSize: "0.8rem",
  },  
  editBtn: {
    backgroundColor: "#00050a",
  },  
  deleteBtn: {
    backgroundColor: "red",
  },  
  alert: {
    backgroundColor: "#ffdddd",
    color: "#b00020",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    border: "1px solid #f5c6cb",
  },
};
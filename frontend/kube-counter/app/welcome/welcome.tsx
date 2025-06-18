import { useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;


export default function CounterForm() {
  const [name, setName] = useState("");
  const [value, setValue] = useState(0);

  const submit = async (e: any) => {
    e.preventDefault();
    console.log({ apiUrl });

    await fetch(`${apiUrl}/counter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value: Number(value) }),
    });

    setName("");
    setValue(0);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.form}>
        <h1 style={{textAlign: 'center'}}>kube-counter</h1>
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
          Submit
        </button>
      </form>
    </div>
  );
}


const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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
    background: "black",
    borderRadius: "10px",
    padding: "0.5rem 1rem",
    border: "none",
  },
};
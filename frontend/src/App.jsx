import { useEffect, useState } from "react";

function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/summaries")
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>My AI OS 🚀</h1>

      {loading ? (
        <p>Loading summaries...</p>
      ) : (
        summaries.map((summary) => (
          <div
            key={summary.id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          >
            <h3>{summary.title}</h3>

            <p>{summary.content}</p>

            <small>Source: {summary.source}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
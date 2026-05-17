import { useEffect, useState } from "react";

function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");

  const fetchSummaries = () => {
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
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

 /* const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/api/summaries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            source,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      setTitle("");
      setContent("");
      setSource("");

      fetchSummaries();
    } catch (error) {
      console.error(error);
    }
  }; */
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let response;

    if (editingId) {
      response = await fetch(
        `http://localhost:3000/api/summaries/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            source,
          }),
        }
      );
    } else {
      response = await fetch(
        "http://localhost:3000/api/summaries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            source,
          }),
        }
      );
    }

    await response.json();

    setTitle("");
    setContent("");
    setSource("");

    setEditingId(null);

    fetchSummaries();
  } catch (error) {
    console.error(error);
  }
};


const handleDelete = async (id) => {
  try {
    await fetch(
      `http://localhost:3000/api/summaries/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchSummaries();
  } catch (error) {
    console.error(error);
  }
};

const [editingId, setEditingId] = useState(null);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h1>My AI OS 🚀</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <button type="submit">Save Summary</button>
      </form>

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
            <div style={{ marginTop: "10px" }}>
              <button
                  onClick={() => handleDelete(summary.id)}
                >
              Delete
              </button>

              <button
                  onClick={() => {
                    setEditingId(summary.id);

                    setTitle(summary.title);
                    setContent(summary.content);
                    setSource(summary.source);
      }}
                >
                 Edit
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default App;
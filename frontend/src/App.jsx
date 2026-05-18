/* import { useEffect, useState } from "react";

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
 /*const handleSubmit = async (e) => {
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
      <h1>VinhAn AI OS 🚀</h1>

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

export default App; */

import { useEffect, useState } from "react";

function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");

  const [editingId, setEditingId] = useState(null);

  const fetchSummaries = () => {
    fetch("http://localhost:3000/api/summaries")
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:3000/api/summaries/${editingId}`
      : "http://localhost:3000/api/summaries";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        source,
      }),
    });

    setTitle("");
    setContent("");
    setSource("");
    setEditingId(null);

    fetchSummaries();
  };

  const handleDelete = async (id) => {
    await fetch(
      `http://localhost:3000/api/summaries/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchSummaries();
  };



 /* return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          My AI OS 🚀
        </h1>

        <p className="text-gray-600 mb-8">
          AI summaries dashboard
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-md mb-8 space-y-4"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            className="w-full border p-3 rounded-lg h-32"
          />

          <input
            type="text"
            placeholder="Source"
            value={source}
            onChange={(e) =>
              setSource(e.target.value)
            }
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            {editingId
              ? "Update Summary"
              : "Save Summary"}
          </button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white p-6 rounded-2xl shadow-md"
              >
                <h2 className="text-2xl font-semibold mb-2">
                  {summary.title}
                </h2>

                <p className="text-gray-700 mb-4">
                  {summary.content}
                </p>

                <div className="flex items-center justify-between">
                  <small className="text-gray-500">
                    Source: {summary.source}
                  </small>

                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(summary.id);

                        setTitle(summary.title);
                        setContent(summary.content);
                        setSource(summary.source);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(summary.id)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ); */
  return (
  <div className="min-h-screen bg-zinc-950 text-white p-8">
    <div className="max-w-4xl mx-auto">
      
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-3">
          My AI OS 🚀
        </h1>

        <p className="text-zinc-400 text-lg">
          AI-powered summaries dashboard
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 space-y-4"
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-blue-500"
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl h-32 outline-none focus:border-blue-500"
        />

        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold"
        >
          {editingId
            ? "Update Summary"
            : "Save Summary"}
        </button>
      </form>

      {loading ? (
        <p className="text-zinc-400">
          Loading...
        </p>
      ) : summaries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <p className="text-zinc-400">
            No summaries yet 😄
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold mb-3">
                {summary.title}
              </h2>

              <p className="text-zinc-300 mb-5 leading-relaxed">
                {summary.content}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm">
                  {summary.source}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(summary.id);

                      setTitle(summary.title);
                      setContent(summary.content);
                      setSource(summary.source);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 transition text-black px-4 py-2 rounded-xl font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(summary.id)
                    }
                    className="bg-red-600 hover:bg-red-500 transition px-4 py-2 rounded-xl font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);


}

export default App;
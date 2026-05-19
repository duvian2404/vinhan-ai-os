require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const pool = require("./config/db");

const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "My AI OS backend is running 🚀",
  });
});

const PORT = process.env.PORT || 3000;


app.post("/api/ai-summary", async (req, res) => {
  
  try {
    const { content } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent(
      `Summarize this clearly:\n\n${content}`
    );

    const response = await result.response;

    const summary = response.text();

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "AI summary failed",
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
pool.connect()
  .then(() => {
    console.log("PostgreSQL connected 😄");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

app.get("/api/test-db", async (req, res) => { 
  try {
    const result = await pool.query(`
      INSERT INTO summaries (title, content, source)
      VALUES (
        'Test Summary',
        'AI summary test content',
        'system'
      )
      RETURNING *
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database insert failed",
    });
  }
});

app.post("/api/summaries", async (req, res) => {
  try {
    const { title, content, source } = req.body;

    const result = await pool.query(
      `
      INSERT INTO summaries (title, content, source)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, content, source]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to create summary",
    });
  }
});

app.get("/api/summaries", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM summaries
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch summaries",
    });
  }
});

app.delete("/api/summaries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM summaries
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Summary deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to delete summary",
    });
  }
});

app.put("/api/summaries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { title, content, source } = req.body;

    const result = await pool.query(
      `
      UPDATE summaries
      SET
        title = $1,
        content = $2,
        source = $3
      WHERE id = $4
      RETURNING *
      `,
      [title, content, source, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to update summary",
    });
  }
});


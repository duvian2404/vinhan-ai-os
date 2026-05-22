require("dotenv").config();
// const cho express
const express = require("express");
const cors = require("cors");
const app = express();

// const cho postgres pool
const pool = require("./config/db");

// const cho google gen ai sdk
const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//const cho axios va cheerio cho web scraping (nếu cần)
const axios = require("axios");
const cheerio = require("cheerio");

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "My AI OS backend is running 🚀",
  });
});
//const PORT = 3000;
const PORT = process.env.PORT || 3000;

// API endpoint cho AI summary
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


// API endpoints cho CRUD summaries
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

// API endpoint cho tạo summary mới
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

// API endpoint cho lấy tất cả summaries
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

// API endpoint cho xóa summary
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

// API endpoint cho cập nhật summary
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

// API endpoint cho tóm tắt bài báo từ URL
app.post("/api/article-summary", async (req, res) => {
  try {
    const { url } = req.body;

    
// Kiểm tra nếu đã có summary cho URL này trong DB
    const existingSummary = await pool.query(
  `
  SELECT * FROM summaries
  WHERE source = $1
  LIMIT 1
  `,
  [url]
);
// Nếu đã có thì trả về luôn, không cần gọi Gemini nữa
  if (existingSummary.rows.length > 0) {
  return res.json({
    success: true,
    summary:
      existingSummary.rows[0].content,
    cached: true,
  });
}
    // Fetch webpage
    const response = await axios.get(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  },
});

    // Load HTML
    const $ = cheerio.load(response.data);

    // Extract paragraphs
    let articleText = "";

    $("p").each((i, el) => {
      articleText += $(el).text() + "\n";
    });

    // Limit text size
    articleText = articleText.slice(0, 5000);

    // Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    // Generate summary
    const result = await model.generateContent(
      `
Hãy đọc bài viết sau và trả về:

1. Tiêu đề ngắn gọn bằng tiếng Việt
2. Bản tóm tắt rõ ràng bằng tiếng Việt

Format trả về:

TITLE:
...

SUMMARY:
...

Bài viết:

${articleText}
`
    );
    
   
    // Lấy response từ Gemini
    const aiResponse = await result.response;
    const fullText = aiResponse.text();
// Tách tiêu đề và summary từ response
const titleMatch =
  fullText.match(/TITLE:\s*(.*)/);

const summaryMatch =
  fullText.match(
    /SUMMARY:\s*([\s\S]*)/
  );

const aiTitle = titleMatch
  ? titleMatch[1]
  : "AI Article Summary";

const summary = summaryMatch
  ? summaryMatch[1]
  : fullText;
//    const summary = aiResponse.text();
// Lưu summary vào DB
    await pool.query(
  `
  INSERT INTO summaries
  (title, content, source)
  VALUES ($1, $2, $3) 
  ` ,
  [
    aiTitle,
    summary,
    url,
  ]  
);
console.log("SAVED!");
    res.json({
      success: true,
      summary,
      preview: articleText.slice(0, 300),
      title: aiTitle,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Article summary failed",
    });
  }
});


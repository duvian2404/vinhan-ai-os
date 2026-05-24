require("dotenv").config();
//=============== Imports =================
// Các thư viện cần thiết
const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const axios = require("axios");
const cheerio = require("cheerio");

const Parser = require("rss-parser");
const parser = new Parser();

const cron = require("node-cron");

//=============== Middleware =================
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

//=============== Khởi động server và kết nối DB =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
pool
  .connect()
  .then(() => {
    console.log("PostgreSQL connected 😄");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
// ===============API endpoint cho AI summary================
app.post("/api/ai-summary", async (req, res) => {
  try {
    const { content } = req.body;
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });
    const result = await model.generateContent(
      `Summarize this clearly:\n\n${content}`,
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

//=============== API endpoints cho summaries================
// API test cho DB
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
      [title, content, source],
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

// API endpoint cho xóa summary
app.delete("/api/summaries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM summaries
      WHERE id = $1
      `,
      [id],
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
      [title, content, source, id],
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

//===================API endpoint cho article summary=================

app.post("/api/article-summary", async (req, res) => {
  // Tách logic xử lý article summary ra một hàm riêng để có thể tái sử dụng cho cả API endpoint và RSS import

  try {
    const { url } = req.body;

    //const article = await processArticle(url);
    // Kiểm tra nếu đã có summary cho URL này trong DB
    const existingSummary = await pool.query(
      `
          SELECT * FROM summaries
          WHERE source = $1
          LIMIT 1
          `,
      [url],
    );
    // Nếu đã có thì trả về luôn, không cần gọi Gemini nữa
    if (existingSummary.rows.length > 0) {
      return res.json({
        success: true,
        summary: existingSummary.rows[0].content,
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
          3. 3 đến 5 tags liên quan

          Format trả về:

          TITLE:
          ...

          SUMMARY:
          ...

          TAGS:
          AI, OpenAI, Coding
          Bài viết:

          ${articleText}
          `,
    );

    // Lấy response từ Gemini
    const aiResponse = await result.response;
    const fullText = aiResponse.text();
    const titleMatch = fullText.match(/TITLE:\s*(.*)/);
    const summaryMatch = fullText.match(/SUMMARY:\s*([\s\S]*)/);
    const aiTitle = titleMatch ? titleMatch[1] : "AI Article Summary";
    const summary = summaryMatch ? summaryMatch[1] : fullText;
    const tagsMatch = fullText.match(/TAGS:\s*(.*)/);
    const tags = tagsMatch ? tagsMatch[1] : "";
    // Lưu summary vào DB
    await pool.query(
      `
      INSERT INTO summaries
      (title, content, source, tags)
      VALUES ($1, $2, $3, $4)
      `,
      [aiTitle, summary, url, tags],
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
//====================API endpoint cho test RSS feed=================
app.get("/api/rss-test", async (req, res) => {
  try {
    const feed = await parser.parseURL(
      "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    );

    const articles = feed.items.slice(0, 5);

    const simplified = articles.map((article) => ({
      title: article.title,
      link: article.link,
      pubDate: article.pubDate,
    }));

    res.json(simplified);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "RSS failed",
    });
  }
});
// //====================API endpoint cho import RSS feed và tạo summary=================
app.get("/api/rss-import", async (req, res) => {
  try {
    await importRSS();
    // const feed = await parser.parseURL(
    //   "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    // );

    // // const articles = feed.items.slice(0, 3);
    // // for (const article of articles) {
    // //   console.log(article.title);
    // // }
    // const imported = [];

    // for (const article of articles) {
    //   try {
    //     const processed = await processArticle(article.link);

    //     imported.push(processed);
    //   } catch (error) {
    //     console.log("FAILED:", article.link);
    //   }
    // }

    res.json({
      success: true,
      message: "RSS imported",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "RSS import failed",
    });
  }
});

// Hàm chính để import RSS feed và tạo summary cho các bài viết mới
async function importRSS() {
  const feed = await parser.parseURL("https://vietnamnet.vn/rss/cong-nghe.rss");

  const articles = feed.items.slice(0, 3);

  for (const article of articles) {
    try {
      await processArticle(article.link);

      console.log("✅ Imported:", article.title);
    } catch (error) {
      console.log("❌ Failed:", article.link);
    }
  }
}
// Hàm xử lý tóm tắt bài viết từ URL, có kiểm tra cache trước khi gọi Gemini
async function processArticle(url) {
  //   // CHECK CACHE
  //   const existingSummary = await pool.query(
  //     `
  //       SELECT *
  //       FROM summaries
  //       WHERE source = $1
  //       LIMIT 1
  //       `,
  //     [url],
  //   );

  //   if (existingSummary.rows.length > 0) {
  //     console.log("⚡ Cached:", url);

  //     return existingSummary.rows[0];
  //   }

  //   // SCRAPE ARTICLE
  //   const response = await axios.get(url, {
  //     headers: {
  //       "User-Agent": "Mozilla/5.0",
  //     },
  //   });

  //   const $ = cheerio.load(response.data);

  //   const articleText = $("p")
  //     .map((i, el) => $(el).text())
  //     .get()
  //     .join(" ");

  //   // AI
  //   const result = await model.generateContent(`
  // Hãy đọc bài viết sau và trả về:

  // 1. Tiêu đề ngắn gọn bằng tiếng Việt
  // 2. Tóm tắt rõ ràng bằng tiếng Việt
  // 3. 3 đến 5 tags liên quan

  // Format:

  // TITLE:
  // ...

  // SUMMARY:
  // ...

  // TAGS:
  // AI, Technology

  // Bài viết:

  // ${articleText}
  // `);

  //   const aiResponse = await result.response;

  //   const fullText = aiResponse.text();

  //   const titleMatch = fullText.match(/TITLE:\s*(.*)/);

  //   const summaryMatch = fullText.match(/SUMMARY:\s*([\s\S]*?)TAGS:/);

  //   const tagsMatch = fullText.match(/TAGS:\s*(.*)/);

  //   const aiTitle = titleMatch ? titleMatch[1] : "AI Summary";

  //   const summary = summaryMatch ? summaryMatch[1] : fullText;

  //   const tags = tagsMatch ? tagsMatch[1] : "";

  //   // SAVE DB
  //   await pool.query(
  //     `
  //     INSERT INTO summaries
  //     (title, content, source, tags)
  //     VALUES ($1, $2, $3, $4)
  //     `,
  //     [aiTitle, summary, url, tags],
  //   );

  //   console.log("✅ Saved:", aiTitle);

  //   return {
  //     title: aiTitle,
  //     content: summary,
  //     source: url,
  //     tags,
  //   };
  // }
  const existingSummary = await pool.query(
    `
          SELECT * FROM summaries
          WHERE source = $1
          LIMIT 1
          `,
    [url],
  );
  // Nếu đã có thì trả về luôn, không cần gọi Gemini nữa
  if (existingSummary.rows.length > 0) {
    return res.json({
      success: true,
      summary: existingSummary.rows[0].content,
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
          3. 3 đến 5 tags liên quan

          Format trả về:

          TITLE:
          ...

          SUMMARY:
          ...

          TAGS:
          AI, OpenAI, Coding
          Bài viết:

          ${articleText}
          `,
  );

  // Lấy response từ Gemini
  const aiResponse = await result.response;
  const fullText = aiResponse.text();
  const titleMatch = fullText.match(/TITLE:\s*(.*)/);
  const summaryMatch = fullText.match(/SUMMARY:\s*([\s\S]*)/);
  const aiTitle = titleMatch ? titleMatch[1] : "AI Article Summary";
  const summary = summaryMatch ? summaryMatch[1] : fullText;
  const tagsMatch = fullText.match(/TAGS:\s*(.*)/);
  const tags = tagsMatch ? tagsMatch[1] : "";
  // Lưu summary vào DB
  await pool.query(
    `
      INSERT INTO summaries
      (title, content, source, tags)
      VALUES ($1, $2, $3, $4)
      `,
    [aiTitle, summary, url, tags],
  );
  console.log("SAVED!");
  return {
    title: aiTitle,
    content: summary,
    source: url,
    tags,
  };
}

// Thiết lập cron job chạy mỗi 30 phút để tự động import RSS feed
cron.schedule("*/30 * * * *", async () => {
  console.log("🤖 Running RSS import...");

  await importRSS();
});

require("dotenv").config();

let rssEnabled = false;

let rssFeedUrl = "https://genk.vn/rss/home.rss";
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

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "My AI OS backend is running 🚀",
  });
});

// Middleware để bảo vệ các route cần authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req.user);
  if (!authHeader) {
    return res.status(401).json({
      error: "No token",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({
      error: "Invalid token",
    });
  }
};

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
app.get("/api/summaries", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM summaries
      WHERE user_id = $1
      ORDER BY id DESC
    `,
      [req.user.id],
    );
    //console.log("Ở đây nè:", result.rows);
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
app.post("/api/summaries", authMiddleware, async (req, res) => {
  try {
    const { title, content, source, tags } = req.body;
    console.log(req.body);

    console.log(
      "Creating summary for user ID:",
      req.user.id,
      title,
      content,
      source,
      tags,
    );
    const result = await pool.query(
      `
      INSERT INTO summaries (title, content, source,tags, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, content, source, tags, req.user.id],
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
app.delete("/api/summaries/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting summary with ID:", id, "for user ID:", req.user.id);
    await pool.query(
      `
      DELETE FROM summaries
      WHERE id = $1 AND user_id = $2
      `,
      [id, req.user.id],
    );
    console.log("xoa!");
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
app.put("/api/summaries/:id", authMiddleware, async (req, res) => {
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

app.post("/api/article-summary", authMiddleware, async (req, res) => {
  // Tách logic xử lý article summary ra một hàm riêng để có thể tái sử dụng cho cả API endpoint và RSS import

  try {
    const { url } = req.body;
    console.log("BODY:", req.body);
    const article = await processArticle(url, req.user.id);
    // Kiểm tra nếu đã có summary cho URL này trong DB
    const existingSummary = await pool.query(
      `
          SELECT * FROM summaries
          WHERE source = $1 AND user_id = $2
          LIMIT 1
          `,
      [url, req.user.id],
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
      (title, content, source, tags, user_id)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [aiTitle, summary, url, tags, req.user.id],
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
app.get("/api/rss-test", authMiddleware, async (req, res) => {
  try {
    const feed = await rssFeedUrl;

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
async function processArticle(url, userId) {
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

cron.schedule("* * * * *", async () => {
  if (!rssEnabled) {
    return;
  }

  console.log("🤖 Running RSS import...");

  await importRSS();
});
// API endpoint để lấy cấu hình RSS feed cho frontend
app.get("/api/rss-config", (req, res) => {
  res.json({
    rssEnabled,
    rssFeedUrl,
  });
});
// API endpoint để cập nhật cấu hình RSS feed từ frontend
app.post("/api/rss-config", (req, res) => {
  const { enabled, feedUrl } = req.body;

  rssEnabled = enabled;
  rssFeedUrl = feedUrl;

  console.log("⚙️ RSS CONFIG UPDATED");

  res.json({
    success: true,
    rssEnabled,
    rssFeedUrl,
  });
});

//====================API endpoint cho user registration=================
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (email, password)
      VALUES ($1, $2)
      RETURNING id, email
      `,
      [email, hashedPassword],
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Register failed",
    });
  }
});

//====================API endpoint cho user login=================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIND USER
    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    const user = result.rows[0];

    // USER NOT FOUND
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    // CHECK PASSWORD
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Login failed",
    });
  }
});
//====================API endpoint cho user profile (protected)=================
app.get("/api/profile", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      user: decoded,
    });
  } catch (error) {
    console.log(error);

    res.status(401).json({
      error: "Invalid token",
    });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await pool.query(
      `
    SELECT *
    FROM users
    WHERE email = $1
    `,
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });

      await pool.query(
        `
        INSERT INTO users
        (
          email,
          password
        )

        VALUES ($1, $2)
        `,
        [email, hashedPassword],
      );
    }
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Register failed",
    });
  }
});

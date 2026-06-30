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

const authRouter = require("./routes/authRouter");
const registRouter = require("./routes/registRouter");
const summaryRouter = require("./routes/summaryRouter");
const authMiddleware = require("./middleware/authMiddleware");

app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "My AI OS backend is running 🚀",
  });
});

// Middleware để bảo vệ các route cần authentication
// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   console.log(req.user);
//   if (!authHeader) {
//     return res.status(401).json({
//       error: "No token",
//     });
//   }
//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     console.log(req.user);
//     next();
//   } catch (error) {
//     console.log(error);

//     res.status(401).json({
//       error: "Invalid token",
//     });
//   }
// };

//const PORT = 3000;
const PORT = process.env.PORT || 3000;

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
    con;
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "AI summary failed",
    });
  }
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

app.use("/api/summaries", summaryRouter);

app.use("/api/summaries/id", summaryRouter);

app.use("/api/auth", authRouter);

app.use("/api/auth", registRouter);

app.post("/api/article-summary", authMiddleware, async (req, res) => {
  try {
    //console.log("acvs", req.url);
    const { url } = req.body;
    //const userId = req.user.id;
    //const existingSummary = await findExistingSummary(url, userId);
    //Kiểm tra nếu đã có summary cho URL này trong DB
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
      const result = existingSummary.rows[0];
      return res.json({
        success: true,
        summary: existingSummary.rows[0].content,
        title: existingSummary.rows[0].title,
        cached: true,
      });
    }

    const article = await processArticle(url, req.user.id);

    res.json({
      success: true,
      summary: article.content,
      preview: article.content.slice(0, 300),
      title: article.title,
      tags: article.tags,
      source: article.source,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Article summary failed",
    });
  }
});

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

// app.get("/api/rss-import", authMiddleware, async (req, res) => {
//   try {
//     await importRSS();
//     // const feed = await parser.parseURL(
//     //   "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
//     // );

//     // // const articles = feed.items.slice(0, 3);
//     // // for (const article of articles) {
//     // //   console.log(article.title);
//     // // }
//     // const imported = [];

//     // for (const article of articles) {
//     //   try {
//     //     const processed = await processArticle(article.link);

//     //     imported.push(processed);
//     //   } catch (error) {
//     //     console.log("FAILED:", article.link);
//     //   }
//     // }

//     res.json({
//       success: true,
//       message: "RSS imported",
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       error: "RSS import failed",
//     });
//   }
// });

// Thiết lập cron job chạy mỗi 30 phút để tự động import RSS feed
cron.schedule("* */2 * * *", async () => {
  console.log("🤖 Running RSS import...");
  const configs = await pool.query(
    `SELECT *
          FROM rss_configs
          WHERE enabled = true
    `,
  );
  for (const config of configs.rows) {
    await importRSS(config.feed_url, config.user_id);
  }
});

app.get("/api/rss-config", (req, res) => {
  res.json({
    rssEnabled,
    rssFeedUrl,
  });
});

app.post("/api/rss-config", authMiddleware, async (req, res) => {
  // console.log("BODY", req.body);
  // console.log("User", req.user);

  const userId = req.user.id;
  const { feedUrl, enabled } = req.body;
  console.log("Enable &url", feedUrl, enabled);
  try {
    //const ExistingSummary = await findExistingSummary(feedUrl, userId);
    await importRSS(feedUrl, userId);

    if (enabled) {
      const result = await pool.query(
        `
      INSERT INTO rss_configs
      (
      user_id,
      feed_url,
      enabled)
      VALUES ($1,$2,$3)

      `,
        [userId, feedUrl, enabled],
      );
    }

    return res.json({
      success: true,
      importedNow: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
    });
  }
});

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

// khu để function
async function findExistingSummary(url, userId) {
  console.log("1234", url, userId);

  // Kiểm tra nếu đã có summary cho URL này trong DB
  const resultExit = await pool.query(
    `
          SELECT * FROM summaries
          WHERE source = $1 AND user_id = $2
          LIMIT 1
          `,
    [url, userId],
  );

  return (resultExit, console.log("CO BAI TRUNG"));
}

async function importRSS(feedUrl, userId) {
  console.log("⚙️ RSS CONFIG UPDATED");

  //const { url } = feedUrl;
  // Kiểm tra nếu đã có summary cho URL này trong DB
  const existingSummary = await pool.query(
    `
          SELECT * FROM summaries
          WHERE source = $1 AND user_id = $2
          LIMIT 1
          `,
    [feedUrl, userId],
  );

  if (existingSummary.rows.length > 0) {
    const result = existingSummary.rows[0];
    // return res.json({
    //   success: true,
    //   summary: existingSummary.rows[0].content,
    //   title: existingSummary.rows[0].title,
    //   cached: true,
    // });
    return console.log("CO BAI TRUNG");
  }

  const feed = await parser.parseURL(feedUrl);

  const articles = feed.items.slice(0, 3);

  for (const article of articles) {
    try {
      await processArticle(article.link, userId);

      console.log("✅ Imported:", article.title);
    } catch (error) {
      console.log("❌ Failed:", article.link);
    }
  }
}

async function processArticle(url, userId) {
  //==================================
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
    [aiTitle, summary, url, tags, userId],
  );
  console.log("SAVED!");
  return {
    title: aiTitle,
    content: summary,
    source: url,
    tags: tags,
    cache: false,
  };
}

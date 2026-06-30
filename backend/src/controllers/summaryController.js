const pool = require("../config/db");

exports.getSummaries = async (req, res) => {
  console.log("TOI DÂY????");
  //app.get("/api/summaries", authMiddleware, async (req, res) => {
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
};

exports.deleteSummaries = async (req, res) => {
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
};

exports.putSummaries = async (req, res) => {
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
};

exports.postSummaries = async (req, res) => {
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
};

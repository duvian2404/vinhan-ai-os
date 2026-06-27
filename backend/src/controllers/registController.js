const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
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
    }

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

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Register failed",
    });
  }
};

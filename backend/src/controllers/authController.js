const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
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
};

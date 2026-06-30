const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
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

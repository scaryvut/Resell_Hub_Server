const jwt = require("jsonwebtoken");

const verifyToken = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  const token =
    authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Invalid Token",
        });
      }

      req.decoded = decoded;
      next();
    }
  );
};

module.exports = verifyToken;
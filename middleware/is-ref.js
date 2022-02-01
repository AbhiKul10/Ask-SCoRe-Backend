const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedRefToken;

  try {
    decodedRefToken = jwt.verify(token, "secret");
  } catch (err) {
    const error = new Error("Not Authorized");
    error.statusCode = 500;
    throw error;
  }

  if (!decodedRefToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedRefToken.userId;
  console.log(decodedRefToken.userId);
  next();
};

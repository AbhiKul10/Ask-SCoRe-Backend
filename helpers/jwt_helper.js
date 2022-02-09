const jwt = require("jsonwebtoken");

module.exports = {
  signAccessToken: (userId, email) => {
    const token = jwt.sign(
      {
        email: email,
        userId: userId,
      },
      "secret",
      { expiresIn: "1h" }
    );
    return token;
  },

  signRefreshToken: (userId, email) => {
    const reftoken = jwt.sign(
      {
        email: email,
        userId: userId,
      },
      "secret1",
      { expiresIn: "1y" }
    );
    return reftoken;
  },

  signForgotToken: (userId, email) => {
    const fToken = jwt.sign(
      {
        email: email,
        userId: userId,
      },
      "secret",
      { expiresIn: "15m" }
    );
    return fToken;
  },

  signVerifyToken: (email) => {
    const fToken = jwt.sign(
      {
        email: email,
      },
      "secret",
      { expiresIn: "15m" }
    );
    return fToken;
  },

  verifyRefreshToken: (refreshToken) => {
    let decodedRefToken;
    try {
      decodedRefToken = jwt.verify(refreshToken, "secret1");
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
    // req.userId = decodedRefToken.userId;
    console.log(decodedRefToken.userId);
    return decodedRefToken.userId;
  },

  verifyJwtToken: (JWTToken) => {
    let decodedRefToken;
    try {
      decodedRefToken = jwt.verify(JWTToken, "secret");
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
    // req.userId = decodedRefToken.userId;
    console.log(decodedRefToken);
    return decodedRefToken;
  },
};

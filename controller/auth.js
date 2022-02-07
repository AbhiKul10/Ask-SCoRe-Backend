const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signForgotToken,
  verifyJwtToken,
} = require("../helpers/jwt_helper");
const router = require("../routes/auth");
const nodemailer = require("nodemailer");
const { updatePassword } = require("../models/user");
const { google } = require("googleapis");
require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRCT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

exports.send_message = async (req, res, next) => {
  try {
    const result = await User.fetchAll();
    res.status(200).json({ data: result[0] });
    result[0].forEach((element) => {
      console.log(element.name);
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User(null, email, hashedPassword, name);
    const result = await user.save();
    res.status(201).json({
      message: "User Created!",
    });
    console.log("User Created!");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findByEmail(email);
    // .then((user) => {
    if (user[0].length == 0) {
      const error = new Error("User not Found!");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user[0][0].password);
    // })
    // .then((isEqual) => {
    if (!isEqual) {
      const error = new Error("Wrong Password!");
      error.statusCode = 401;
      throw error;
    }

    //JWT Access Token creation
    //   const token = jwt.sign({
    //       email: loadedUser[0][0].email,
    //       userId: loadedUser[0][0].id,
    //   },
    //   "secret",
    //   { expiresIn: "1h"}
    // );

    const accessToken = signAccessToken(
      loadedUser[0][0].id,
      loadedUser[0][0].email
    );

    //refresh Token Creation
    // const reftoken = jwt.sign({
    //     email: loadedUser[0][0].email,
    //     userId: loadedUser[0][0].id,
    // }, "secret1",
    //     {  expiresIn: "1y" }
    // );

    const refreshToken = signRefreshToken(
      loadedUser[0][0].id,
      loadedUser[0][0].email
    );

    res.status(200).json({
      token: accessToken,
      refresh: refreshToken,
      userId: loadedUser[0][0].id.toString(),
    });
    // })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // .catch((err) => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // });
};

exports.postRef = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  try {
    if (!refreshToken) {
      const error = new Error("Bad Request!");
      error.statusCode = 401;
      throw error;
    }
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.status(200).json({
      token: accessToken,
      refresh: refToken,
      userId: userId,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postForgot = async (req, res, next) => {
  const email = req.body.email;
  let dUser;

  try {
    const user = await User.findByEmail(email);
    if (user[0].length == 0) {
      const error = new Error("User not Found!");
      error.statusCode = 401;
      throw error;
    }
    dUser = user;

    const fToken = await signForgotToken(dUser[0][0].id, dUser[0][0].email);
    const accessToken = await oAuth2Client.getAccessToken();

    await nodemailer
      .createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "abhikulshrestha1@gmail.com",
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
        },
      })
      .sendMail({
        to: email,
        from: "Ask-SCoRe <abhikulshrestha1@gmail.com>",
        subject: "SignUp Success",
        html: `
      <p>You Requested for password Reset</p>
      <h5>click this <a href="http://localhost:8000/auth/reset-password/${fToken}">link</a> to reset the password</h5>
      `,
      });

    res.status(201).json({
      fToken: fToken,
      message: "Reset Password Email Sent",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPass = async (req, res, next) => {
  const { fToken } = req.params;
  res.render("reset-pass");
};

exports.resetPostPass = async (req, res, next) => {
  const { fToken } = req.params;
  const { password, password2 } = req.body;

  try {
    if (password != password2) {
      const error = new Error("Mismatch Password");
      error.statusCode = 422;
      throw error;
    }

    const userId = await verifyJwtToken(fToken);
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await updatePassword(hashedPassword, userId.email);

    res.status(201).json({
      message: "Updated!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

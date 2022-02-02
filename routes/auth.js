const express = require("express");
const { body } = require("express-validator/check");
const authController = require("../controller/auth");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SignUp:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           description: Email of the User
 *         password:
 *           type: string
 *           description: Paassword
 *         name:
 *           type: string
 *           descripton: Name of the User
 *       example:
 *         email: xyz@email.com
 *         password: xxxxxxxxx
 *         name: Abhi
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           description: Email of the User
 *         password:
 *           type: string
 *           description: Paassword
 *       example:
 *         email: xyz@email.com
 *         password: xxxxxxxxx
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Refresh:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh Token
 *       example:
 *         refreshToken: xxxxxxxxxxxxxx
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Forgot-Password:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: Email of the User
 *       example:
 *         email: xyz@email.com
 * 
 */

/***
 * @swagger
 * /auth/all:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all Users
 *     tags: [AUTH]
 *     requestBody:
 *       required: false
 *     parameters:
 *      
 *     responses:
 *       200:
 *         description: The book was successfully created
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a User
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              default: TestEmail
 *                          password:
 *                              type: string
 *                              default: TestPassword
 *                          name:
 *                              type: string
 *                              default: TestName
 *     responses:
 *       201:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignUp'
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              default: TestEmail
 *                          password:
 *                              type: string
 *                              default: TestPassword
 *     responses:
 *       200:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Login'
 *       401:
 *         description: Wrong Password
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              default: TestEmail
 *     responses:
 *       201:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forgot-Password'
 *       401:
 *         description: User Not Found
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh Tokens
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *                      type: object
 *                      properties:
 *                          refreshToken:
 *                              type: string
 *                              default: TestToken
 *     responses:
 *       200:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Refresh'
 *       401:
 *         description: User Not Found
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /auth/reset-password/{fToken}:
 *   post:
 *     summary: Refresh Tokens
 *     tags: [AUTH]
 *     parameters:
 *       - name: id
 *       - in: path
 *     responses:
 *       200:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Refresh'
 *       401:
 *         description: User Not Found
 *       500:
 *         description: Some server error
 */

router.get("/all", isAuth, authController.send_message);
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .custom((value, { req }) => {
        return User.findByEmail(value).then((userDoc) => {
          console.log(userDoc[0].length);
          console.log(userDoc[0][0]);
          if (userDoc[0].length > 0) {
            return Promise.reject("Email address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);
router.post("/login", authController.login);

router.use("/forgot-password", authController.postForgot);

router.post("/refresh-token", authController.postRef);

router.get("/reset-password/:fToken", authController.resetPass);

router.post("/reset-password/:fToken", authController.resetPostPass);

module.exports = router;

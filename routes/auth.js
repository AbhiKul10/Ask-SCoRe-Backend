const express = require("express");
const { body } = require("express-validator/check");
const authController = require("../controller/auth");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

/***
 * @swagger
 * /feed/posts:
 *  get:
 *      description: Get Products
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: Internal Server Error
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: title of post
 *         content:
 *           type: string
 *           descripton: content of post *
 *       example:
 *         title: my title
 *         content: my article
 *
 */

/***
 * @swagger
 * /auth/all:
 *   get:
 *     summary: Get all Users
 *     tags: [AUTH]
 *     security:
 *	     - jwt: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *                      type: object
 *                      properties:
 *                          jwt:
 *                              type: string
 *                              default: TestUser
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
 *                          title:
 *                              type: string
 *                              default: TestUser
 *                          content:
 *                              type: string
 *                              default: TestPassword
 *     responses:
 *       200:
 *         description: Successfull
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Some server error
 */

/***
 * @swagger
 * /feed/post:
 *  post:
 *      description: Post New Feeds
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          title:
 *                              type: string
 *                              default: TestUser
 *                          content:
 *                              type: string
 *                              default: TestPassword
 *      responses:
 *       200:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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

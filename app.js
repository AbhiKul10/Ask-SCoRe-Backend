const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const swaggerJsDocs = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const authRouter = require("./routes/auth");
const errorController = require("./controller/error");

const db = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.1",
    info: {
      title: "Ask-SCoRe-Backend",
      version: "1.0.0",
      description: "Backend for Ask-SCoRe mobile application",
    },
    basePath: "/",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
        },
      },
    },
    // security: [{
    //   bearerAuth: []
    // }]
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDocs(swaggerOptions);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRouter);

app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use(errorController.get404);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("App is running on port " + port);
});

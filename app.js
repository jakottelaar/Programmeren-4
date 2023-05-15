const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./src/util/utils").logger;
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

app.use("*", (req, res, next) => {
  const method = req.method;
  logger.trace(`Methode ${method} is aangeroepen`);
  next();
});

app.get("/api/info", (req, res) => {
  logger.info("Get server information");
  res.status(201).json({
    status: 201,
    message: "Server info-endpoint",
    data: {
      studentName: "Jarno",
      studentNumber: 2176550,
      description: "Welkom bij de server API van de share a meal.",
    },
  });
});

const userRoutes = require("./src/routes/user.routes");
app.use("/api/user", userRoutes);

app.use("*", (req, res) => {
  logger.warn("Invalid endpoint called: ", req.path);
  res.status(404).json({
    status: 404,
    message: "Endpoint not found",
    data: {},
  });
});

app.use((err, req, res, next) => {
  logger.error(err.code, err.message);
  res.status(err.code).json({
    statusCode: err.code,
    message: err.message,
    data: {},
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;

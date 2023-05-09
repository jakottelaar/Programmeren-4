const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

const userRoutes = require("./src/routes/user.routes");
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;

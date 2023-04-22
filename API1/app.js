const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

const userRouter = require("./routes/user");
app.use("/api", userRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

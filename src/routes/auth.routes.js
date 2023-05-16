const express = require("express");
const loginRouter = express.Router();
const loginController = require("../controller/auth.controller");

loginRouter.post("", loginController.validateLogin, loginController.login);

loginRouter.use(loginController.validateToken);

module.exports = loginRouter;

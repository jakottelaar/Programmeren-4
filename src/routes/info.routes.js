const express = require("express");
const infoRouter = express.Router();
const infoController = require("../controller/info.controller");

infoRouter.get("", infoController.getApiInfo);

module.exports = infoRouter;

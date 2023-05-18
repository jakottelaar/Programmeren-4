const express = require("express");
const participateRouter = express.Router();
const participantController = require("../controller/participate.controller");

participateRouter.post(
  "/:mealId/participate",
  participantController.signUpForAMeal
);

module.exports = participateRouter;

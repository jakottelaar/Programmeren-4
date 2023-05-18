const express = require("express");
const participateRouter = express.Router();
const participantController = require("../controller/participate.controller");

participateRouter.post(
  "/:mealId/participate",
  participantController.signUpForAMeal
);

participateRouter.delete(
  "/:mealId/participate",
  participantController.cancelRegistrationForMeal
);

participateRouter.get(
  "/:mealId/participants",
  participantController.getAllParticipants
);

module.exports = participateRouter;

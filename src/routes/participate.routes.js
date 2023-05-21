const express = require("express");
const participateRouter = express.Router();
const participantController = require("../controller/participate.controller");
const loginController = require("../controller/auth.controller");

participateRouter.post(
  "/:mealId/participate",
  loginController.validateToken,
  participantController.signUpForAMeal
);

participateRouter.delete(
  "/:mealId/participate",
  loginController.validateToken,
  participantController.cancelRegistrationForMeal
);

participateRouter.get(
  "/:mealId/participants",
  participantController.getAllParticipants
);

participateRouter.get(
  "/:mealId/participants/:participantId",
  participantController.getParticipantById
);

module.exports = participateRouter;

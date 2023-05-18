const express = require("express");
const mealRouter = express.Router();
const mealController = require("../controller/meal.controller");

mealRouter.post("", mealController.createMeal);
mealRouter.get("", mealController.getAllMeals);

module.exports = mealRouter;

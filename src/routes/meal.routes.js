const express = require("express");
const mealRouter = express.Router();
const mealController = require("../controller/meal.controller");

mealRouter.post("", mealController.createMeal);
mealRouter.get("", mealController.getAllMeals);
mealRouter.get("/:mealId", mealController.getMealById);
mealRouter.delete("/:mealId", mealController.deleteMealById);

module.exports = mealRouter;

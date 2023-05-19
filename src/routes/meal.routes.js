const express = require("express");
const mealRouter = express.Router();
const mealController = require("../controller/meal.controller");
const loginController = require("../controller/auth.controller");

mealRouter.post("", loginController.validateToken, mealController.createMeal);
mealRouter.put("/:mealId", mealController.updateMealById);
mealRouter.get("", mealController.getAllMeals);
mealRouter.get("/:mealId", mealController.getMealById);
mealRouter.delete("/:mealId", mealController.deleteMealById);

module.exports = mealRouter;

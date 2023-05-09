const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user.controller");

userRouter.post("", userController.createNewUser);
userRouter.get("", userController.getAllUsers);
userRouter.get("", userController.getFiltersUsers);
userRouter.get("/profile", userController.getUserProfile);
userRouter.get("/:userId", userController.getUserById);
userRouter.put("/:userId", userController.updateUser);
userRouter.delete("/:userId", userController.deleteUser);

module.exports = userRouter;

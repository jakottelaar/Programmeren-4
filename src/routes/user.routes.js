const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/user.controller");
const loginController = require("../controller/auth.controller");

userRouter.post("", userController.createNewUser);
userRouter.get("", userController.getAllUsers);
userRouter.get(
  "/profile",
  loginController.validateToken,
  userController.getUserProfile
);
userRouter.get("/:userId", userController.getUserById);
userRouter.put(
  "/:userId",
  loginController.validateToken,
  userController.updateUser
);
userRouter.delete("/:userId", userController.deleteUser);

module.exports = userRouter;

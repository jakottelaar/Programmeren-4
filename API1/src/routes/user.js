const express = require("express");
const data = require("../util/database");
const bodyParser = require("body-parser");
const { assert } = require("chai");
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static("public"));

users = data;

let index = users.length;

//Function for getting a user by userId
function getUserById(userId) {
  const user = users.find((user) => user.id === userId);

  if (user) {
    return user;
  } else {
    return null;
  }
}

//Post request for registration of a new user
router.post("/user", (req, res) => {
  const { firstName, lastName, street, city, email, password, phoneNumber } =
    req.body;

  console.log(req.body);
  try {
    assert(typeof firstName === "string", "firstName must be a string!");
    assert(typeof email === "string", "emailAddress must be a string!");
    assert(
      !users.find((user) => user.email === email),
      "Email already exists!"
    );
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message.toString(),
    });
    return;
  }

  const newUser = {
    id: index++,
    firstName,
    lastName,
    street,
    city,
    isActive: true,
    email,
    password,
    phoneNumber,
  };

  users.push(newUser);

  res.status(200).json({
    status: 200,
    message: "User registered successfully",
    user: newUser,
  });
  return;
});

//Get request for getting all the users in the database
router.get("/user", (req, res) => {
  res.status(200).json({
    status: 200,
    result: users,
  });
});

//Get request for getting users filtered on criteria
router.get("/user", (req, res) => {
  const filters = req.query;
  const filteredUsers = users.filter((user) => {
    let isValid = true;
    for (key in filters) {
      console.log(key, users[key], filters[key]);
      isValid = isValid && user[key] == filters[key];
    }
    return isValid;
  });
  res.json(filteredUsers);
});

//Get request for getting a users profile (not yet implemented)
router.get("/user/profile", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "GET Request for profile info is not yet implemented!",
    user: users[0],
  });
});

//Get request for getting a user by their id
router.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = getUserById(userId);

  if (user) {
    res.status(200).json({
      status: 200,
      user: user,
    });
  } else {
    res.status(404).json({
      status: 404,
      error: "User not found",
    });
  }
});

//Put request for updating a user's profile
router.put("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = getUserById(userId);

  if (user) {
    const updatedUser = { ...user, ...req.body };
    users[userId] = updatedUser;
    res.status(200).json({
      status: 200,
      message: "PUT request called!",
      user: updatedUser,
    });
  } else {
    res.status(404).json({
      status: 404,
      error: "User not found",
    });
  }
});

//Delete request for deleting a user by id
router.delete("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const index = users.findIndex((user) => user.id === userId);
  const user = getUserById(userId);

  if (user) {
    users.splice(index);
    res.status(200).json({
      status: 200,
      message: `Deleted users by id ${userId}`,
    });
  } else {
    res.status(404).json({
      status: 404,
      error: "User not found",
    });
  }
});

module.exports = router;

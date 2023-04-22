const express = require("express");
const data = require("../data");
const bodyParser = require("body-parser");
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static("public"));

users = data;

function getUserById(userId) {
  const user = users.find((user) => user.id === userId);

  if (user) {
    return user;
  } else {
    return null;
  }
}

router.post("/user", (req, res) => {
  const registrationRequest = ({
    firstName,
    lastName,
    street,
    city,
    isActive,
    email,
    password,
    phoneNumber,
  } = req.body);
  console.log(registrationRequest);

  const checkEmailExists = users.find((user) => user.email === email);

  if (checkEmailExists) {
    return res.status(400).json({
      error: "Email already exists!",
    });
  }

  const newUser = {
    id,
    firstName,
    lastName,
    street,
    city,
    isActive,
    email,
    password,
    phoneNumber,
  };

  users.push(newUser);

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
  });
  console.log(users);
});

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

router.get("/user/profile", (req, res) => {
  res.json({
    message: "GET Request for profile info is not yet implemented!",
  });
});

router.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = getUserById(userId);

  if (user) {
    res.status(200).json({
      user: user,
    });
  } else {
    res.status(404).json({
      error: "User not found",
    });
  }
});

router.put("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = getUserById(userId);

  if (user) {
    const updatedUser = { ...user, ...req.query };
    users[user] = updatedUser;
    res.status(200).json({
      message: "PUT request called!",
      user: updatedUser,
    });
  } else {
    res.status(404).json({
      error: "User not found",
    });
  }
});

router.delete("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const index = users.findIndex((user) => user.id === userId);
  const user = getUserById(userId);

  if (user) {
    users.splice(index);
    res.status(200).json({
      message: "DELETE request called!",
    });
  } else {
    res.status(404).json({
      error: "User not found",
    });
  }
});

router.get("/user", (req, res) => {
  res.json(users);
});

module.exports = router;

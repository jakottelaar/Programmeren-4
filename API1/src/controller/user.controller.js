const database = require("../util/internal-mem-database");
const logger = require("../util/utils").logger;
const assert = require("assert");
const users = database.users;
const pool = require("../util/mysql-db");

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

const userController = {
  //Post request for registration of a new user
  createNewUser: (req, res) => {
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
  },
  //Get request for getting all the users from the mysql database
  getAllUsers: (req, res, next) => {
    logger.info("Get all users");

    let sqlStatement = "SELECT * FROM `user`";

    pool.getConnection(function (err, conn) {
      if (err) {
        console.log("error", err);
      } else if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message,
            });
          }
          if (results) {
            logger.info("Found ", results.length, " results");
            res.status(200).json({
              status: 200,
              message: "user: get all users endpoint",
              data: results,
            });
          }
        });
      }
    });
  },

  //Get request for getting users filtered on criteria
  getFiltersUsers: (req, res) => {
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
  },
  //Get request for getting a users profile (not yet implemented)
  getUserProfile: (req, res) => {
    res.status(200).json({
      status: 200,
      message: "GET Request for profile info is not yet implemented!",
      user: users[0],
    });
  },
  //Get request for getting a user by their id
  getUserById: (req, res) => {
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
  },
  //Put request for updating a user's profile
  updateUser: (req, res) => {
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
  },
  //Delete request for deleting a user by id
  deleteUser: (req, res) => {
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
  },
};

module.exports = userController;

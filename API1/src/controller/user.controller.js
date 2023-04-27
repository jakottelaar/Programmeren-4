const database = require("../util/internal-mem-database");
const logger = require("../util/utils").logger;
const assert = require("assert");
const users = database.users;
const pool = require("../util/mysql-db");

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
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.message.toString(),
      });
      return;
    }

    const newUser = {
      firstName,
      lastName,
      street,
      city,
      isActive: 1,
      email,
      password,
      phoneNumber,
    };

    let sqlStatement = "INSERT INTO user SET ?";

    pool.query(sqlStatement, newUser, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Failed to create new user.",
          error: error,
        });
      } else {
        logger.info("Insert new user by id: ", results.insertId);
        res.status(200).json({
          status: 200,
          message: "User created successfully.",
          data: results,
        });
      }
    });
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

    let sqlStatement = "SELECT * FROM user WHERE id = ?";

    pool.query(sqlStatement, userId, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: `Error retrieving user by ID`,
          error: error,
        });
      } else if (results.length === 0) {
        res.status(404).json({
          status: 404,
          message: `No user with ID ${userId}`,
        });
      } else {
        logger.info("Retrieved user by id: ", userId);
        res.status(200).json({
          status: 200,
          message: "User retrieved by id successfully.",
          data: results,
        });
      }
    });
  },
  //Put request for updating a user's profile
  updateUser: (req, res) => {
    const userId = parseInt(req.params.userId);
    const updatedUser = req.body;

    let sqlStatement = "UPDATE user SET ? WHERE id = ?";

    pool.query(
      sqlStatement,
      [updatedUser, userId],
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.status(500).json({
            status: 500,
            message: "Error updating user",
            error: error,
          });
        } else if (results.affectedRows === 0) {
          res.status(404).json({
            status: 404,
            message: `No user with ID ${userId}`,
          });
        } else {
          logger.info(`Updated user by id: ${userId}`);
          res.status(200).json({
            status: 200,
            message: "Updated user",
            data: results,
          });
        }
      }
    );
  },
  //Delete request for deleting a user by id
  deleteUser: (req, res) => {
    const userId = parseInt(req.params.userId);

    let sqlStatement = "DELETE FROM user WHERE id = ?";

    pool.query(sqlStatement, userId, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: `Error deleting user by ID`,
          error: error,
        });
      } else if (results.affectedRows === 0) {
        res.status(404).json({
          status: 404,
          message: `No user with ID ${userId}`,
        });
      } else {
        logger.info("Deleted user by id: ", userId);
        res.status(200).json({
          status: 200,
          message: "User deleted by id",
          data: results,
        });
      }
    });
  },
};

module.exports = userController;

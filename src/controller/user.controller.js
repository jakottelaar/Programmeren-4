const logger = require("../util/utils").logger;
const assert = require("assert");
const pool = require("../util/mysql");
const Joi = require("joi");

const userController = {
  //Post request for registration of a new user
  createNewUser: (req, res) => {
    const input = req.body;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().min(2).required(),
      street: Joi.string().allow("").required(),
      city: Joi.string().allow("").required(),
      emailAddress: Joi.string()
        .pattern(
          new RegExp(/^[a-zA-Z]\.[a-zA-Z]{2,}@([a-zA-Z]{2,}\.[a-zA-Z]{2,3})$/)
        )
        .required()
        .messages({
          "string.empty": `Email address cannot be empty`,
          "any.required": `Email address is required`,
          "string.pattern.base": `Email address is not valid conform to the format: f.lastname@mail.com`,
        }),
      password: Joi.string()
        .min(8)
        .regex(/^(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          "string.empty": "Password cannot be empty",
          "any.required": "Password is required",
          "string.pattern.base":
            "Password is not valid. It should contain at least 8 characters, including at least one uppercase letter and one digit.",
        }),
      phoneNumber: Joi.string()
        .length(10)
        .pattern(/^06[-\s]?\d{8}$/)
        .required()
        .messages({
          "string.empty": "Phone number cannot be empty",
          "any.required": "Phone number is required",
          "string.pattern.base":
            "Phone number is not valid. It should start with '06' and be followed by 8 digits.",
          "string.length": "Phone number should be 10 digits long.",
        }),
    });

    const { error, value } = schema.validate(input);

    if (error) {
      console.log(error.details);
      res.status(400).json({
        status: 400,
        message: error.message,
      });
      return;
    }

    console.log(req.body);

    const newUser = {
      firstName: input.firstName,
      lastName: input.lastName,
      street: input.street,
      city: input.city,
      emailAddress: input.emailAddress,
      password: input.password,
      phoneNumber: input.phoneNumber,
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
      user: null,
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
          message: `User deleted by id ${userId}`,
          data: results,
        });
      }
    });
  },
};

module.exports = userController;

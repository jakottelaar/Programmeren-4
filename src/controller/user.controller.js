const logger = require("../util/utils").logger;
const assert = require("assert");
const pool = require("../util/mysql");
const Joi = require("joi");
const { log } = require("console");

const schema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().min(2).required(),
  street: Joi.string().allow("").required(),
  city: Joi.string().allow("").required(),
  isActive: Joi.boolean(),
  emailAdress: Joi.any().optional(),
  emailAddress: Joi.string()
    .pattern(
      new RegExp(/^[a-zA-Z]\.[a-zA-Z0-9]{2,}@([a-zA-Z]{2,}\.[a-zA-Z]{2,3})$/)
    )
    .required()
    .messages({
      "string.pattern.base": `Email address is not valid`,
    }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required()
    .messages({
      "string.empty": `Password address cannot be empty`,
      "any.required": `Password is required`,
      "string.pattern.base": `Password is not valid. It should be at least 8 characters and contain at least one uppercase letter and one digit.`,
    }),
  phoneNumber: Joi.string()
    .pattern(/^(06[-\s]?\d{8}|\d{10,11})$/)
    .required()
    .messages({
      "string.empty": `Phone number cannot be empty`,
      "any.required": `Phone number is required`,
      "string.pattern.base": `Phone number is not valid. It should start with '06' and be followed by 8 digits.`,
      "string.length": `Phone number should be either 10 or 11 digits long.`,
    }),
});

const userController = {
  //Post request for registration of a new user
  createNewUser: (req, res) => {
    const { error, value: input } = schema.validate(req.body);

    if (error) {
      logger.error(error);
      res.status(400).json({
        status: 400,
        message: error.message,
        data: {},
      });
      return;
    }

    console.log(req.body);

    const newUser = {
      firstName: input.firstName,
      lastName: input.lastName,
      street: input.street,
      city: input.city,
      isActive: input.isActive,
      emailAddress: input.emailAddress,
      password: input.password,
      phoneNumber: input.phoneNumber,
    };

    let sqlStatement = "INSERT INTO user SET ?";

    pool.query(sqlStatement, newUser, function (error, results, fields) {
      if (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") {
          res.status(403).json({
            status: 403,
            message: "Email already exists. User creation failed.",
            data: {},
          });
        } else {
          res.status(500).json({
            status: 500,
            message: "Failed to create new user.",
            error: error,
          });
        }
      } else {
        const createdUserId = results.insertId;

        const selectStatement = "SELECT * FROM user WHERE id = ?";
        pool.query(
          selectStatement,
          createdUserId,
          function (error, rows, fields) {
            if (error) {
              console.log(error);
              res.status(500).json({
                status: 500,
                message: "Failed to fetch user information.",
                error: error,
              });
            } else {
              const createdUser = rows[0];
              logger.info("Inserted new user with id:", createdUserId);
              rows[0].isActive == true
                ? (rows[0].isActive = true)
                : (rows[0].isActive = false);
              res.status(201).json({
                status: 201,
                message: "User created successfully.",
                data: createdUser,
              });
            }
          }
        );
      }
    });
  },
  //Get request for getting all the users from the mysql database
  getAllUsers: (req, res) => {
    const filters = req.query;
    let sqlStatement = "SELECT * FROM `user`";
    let values = []; // Initialize values as an empty array

    if (Object.keys(filters).length > 0) {
      const validFields = ["firstName", "lastName", "emailAddress", "isActive"];
      const conditions = [];

      for (const key in filters) {
        if (validFields.includes(key)) {
          conditions.push(`${key} = ?`);
          values.push(filters[key]);
        }
      }

      if (conditions.length > 0) {
        sqlStatement += " WHERE " + conditions.join(" AND ");
      }
    }

    pool.query(sqlStatement, values, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).json({
          status: 500,
          message: "Failed to retrieve users.",
          error: error,
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Users retrieved successfully.",
          data: results,
        });
      }
    });
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
          data: {},
        });
      } else {
        logger.info(`Retrieved user by id: ${userId}`);
        logger.info(`getUserById ${results}`);
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

    const { error, value: input } = schema.validate(req.body);

    if (error) {
      logger.error(error);
      res.status(400).json({
        status: 400,
        message: error.message,
        data: {},
      });
      return;
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "street",
      "city",
      "isActive",
      "emailAddress",
      "password",
      "phoneNumber",
    ];

    const filteredInput = Object.keys(input)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = input[key];
        return obj;
      }, {});

    let sqlStatement = "UPDATE user SET ? WHERE id = ?";

    pool.query(
      sqlStatement,
      [filteredInput, userId],
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
            data: {},
          });
        } else {
          logger.info(`Updated user by id: ${userId}`);
          let selectStatement = "SELECT * FROM user WHERE id = ?";
          pool.query(
            selectStatement,
            userId,
            function (error, results, fields) {
              if (error) {
                console.log(error);
                res.status(500).json({
                  status: 500,
                  message: "Error retrieving updated user information",
                  error: error,
                });
              } else {
                const updatedUserInfo = results[0];
                res.status(200).json({
                  status: 200,
                  message: "Updated user",
                  data: updatedUserInfo,
                });
              }
            }
          );
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
          data: {},
        });
      } else {
        logger.info("Deleted user by id: ", userId);
        res.status(200).json({
          status: 200,
          message: `User met ID ${userId} is verwijderd`,
          data: {},
        });
      }
    });
  },
};

module.exports = userController;

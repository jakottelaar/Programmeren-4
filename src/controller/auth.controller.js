//
// Authentication controller
//
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const pool = require("../util/mysql");
const { logger } = require("../util/utils");
require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  /**
   * login
   * Retourneer een geldig token indien succesvol
   */
  login(req, res, next) {
    const { emailAddress, password } = req.body;

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from pool");
        return next({
          status: 500,
          message: err.code,
        });
      }

      connection.query(
        "SELECT * FROM user WHERE emailAddress = ?",
        [emailAddress],
        (error, results) => {
          if (error) {
            logger.error("Error executing SQL query");
            return next({
              status: 500,
              message: error.message,
            });
          }

          if (results.length === 0) {
            // User not found
            return res.status(401).json({
              message: "Not authorized",
            });
          }

          const user = results[0];

          // Check password
          if (user.password !== password) {
            // Incorrect password
            return res.status(401).json({
              message: "Not authorized",
            });
          }

          // Create payload
          const payload = {
            userId: user.id,
          };

          // Generate token
          const token = jwt.sign(payload, jwtSecretKey);

          res.status(200).json({
            status: 200,
            message: "Login successful",
            data: {
              results,
              token,
            },
          });
        }
      );

      connection.release();
    });
  },

  /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
  validateLogin(req, res, next) {
    const schema = Joi.object({
      emailAddress: Joi.string().required().label("Email Address"),
      password: Joi.string().required().label("Password"),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(422).json({
        error: error.details[0].message,
        datetime: new Date().toISOString(),
      });
    }
    next();
  },

  //
  //
  //
  validateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Missing or invalid token",
        data: undefined,
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtSecretKey);

      req.userId = decoded.userId;

      next();
    } catch (err) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Invalid token",
        data: undefined,
      });
    }
  },
};

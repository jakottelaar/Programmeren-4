const logger = require("../util/utils").logger;
const pool = require("../util/mysql");
const Joi = require("joi");

const fetchMealById = (mealId, callback) => {
  const getMealSqlStatement = "SELECT * FROM `meal` WHERE id = ?";
  pool.query(getMealSqlStatement, [mealId], function (error, results, fields) {
    if (error) {
      logger.error(error);
      callback({
        status: 500,
        message: "Failed to fetch meal by id",
        data: {
          error,
        },
      });
    } else if (results.length === 0) {
      callback({
        status: 404,
        message: `No meal with ID ${mealId} found`,
        data: {},
      });
    } else {
      const meal = results[0];
      callback(null, meal);
    }
  });
};

const fetchParticipantById = (userId, mealId, callback) => {
  fetchMealById(mealId, (error, meal) => {
    if (error) {
      callback(error);
    } else {
      const getParticipantSqlStatement =
        "SELECT * FROM `meal_participants_user` WHERE mealId = ? AND userId = ?";
      pool.query(
        getParticipantSqlStatement,
        [mealId, userId],
        function (error, results, fields) {
          if (error) {
            logger.error(error);
            callback({
              status: 500,
              message: "Failed to check participant's sign-up status for meal",
              data: {
                error,
              },
            });
          } else if (results.length === 0) {
            callback({
              status: 404,
              message: `No participation for user with ID ${userId} found for meal ${mealId}`,
              data: {},
            });
          } else {
            callback(null, true); // Participant is signed up for the meal
          }
        }
      );
    }
  });
};

const executeQuery = (sqlStatement, params, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error("Error getting connection from pool");
      callback({
        status: 500,
        message: err.code,
        data: {},
      });
      return;
    }

    connection.query(sqlStatement, params, (error, results, fields) => {
      connection.release(); // Release the connection back to the pool

      if (error) {
        logger.error(error);

        callback({
          status: 500,
          message: "Failed to execute query",
          data: {
            error,
          },
        });
      } else {
        callback(null, results, fields);
      }
    });
  });
};

const participateController = {
  signUpForAMeal: (req, res) => {
    const mealId = parseInt(req.params.mealId);
    const userId = req.userId;

    fetchMealById(mealId, (error, meal) => {
      if (error) {
        return res.status(error.status).json({
          status: error.status,
          message: error.message,
          data: error.data,
        });
      }

      const signUpUserToMealSqlStatement =
        "INSERT INTO meal_participants_user SET ?";
      const signUpData = { mealId: mealId, userId: userId };

      executeQuery(
        signUpUserToMealSqlStatement,
        signUpData,
        function (error, results, fields) {
          if (error) {
            logger.error(error);

            return res.status(500).json({
              status: 500,
              message: "Failed to sign up user for meal",
              data: {
                error: error,
              },
            });
          }

          res.status(200).json({
            status: 200,
            message: `User with ID ${userId} has been signed up for meal with ID ${mealId}`,
            data: results,
          });
        }
      );
    });
  },

  cancelRegistrationForMeal: (req, res) => {
    const mealId = parseInt(req.params.mealId);
    const userId = req.userId;

    logger.info(
      `User with id ${userId} canceling participation for meal with id ${mealId}`
    );

    fetchParticipantById(userId, mealId, (error, meal) => {
      if (error) {
        return res.status(error.status).json({
          status: error.status,
          message: error.message,
          data: error.data,
        });
      }

      let cancelRegistrationSqlStatement =
        "DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?";

      executeQuery(
        cancelRegistrationSqlStatement,
        [mealId, userId],
        function (error, results, fields) {
          if (error) {
            logger.error(error);
            res.status(500).json({
              status: 500,
              message: "Failed to cancel user registration for meal",
              data: {
                error: error,
              },
            });
          } else {
            res.status(200).json({
              status: 200,
              message: `User with ID ${userId} has been unregistered for meal with ID ${mealId}`,
              data: {},
            });
          }
        }
      );
    });
  },

  getAllParticipants: (req, res) => {
    const mealId = req.params.mealId;

    let getParticipantsSqlStatement = `
      SELECT *
      FROM meal_participants_user mp
      INNER JOIN user u ON mp.userId = u.id
      WHERE mp.mealId = ?
    `;

    executeQuery(
      getParticipantsSqlStatement,
      [mealId],
      function (error, results, fields) {
        if (error) {
          res.status(error.status).json({
            status: error.status,
            message: error.message,
            data: error.data,
          });
        } else {
          const convertedResults = results.map((participant) => ({
            ...participant,
            isActive: participant.isActive === 1 ? true : false,
          }));
          const participantsByMeal = convertedResults.reduce(
            (acc, participant) => {
              const mealId = participant.mealId;
              if (!acc[mealId]) {
                acc[mealId] = [];
              }
              delete participant.password;
              delete participant.userId;
              delete participant.mealId;
              delete participant.roles;
              acc[mealId].push(participant);
              return acc;
            },
            {}
          );

          res.status(200).json({
            status: 200,
            message: "Participants retrieved successfully",
            data: participantsByMeal,
          });
        }
      }
    );
  },

  getParticipantById: (req, res) => {
    const mealId = req.params.mealId;
    const participantId = req.params.participantId;

    let getParticipantSqlStatement = `
      SELECT *
      FROM meal_participants_user mp
      INNER JOIN user u ON mp.userId = u.id
      WHERE mp.mealId = ? AND u.id = ?
    `;

    executeQuery(
      getParticipantSqlStatement,
      [mealId, participantId],
      function (error, results, fields) {
        if (error) {
          res.status(error.status).json({
            status: error.status,
            message: error.message,
            data: error.data,
          });
        } else {
          if (results.length === 0) {
            res.status(404).json({
              status: 404,
              message: "Participant not found",
              data: {},
            });
          } else {
            const participant = results[0];
            delete participant.password;
            delete participant.userId;
            delete participant.mealId;
            delete participant.roles;

            res.status(200).json({
              status: 200,
              message: "Participant details retrieved successfully",
              data: participant,
            });
          }
        }
      }
    );
  },
};

module.exports = participateController;

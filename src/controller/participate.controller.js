const logger = require("../util/utils").logger;
const pool = require("../util/mysql");
const Joi = require("joi");

const participateController = {
  signUpForAMeal: (req, res) => {
    const mealId = parseInt(req.params.mealId);
    const userId = req.headers.userid;

    let signUpUserToMealSqlStatement =
      "INSERT INTO meal_participants_user SET ?";

    pool.query(
      signUpUserToMealSqlStatement,
      { mealId: mealId, userId: userId },
      function (error, results, fields) {
        if (error) {
          logger.error(error);

          res.status(500).json({
            status: 500,
            message: "Failed to signUp user for meal",
            data: {
              error: error,
            },
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `User met ID ${userId} is aangemeld voor maaltijd met ID ${mealId}`,
            data: results,
          });
        }
      }
    );
  },

  cancelRegistrationForMeal: (req, res) => {
    const userId = req.headers.userid;
    const mealId = parseInt(req.params.mealId);

    let cancelRegistrationSqlStatement =
      "DELETE FROM meal_participants_user WHERE userId = ?";

    pool.query(
      cancelRegistrationSqlStatement,
      [userId],
      function (error, results, fields) {
        if (error) {
          logger.error(error);
          res.status(500).json({
            status: 500,
            message: "Failed to cancel registration user for meal",
            data: {
              error: error,
            },
          });
        } else {
          res.status(200).json({
            status: 200,
            message: `User met ID ${userId} is afgemeld voor maaltijd met ID ${mealId}`,
            data: {},
          });
        }
      }
    );
  },

  getAllParticipants: (req, res) => {
    const mealId = req.params.mealId;

    let getParticipantsSqlStatement = `
      SELECT *
      FROM meal_participants_user mp
      INNER JOIN user u ON mp.userId = u.id
      WHERE mp.mealId = ?
    `;

    pool.query(
      getParticipantsSqlStatement,
      mealId,
      function (error, results, fields) {
        if (error) {
          logger.error(error);

          res.status(500).json({
            status: 500,
            message: "Failed to retrieve participants",
            data: {
              error: error,
            },
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
};

module.exports = participateController;

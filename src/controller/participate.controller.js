const logger = require("../util/utils").logger;
const pool = require("../util/mysql");
const Joi = require("joi");

const participateController = {
  signUpForAMeal: (req, res) => {
    const mealId = parseInt(req.params.mealId);
    const userId = req.headers.userId;

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
};

module.exports = participateController;

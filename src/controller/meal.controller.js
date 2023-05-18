const logger = require("../util/utils").logger;
const pool = require("../util/mysql");
const Joi = require("joi");
const DATE_FORMATER = require("dateformat");

const schema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  isVega: Joi.number().optional(),
  isVegan: Joi.number().optional(),
  isToTakeHome: Joi.number().optional(),
  isActive: Joi.number().optional(),
  price: Joi.number().required(),
  maxAmountOfParticipants: Joi.number().required(),
  imageUrl: Joi.string().required(),
  allergenes: Joi.string().optional(),
});

const mealController = {
  createMeal: (req, res) => {
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

    logger.info(req.body);

    const dateTime = DATE_FORMATER(new Date(), "yyyy-mm-dd HH:MM:ss");
    const userId = req.headers.userid;

    const newMeal = {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      isVega: input.isVega,
      isVegan: input.isVegan,
      isToTakeHome: input.isToTakeHome,
      dateTime: dateTime,
      maxAmountOfParticipants: input.maxAmountOfParticipants,
      price: input.price,
      imageUrl: input.imageUrl,
      allergenes: input.allergenes,
      cookId: userId,
    };

    let sqlStatement = "INSERT INTO meal SET ?";

    pool.query(sqlStatement, newMeal, function (error, results, fields) {
      if (error) {
        logger.error(error);

        res.status(500).json({
          status: 500,
          message: "Failed to create meal.",
          data: {
            error,
          },
        });
      } else {
        const createdMealId = results.insertId;

        let getInsertedMealResultStatement = "SELECT * FROM meal WHERE id = ?";
        pool.query(
          getInsertedMealResultStatement,
          createdMealId,
          function (error, results, fields) {
            if (error) {
              logger.error(error);
              res.status(500).json({
                status: 500,
                message: "Failed to fetch meal information",
                data: {
                  error,
                },
              });
            } else {
              const createdMeal = results[0];
              logger.info(
                `Inserted new meal with id: ${createdMealId} and cookId ${userId}`
              );
              results[0].isActive == true
                ? (results[0].isActive = true)
                : (results[0].isActive = false);
              res.status(201).json({
                status: 201,
                message: "Meal created successfully",
                data: createdMeal,
              });
            }
          }
        );
      }
    });
  },

  getAllMeals: (req, res) => {
    let sqlSelectStatement = "SELECT * FROM `meal`";

    pool.query(sqlSelectStatement, function (error, mealResults, fields) {
      if (error) {
        logger.error(error);
        return res.status(500).json({
          status: 500,
          message: "Failed to fetch meals.",
          data: {
            error: error,
          },
        });
      }

      const cookId = mealResults[0].cookId;

      let getCookInfoSqlStatement = "SELECT * FROM user WHERE id = ?";
      pool.query(
        getCookInfoSqlStatement,
        cookId,
        function (error, cookResults, fields) {
          if (error) {
            logger.error(error);
            return res.status(500).json({
              status: 500,
              message: "Failed to fetch cook information",
              data: {
                error: error,
              },
            });
          }

          const cook = { ...cookResults[0] };
          cook.isActive = cook.isActive === 1 ? true : false;
          delete cook.password;

          let getParticipantsSqlStatement = `
          SELECT *
          FROM meal_participants_user mp
          INNER JOIN user u ON mp.userId = u.id
          WHERE mp.mealId IN (?)`;

          const mealIds = mealResults.map((meal) => meal.id);
          pool.query(
            getParticipantsSqlStatement,
            [mealIds],
            function (error, participantsResults, fields) {
              if (error) {
                logger.error(error);
                return res.status(500).json({
                  status: 500,
                  message: "Failed to fetch participants.",
                  data: {
                    error: error,
                  },
                });
              }

              const participantsByMeal = participantsResults.reduce(
                (acc, participant) => {
                  const mealId = participant.mealId;
                  if (!acc[mealId]) {
                    acc[mealId] = [];
                  }
                  const convertedParticipant = {
                    ...participant,
                    isActive: participant.isActive === 1 ? true : false,
                  };
                  delete convertedParticipant.password;
                  acc[mealId].push(convertedParticipant);
                  return acc;
                },
                {}
              );

              const mealsWithParticipants = mealResults.map((meal) => {
                const convertedMeal = {
                  ...meal,
                  isActive: meal.isActive === 1 ? true : false,
                  isVega: meal.isVega === 1 ? true : false,
                  isVegan: meal.isVegan === 1 ? true : false,
                  isToTakeHome: meal.isToTakeHome === 1 ? true : false,
                };

                return {
                  meal: convertedMeal,
                  cook: cook,
                  participants: participantsByMeal[meal.id] || [],
                };
              });

              res.status(200).json({
                status: 200,
                message: "Successfully fetched all meals.",
                data: mealsWithParticipants,
              });
            }
          );
        }
      );
    });
  },

  getMealById: (req, res) => {
    let sqlSelectStatement = "SELECT * FROM `meal` WHERE id = ?";

    const mealId = parseInt(req.params.mealId);

    pool.query(sqlSelectStatement, mealId, function (error, results, fields) {
      if (error) {
        logger.error(error);
        res.status(500).json({
          status: 500,
          message: "Failed to fetch meal by id",
          data: {
            error,
          },
        });
      } else {
        res.status(200).json({
          status: 200,
          message: `Meal fetched by id`,
          data: results,
        });
      }
    });
  },
};

module.exports = mealController;

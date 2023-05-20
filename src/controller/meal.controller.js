const logger = require("../util/utils").logger;
const pool = require("../util/mysql");
const Joi = require("joi");
const DATE_FORMATER = require("dateformat");

const createMealSchema = Joi.object({
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

const updateMealSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is a required field",
  }),
  description: Joi.string().required(),
  isVega: Joi.number().optional(),
  isVegan: Joi.number().optional(),
  isToTakeHome: Joi.number().optional(),
  isActive: Joi.number().optional(),
  price: Joi.number().required().messages({
    "any.required": "Name is a required field",
  }),
  maxAmountOfParticipants: Joi.number().messages({
    "any.required": "Max amount of participants is a required field",
  }),
  imageUrl: Joi.string().required(),
  allergenes: Joi.string().optional(),
});

const fetchMealById = (mealId, cookId, callback) => {
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

      // Check if the user calling the endpoint is the cook
      if (meal.cookId !== cookId) {
        callback({
          status: 403,
          message: `Not authorized to perform this operation on the meal with ID ${meal.id}`,
          data: {},
        });
      } else {
        callback(null, meal);
      }
    }
  });
};

const mealController = {
  createMeal: (req, res) => {
    const { error, value: input } = createMealSchema.validate(req.body);

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
      isActive: input.isActive || 1,
      isVega: input.isVega || 0,
      isVegan: input.isVegan || 0,
      isToTakeHome: input.isToTakeHome || 0,
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

              const convertedMeal = {
                ...createdMeal,
                isActive: createdMeal.isActive === 1 ? true : false,
                isVega: createdMeal.isVega === 1 ? true : false,
                isVegan: createdMeal.isVegan === 1 ? true : false,
                isToTakeHome: createdMeal.isToTakeHome === 1 ? true : false,
              };
              res.status(201).json({
                status: 201,
                message: "Meal created successfully",
                data: convertedMeal,
              });
            }
          }
        );
      }
    });
  },

  updateMealById: (req, res) => {
    const mealId = req.params.mealId;
    const cookId = req.userid;

    logger.info(cookId);

    const { error, value: input } = updateMealSchema.validate(req.body);

    // Check for validation errors
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input",
        data: { error: error.details[0].message },
      });
    }

    fetchMealById(mealId, cookId, (error, meal) => {
      if (error) {
        if (error.status === 403) {
          // Handle 403 response here
          return res.status(403).json({
            status: 403,
            message: `Not authorized to update meal with ID ${mealId}`,
            data: {},
          });
        } else {
          // Handle other errors
          return res.status(error.status).json(error);
        }
      }

      // Update the meal in the database
      const updateMealSqlStatement = "UPDATE `meal` SET ? WHERE id = ?";

      pool.query(
        updateMealSqlStatement,
        [input, mealId],
        function (error, results, fields) {
          if (error) {
            logger.error(error);
            return res.status(500).json({
              status: 500,
              message: "Failed to update meal",
              data: {
                error,
              },
            });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({
              status: 404,
              message: `No meal with ID ${mealId}`,
              data: {},
            });
          }

          logger.info(`Updated meal by id: ${mealId}`);

          const selectMealStatement = "SELECT * FROM `meal` WHERE id = ?";
          pool.query(
            selectMealStatement,
            mealId,
            function (error, results, fields) {
              if (error) {
                logger.error(error);
                return res.status(500).json({
                  status: 500,
                  message: "Error retrieving updated meal information",
                  data: {
                    error,
                  },
                });
              }

              const updatedMeal = results[0];

              res.status(200).json({
                status: 200,
                message: "Updated meal",
                data: updatedMeal,
              });
            }
          );
        }
      );
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

    pool.query(
      sqlSelectStatement,
      mealId,
      function (error, mealResults, fields) {
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
          if (mealResults.length === 0) {
            return res.status(404).json({
              status: 404,
              message: `No meal with ID ${mealId} found`,
              data: {},
            });
          } else {
            const meal = { ...mealResults[0] };
            meal.isActive = meal.isActive === 1 ? true : false;
            meal.isVega = meal.isVega === 1 ? true : false;
            meal.isVegan = meal.isVegan === 1 ? true : false;
            meal.isToTakeHome = meal.isToTakeHome === 1 ? true : false;

            const cookId = meal.cookId;

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
            WHERE mp.mealId = ?`;

                pool.query(
                  getParticipantsSqlStatement,
                  mealId,
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

                    const participants = participantsResults.map(
                      (participant) => {
                        const convertedParticipant = {
                          ...participant,
                          isActive: participant.isActive === 1 ? true : false,
                        };
                        delete convertedParticipant.password;
                        return convertedParticipant;
                      }
                    );

                    res.status(200).json({
                      status: 200,
                      message: "Meal details retrieved successfully",
                      data: {
                        meal: meal,
                        cook: cook,
                        participants: participants,
                      },
                    });
                  }
                );
              }
            );
          }
        }
      }
    );
  },

  deleteMealById: (req, res) => {
    const mealId = parseInt(req.params.mealId);
    const cookId = req.userid;
    logger.info(
      `Request for deleting meal with id ${mealId} from user with id ${cookId}`
    );

    const deleteMealSqlStatement = "DELETE FROM `meal` WHERE id = ?";

    fetchMealById(mealId, cookId, (error, meal) => {
      if (error) {
        if (error.status === 403) {
          // Handle 403 response here
          return res.status(403).json({
            status: 403,
            message: `Not authorized to update meal with ID ${mealId}`,
            data: {},
          });
        } else {
          // Handle other errors
          return res.status(error.status).json(error);
        }
      } else {
        // Proceed with deleting the meal
        pool.query(
          deleteMealSqlStatement,
          [mealId],
          function (error, deleteResults, fields) {
            if (error) {
              logger.error(error);
              res.status(500).json({
                status: 500,
                message: "Failed to delete meal by id",
                data: {
                  error,
                },
              });
            } else if (deleteResults.affectedRows === 0) {
              res.status(404).json({
                status: 404,
                message: `No meal with ID ${mealId}`,
                data: {},
              });
            } else {
              res.status(200).json({
                status: 200,
                message: `Maaltijd met ID ${mealId} is verwijderd`,
                data: {},
              });
            }
          }
        );
      }
    });
  },
};

module.exports = mealController;

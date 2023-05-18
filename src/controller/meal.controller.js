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

    pool.query(sqlSelectStatement, function (error, results, fields) {
      if (error) {
        logger.error(error);
        res.status(500).json({
          status: 500,
          message: "Failed to fetch meals.",
          data: {
            error,
          },
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Meals fetched successfully.",
          data: results,
        });
      }
    });
  },
};

module.exports = mealController;

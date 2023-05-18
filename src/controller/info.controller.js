const logger = require("../util/utils").logger;

const infoController = {
  getApiInfo: (req, res) => {
    logger.info("Get server information");
    res.status(200).json({
      status: 200,
      message: "Server info-endpoint",
      data: {
        studentName: "Jarno",
        studentNumber: 2176550,
        description: "Welkom bij de server API van de share a meal.",
      },
    });
  },
};

module.exports = infoController;

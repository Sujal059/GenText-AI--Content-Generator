const express = require("express");

const isAuthenticated = require("../middlewares/isAuthenticated");
const { googleAIController } = require("../controllers/googleAIController");
const checkApiRequestLimit = require("../middlewares/checkApiRequestLimit");

const googleAIRouter = express.Router();

googleAIRouter.post(
  "/generate-content",
  isAuthenticated,
  checkApiRequestLimit,
  googleAIController
);

module.exports = googleAIRouter;

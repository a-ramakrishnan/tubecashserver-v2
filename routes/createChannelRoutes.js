const express = require("express");
const router = express.Router();
const createChannelController = require("../controllers/createChannelController");

router
  .route("/oauth/google")
  .get(createChannelController.createNewChannelInfo)

  .patch(createChannelController.updateChannelInfo)
  .delete(createChannelController.deleteChannelInfo);

module.exports = router;

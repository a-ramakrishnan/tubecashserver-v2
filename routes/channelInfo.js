const express = require("express");
const router = express.Router();
const channelInfoController = require("../controllers/channelInfoController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router.route("/").get(channelInfoController.getAllChannels);
router.route("/updateTokens").post(channelInfoController.updateTokens);
router
  .route("/performancestats")
  .post(channelInfoController.getPerformanceChannelStats);
router.route("/videostats").post(channelInfoController.getVideoChannelStats);
router.route("/fullstats").post(channelInfoController.getFullChannelStats);
router.route("/getFullVideoData").post(channelInfoController.getFullVideoData);

module.exports = router;

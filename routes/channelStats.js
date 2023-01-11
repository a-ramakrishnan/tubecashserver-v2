const express = require("express");
const router = express.Router();
const channelStatsController = require("../controllers/channelStatsController");

router
  .route("/performance")
  .post(channelStatsController.getPerformanceChannelStats);
router.route("/videostats").post(channelStatsController.getVideoChannelStats);
router.route("/fullstats").post(channelStatsController.getFullChannelStats);

module.exports = router;

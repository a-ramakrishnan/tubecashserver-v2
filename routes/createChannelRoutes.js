const express = require("express");
const router = express.Router();
const createChannelController = require("../controllers/createChannelController");
const verifyJWT = require("../middleware/verifyJWT");

//router.use(verifyJWT);
router
  .route("/oauth/google")
  .get(createChannelController.createNewChannelInfo)

  .patch(verifyJWT, createChannelController.updateChannelInfo)
  .delete(verifyJWT, createChannelController.deleteChannelInfo);

module.exports = router;

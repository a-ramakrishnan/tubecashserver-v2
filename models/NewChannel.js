const mongoose = require("mongoose");

const NewChannelSchema = new mongoose.Schema(
  {
    /*This user refers to the user who has created an account in our system. */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    channelID: {
      type: String,
      required: true,
    },
    googleID: {
      type: String,
      required: true,
    },
    channelName: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
    id_token: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expires_in: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    lastUpdatedDate: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewChannel", NewChannelSchema);

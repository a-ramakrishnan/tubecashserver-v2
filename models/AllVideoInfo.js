const mongoose = require("mongoose");

const AllVideoSchema = new mongoose.Schema(
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
    id: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

    videoId: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    videoOwnerChannelTitle: {
      type: String,
      required: false,
    },
    videoOwnerChannelId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AllVideos", AllVideoSchema);

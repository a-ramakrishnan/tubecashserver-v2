const mongoose = require("mongoose");

const performanceStatsSchema = new mongoose.Schema(
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
    day: {
      type: String,
      required: true,
    },
    views: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    likes: {
      type: String,
      required: true,
    },
    dislikes: {
      type: String,
      required: true,
    },
    shares: {
      type: String,
      required: true,
    },
    videosAddedToPlaylists: {
      type: String,
      required: true,
    },
    videosRemovedFromPlaylists: {
      type: String,
      required: true,
    },
    subscribersLost: {
      type: String,
      required: true,
    },
    estimatedMinutesWatched: {
      type: String,
      required: true,
    },
    averageViewDuration: {
      type: String,
      required: true,
    },
    averageViewPercentage: {
      type: String,
      required: true,
    },
    subscribersGained: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PerformanceStats", performanceStatsSchema);

/*
day,
        views,
        comments,
        likes,
        dislikes,
        shares,
        videosAddedToPlaylists,
        videosRemovedFromPlaylists,
        subscribersLost,
        estimatedMinutesWatched,
        averageViewDuration,
        averageViewPercentage,
        subscribersGained,

        estimatedRevenue,
        estimatedAdRevenue,
        estimatedRedPartnerRevenue,
        grossRevenue,
        cpm,
        adImpressions,
        monetizedPlaybacks,
        playbackBasedCpm,
 */

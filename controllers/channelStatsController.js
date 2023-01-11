const User = require("../models/User");
const Channel = require("../models/NewChannel");
const VideoStats = require("../models/Video");
const FullChannelStats = require("../models/FullChannelStats");
const PerformanceStats = require("../models/PerformanceStats");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const {
  getVideoStats,
  getPerformanceStats,
  getFullStats,
} = require("../services/googleServices");

const getPerformanceChannelStats = asyncHandler(async (req, res) => {
  const { access, refresh } = req.body;

  let channelID, accessToken, refreshToken;

  //console.log(req.body);

  jwt.verify(access, process.env.JWT_PRIVATE, function (err, decoded) {
    try {
      channelID = decoded?.ChannelInfo.channelID;
      accessToken = decoded?.ChannelInfo.accessToken;
    } catch (err) {
      console.log("Error is", err);
    }
  });
  // console.log("ChannelID is ", channelID);
  // console.log("Access Token is ", accessToken);

  // Getting Video Statistics
  //const data = getVideoStats({ channelID, accessToken });
  const data = await getPerformanceStats({ channelID, accessToken });
  if (data.rows.length > 0) {
    const { _id } = await User.findOne().select("-password").lean();
    const { googleID, channelName } = await Channel.findOne({
      channelID: channelID,
    });
    console.log("Google ID is ", googleID);
    //console.log(data);
    const dataToWrite = data.rows.map(
      ([
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
      ]) => ({
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
      })
    );

    //console.log(dataToWrite);

    const arrToWrite = dataToWrite.map((g) => ({
      googleID: googleID,
      user: _id,
      channelID: channelID,
      channelName: channelName,
      ...g,
    }));
    //console.log(arrToWrite);

    try {
      const performanceStats = await PerformanceStats.insertMany(arrToWrite);
      console.log(performanceStats);
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(403);
    res.send({ message: "Did not receive data. permission error" });
  }
});

const getVideoChannelStats = asyncHandler(async (req, res) => {
  const { access, refresh } = req.body;

  let channelID, accessToken, refreshToken;

  //console.log(req.body);

  jwt.verify(access, process.env.JWT_PRIVATE, function (err, decoded) {
    try {
      channelID = decoded?.ChannelInfo.channelID;
      accessToken = decoded?.ChannelInfo.accessToken;
    } catch (err) {
      console.log("Error is", err);
    }
  });
  //console.log("ChannelID is ", channelID);
  //console.log("Access Token is ", accessToken);

  // Getting Video Statistics
  //const data = getVideoStats({ channelID, accessToken });
  const data = await getVideoStats({ channelID, accessToken });
  //console.log(data);
  if (data) {
    const { _id } = await User.findOne().select("-password").lean();
    const { googleID, channelName } = await Channel.findOne({
      channelID: channelID,
    });
    console.log("Google ID is ", googleID);
    //console.log(data);
    const dataToWrite = data.rows.map(
      ([
        video,
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
      ]) => ({
        video,
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
      })
    );
    //console.log(dataToWrite);

    const arrToWrite = dataToWrite.map((g) => ({
      googleID: googleID,
      user: _id,
      channelID: channelID,
      channelName: channelName,
      ...g,
    }));
    //console.log(arrToWrite);

    try {
      const videoStats = await VideoStats.insertMany(arrToWrite);
      console.log(videoStats);
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(403);
    res.send({ message: "Did not receive data. permission error" });
  }
});

const getFullChannelStats = asyncHandler(async (req, res) => {
  const { access, refresh } = req.body;

  let channelID, accessToken, refreshToken;

  //console.log(req.body);

  jwt.verify(access, process.env.JWT_PRIVATE, function (err, decoded) {
    try {
      channelID = decoded?.ChannelInfo.channelID;
      accessToken = decoded?.ChannelInfo.accessToken;
    } catch (err) {
      console.log("Error is", err);
    }
  });
  //console.log("ChannelID is ", channelID);
  //console.log("Access Token is ", accessToken);

  // Getting Video Statistics
  //const data = getVideoStats({ channelID, accessToken });
  const data = await getFullStats({ channelID, accessToken });
  if (data.rows.length > 0) {
    const { _id } = await User.findOne().select("-password").lean();
    const { googleID, channelName } = await Channel.findOne({
      channelID: channelID,
    });
    console.log("Google ID is ", googleID);
    //console.log(data);
    const dataToWrite = data.rows.map(
      ([
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
      ]) => ({
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
      })
    );

    const arrToWrite = dataToWrite.map((g) => ({
      googleID: googleID,
      user: _id,
      channelID: channelID,
      channelName: channelName,
      ...g,
    }));
    //console.log(arrToWrite);

    try {
      const fullChannelStats = await FullChannelStats.insertMany(arrToWrite);
      console.log(fullChannelStats);
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(403);
    res.send({ message: "Did not receive data. permission error" });
  }
});

module.exports = {
  getPerformanceChannelStats,
  getVideoChannelStats,
  getFullChannelStats,
};

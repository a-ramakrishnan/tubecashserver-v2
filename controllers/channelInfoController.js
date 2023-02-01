const asyncHandler = require("express-async-handler");
const Channel = require("../models/NewChannel");

const {
  updateOAuthTokens,

  getPlaylistUploadsKey,
  getVideoDataFirstPage,
  getVideoDataMultiplePages,
  getPerformanceStats,
  getVideoStats,
  getDailyVideoStats,
  getFullStats,
} = require("../services/googleServices");
const NewChannel = require("../models/NewChannel");

const User = require("../models/User");
const PerformanceStats = require("../models/PerformanceStats");
const AllVideoInfo = require("../models/AllVideoInfo");
const VideoStats = require("../models/Video");
const DailyVideoStats = require("../models/dailyVideo");

const FullChannelStats = require("../models/FullChannelStats");

const getAllChannels = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  console.log(req.user);
  const channels = await Channel.find()
    .select([
      "-user",
      "-access_token",
      "-id_token",
      "-code",
      "-expires_in",
      "-refresh_token",
    ])
    .lean()
    .sort({ $natural: -1 });

  if (!channels?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(channels);
});

const updateTokens = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  try {
    const { refresh_token } = await Channel.findOne({
      channelID: channelID,
    }).exec();
    console.log(refresh_token);
    const data = await updateOAuthTokens({ refresh_token });
    const { access_token, expires_in, id_token } = data;

    const updateChannel = await NewChannel.findOneAndUpdate(
      {
        channelID: channelID,
      },
      {
        access_token: access_token,
        id_token: id_token,
        expires_in: expires_in,
        lastUpdatedDate: new Date().toLocaleDateString("en-IN"),
        refresh_token: refresh_token,
      },
      {
        upsert: true,
      }
    );
    console.log(updateChannel);
    res.status(201).json(updateChannel);
  } catch (error) {
    console.log(error);
  }
});

const getFullVideoData = asyncHandler(async (req, res) => {
  //This is a 2 step process; We need to get the related playlists-uploads info
  //And based on that info retrieve playlist items
  const { channelID } = req.body;
  try {
    const { _id } = await User.findOne().select("-password").lean();

    const { googleID, access_token } = await Channel.findOne({
      channelID: channelID,
    }).exec();

    const data = await getPlaylistUploadsKey({
      channelID,
      accessToken: access_token,
    });
    console.log(
      "PLaylist Items - Upload",
      data?.items[0]?.contentDetails?.relatedPlaylists?.uploads
    );
    const uploads = data?.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    let playlistData = await getVideoDataFirstPage({
      accessToken: access_token,
      uploads,
    });
    let videos = { items: [] };
    if (playlistData) {
      nextPageToken = playlistData?.nextPageToken;
      playlistData.items.map((video) => {
        videos.items.push({
          id: video.id,
          publishedAt: video?.snippet.publishedAt,

          title: video?.snippet.title,

          videoId: video?.snippet.resourceId.videoId,
          position: video?.snippet.position,
          channelName: video?.snippet.channelTitle,
          videoOwnerChannelTitle: video?.snippet.videoOwnerChannelTitle,
          videoOwnerChannelId: video?.snippet.videoOwnerChannelId,
        });
      });

      while (typeof playlistData.nextPageToken !== "undefined") {
        console.log("PlaylistData NextPage Token", playlistData?.nextPageToken);
        await getVideoDataMultiplePages({
          accessToken: access_token,
          uploads,
          nextPageToken: nextPageToken,
        })
          .then((data) => {
            playlistData = data;
            nextPageToken = playlistData?.nextPageToken;
            playlistData.items.map((video) => {
              videos.items.push({
                id: video.id,
                publishedAt: video?.snippet.publishedAt,
                title: video?.snippet.title,
                videoId: video?.snippet.resourceId.videoId,
                position: video?.snippet.position,
                channelName: video?.snippet.channelTitle,
                videoOwnerChannelTitle: video?.snippet.videoOwnerChannelTitle,
                videoOwnerChannelId: video?.snippet.videoOwnerChannelId,
              });
            });
          })
          .catch((error) => console.log(error));
      }
      const dataToWrite = Object.entries(videos?.items);

      //console.log("Showing dataToWrite");
      //console.log(dataToWrite);

      let arrToWrite = dataToWrite.map((g) => ({
        //console.log(g)
        googleID: googleID,
        channelID: channelID,
        user: _id,
        id: g[1].id,
        publishedAt: g[1].publishedAt,
        title: g[1].title,
        videoId: g[1].videoId,
        position: g[1].position,
        channelName: g[1].channelName,
        videoOwnerChannelTitle: g[1].videoOwnerChannelTitle,
        videoOwnerChannelId: g[1].videoOwnerChannelId,
      }));
      console.log("Showing arrToWrite");
      console.log(arrToWrite);

      try {
        //const allVideoInfo = await AllVideoInfo.insertMany(arrToWrite);
        const allVideoInfo = arrToWrite.map(async (field) => {
          await AllVideoInfo.findOneAndUpdate(
            {
              channelID: field.channelID,
              googleID: field.googleID,
              videoId: field.videoId,
              id: field.id,
            },
            {
              googleID: field.googleID,
              channelID: field.channelID,
              user: field.user,
              id: field.id,
              publishedAt: field.publishedAt,
              title: field.title,
              videoId: field.videoId,
              position: field.position,
              channelName: field.channelName,
              videoOwnerChannelTitle: field.videoOwnerChannelTitle,
              videoOwnerChannelId: field.videoOwnerChannelId,
            },
            { upsert: true, new: true }
          );
        });

        console.log(allVideoInfo);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

const getPerformanceChannelStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  console.log(req.body);

  try {
    const { _id } = await User.findOne().select("-password").lean();

    const { googleID, access_token } = await Channel.findOne({
      channelID: channelID,
    }).exec();

    const data = await getPerformanceStats({
      channelID,
      accessToken: access_token,
    });

    if (data.rows.length > 0) {
      const { _id } = await User.findOne().select("-password").lean();
      const { googleID, channelName } = await Channel.findOne({
        channelID: channelID,
      });
      //console.log("Google ID is ", googleID);
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
        const performanceStats = arrToWrite.map(async (field) => {
          await PerformanceStats.findOneAndUpdate(
            {
              channelID: field.channelID,
              user: field.user,
              googleID: field.googleID,
              day: field.day,
            },
            {
              user: field.user,
              channelID: field.channelID,
              googleID: field.id,
              channelName: field.channelName,
              day: field.day,
              views: field.views,
              comments: field.comments,
              likes: field.likes,
              dislikes: field.dislikes,
              shares: field.shares,
              videosAddedToPlaylists: field.videosAddedToPlaylists,
              videosRemovedFromPlaylists: field.videosRemovedFromPlaylists,
              subscribersLost: field.subscribersLost,
              estimatedMinutesWatched: field.estimatedMinutesWatched,
              averageViewDuration: field.averageViewDuration,
              averageViewPercentage: field.averageViewPercentage,
              subscribersGained: field.subscribersGained,
            },
            { upsert: true, new: true }
          );
        });

        console.log(performanceStats);
      } catch (error) {
        console.log(error);
      }
    } else {
      res.status(403);
      res.send({ message: "Did not receive data. permission error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//This includes video revenue
const getVideoChannelStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  console.log(req.body);

  try {
    const { _id } = await User.findOne().select("-password").lean();

    const { googleID, access_token, channelName } = await Channel.findOne({
      channelID: channelID,
    }).exec();
    const data = await getVideoStats({ channelID, accessToken: access_token });
    //console.log(data);
    if (data) {
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
        //const videoStats = await VideoStats.insertMany(arrToWrite);

        const videoStats = arrToWrite.map(async (field) => {
          await VideoStats.findOneAndUpdate(
            {
              channelID: field.channelID,
              user: field.user,
              googleID: field.googleID,
              video: field.video,
            },
            {
              user: field.user,
              channelID: field.channelID,
              channelName: field.channelName,
              googleID: field.googleID,
              video: field.video,
              views: field.views,
              comments: field.comments,
              likes: field.likes,
              dislikes: field.dislikes,
              shares: field.shares,
              videosAddedToPlaylists: field.videosAddedToPlaylists,
              videosRemovedFromPlaylists: field.videosRemovedFromPlaylists,
              subscribersLost: field.subscribersLost,
              estimatedMinutesWatched: field.estimatedMinutesWatched,
              averageViewDuration: field.averageViewDuration,
              averageViewPercentage: field.averageViewPercentage,
              subscribersGained: field.subscribersGained,
              estimatedRevenue: field.estimatedRevenue,
              estimatedAdRevenue: field.estimatedAdRevenue,
              estimatedRedPartnerRevenue: field.estimatedRedPartnerRevenue,
              grossRevenue: field.grossRevenue,
              cpm: field.cpm,
              adImpressions: field.adImpressions,
              monetizedPlaybacks: field.monetizedPlaybacks,
              playbackBasedCpm: field.playbackBasedCpm,
            },
            { upsert: true, new: true }
          );
        });
        console.log(videoStats);
      } catch (error) {
        console.log(error);
      }
    } else {
      res.status(403);
      res.send({ message: "Did not receive data. permission error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//This includes video revenue
const getDailyVideoChannelStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  console.log(req.body);

  try {
    const { _id } = await User.findOne().select("-password").lean();

    const { googleID, access_token, channelName } = await Channel.findOne({
      channelID: channelID,
    }).exec();
    const data = await getDailyVideoStats({
      channelID,
      accessToken: access_token,
    });
    //console.log(data);
    if (data) {
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
        const dailyVideoStats = await DailyVideoStats.insertMany(arrToWrite);

        // const videoStats = arrToWrite.map(async (field) => {
        //   await DailyVideoStats.findOneAndUpdate(
        //     {
        //       channelID: field.channelID,
        //       user: field.user,
        //       googleID: field.googleID,
        //       video: field.video,
        //     },
        //     {
        //       user: field.user,
        //       channelID: field.channelID,
        //       channelName: field.channelName,
        //       googleID: field.googleID,
        //       video: field.video,
        //       views: field.views,
        //       comments: field.comments,
        //       likes: field.likes,
        //       dislikes: field.dislikes,
        //       shares: field.shares,
        //       videosAddedToPlaylists: field.videosAddedToPlaylists,
        //       videosRemovedFromPlaylists: field.videosRemovedFromPlaylists,
        //       subscribersLost: field.subscribersLost,
        //       estimatedMinutesWatched: field.estimatedMinutesWatched,
        //       averageViewDuration: field.averageViewDuration,
        //       averageViewPercentage: field.averageViewPercentage,
        //       subscribersGained: field.subscribersGained,
        //       estimatedRevenue: field.estimatedRevenue,
        //       estimatedAdRevenue: field.estimatedAdRevenue,
        //       estimatedRedPartnerRevenue: field.estimatedRedPartnerRevenue,
        //       grossRevenue: field.grossRevenue,
        //       cpm: field.cpm,
        //       adImpressions: field.adImpressions,
        //       monetizedPlaybacks: field.monetizedPlaybacks,
        //       playbackBasedCpm: field.playbackBasedCpm,
        //     },
        //     { new: true }
        //   );
        // });
        console.log(dailyVideoStats);
      } catch (error) {
        console.log(error);
      }
    } else {
      res.status(403);
      res.send({ message: "Did not receive data. permission error" });
    }
  } catch (error) {
    console.log(error);
  }
});

const getFullChannelStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  console.log(req.body);

  try {
    const { _id } = await User.findOne().select("-password").lean();

    const { googleID, access_token, channelName } = await Channel.findOne({
      channelID: channelID,
    }).exec();

    const data = await getFullStats({ channelID, accessToken: access_token });
    if (data.rows.length > 0) {
      //console.log("Google ID is ", googleID);
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
        const fullChannelStats = arrToWrite.map(async (field) => {
          await FullChannelStats.findOneAndUpdate(
            {
              channelID: field.channelID,
              user: field.user,
              googleID: field.googleID,
              day: field.day,
            },
            {
              user: field.user,
              channelID: field.channelID,
              channelName: field.channelName,
              googleID: field.googleID,
              day: field.day,
              views: field.views,
              comments: field.comments,
              likes: field.likes,
              dislikes: field.dislikes,
              shares: field.shares,
              videosAddedToPlaylists: field.videosAddedToPlaylists,
              videosRemovedFromPlaylists: field.videosRemovedFromPlaylists,
              subscribersLost: field.subscribersLost,
              estimatedMinutesWatched: field.estimatedMinutesWatched,
              averageViewDuration: field.averageViewDuration,
              averageViewPercentage: field.averageViewPercentage,
              subscribersGained: field.subscribersGained,
              estimatedRevenue: field.estimatedRevenue,
              estimatedAdRevenue: field.estimatedAdRevenue,
              estimatedRedPartnerRevenue: field.estimatedRedPartnerRevenue,
              grossRevenue: field.grossRevenue,
              cpm: field.cpm,
              adImpressions: field.adImpressions,
              monetizedPlaybacks: field.monetizedPlaybacks,
              playbackBasedCpm: field.playbackBasedCpm,
            },
            { upsert: true, new: true }
          );
        });
        console.log(fullChannelStats);
      } catch (error) {
        console.log(error);
      }
    } else {
      res.status(403);
      res.send({ message: "Did not receive data. permission error" });
    }
  } catch (error) {
    console.log(error);
  }
});

const displayFullChannelStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;

  try {
    const stats = await FullChannelStats.find({
      channelID: channelID,
    }).sort({ $natural: -1 });
    if (!stats?.length) {
      return res.status(400).json({ message: "No Stats found" });
    }

    console.log(stats.length);
    res.json(stats);
  } catch (error) {
    console.log(error);
  }
});

const displayDailyVideoStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;
  try {
    const stats = await DailyVideoStats.find({
      channelID: channelID,
    });
    if (!stats?.length) {
      return res.status(400).json({ message: "No Stats found" });
    }

    res.json(stats);
  } catch (error) {
    console.log(error);
  }
});
const displayVideoRevenueStats = asyncHandler(async (req, res) => {
  const { channelID } = req.body;
  try {
    const stats = await VideoStats.find({
      channelID: channelID,
    });
    if (!stats?.length) {
      return res.status(400).json({ message: "No Stats found" });
    }

    res.json(stats);
  } catch (error) {
    console.log(error);
  }
});
const displayAllVideoUploaded = asyncHandler(async (req, res) => {
  const { channelID } = req.body;
  console.log(channelID)
  try {
    const stats = await AllVideoInfo.find({
      channelID: channelID,
    });
    console.log('Length of Stats is ', stats.length)
    if (!stats?.length) {
      return res.status(400).json({ message: "No Stats found" });
    }

    console.log('Inside all Videos function', stats)
    res.json(stats);
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  getAllChannels,
  updateTokens,
  getFullVideoData,
  getPerformanceChannelStats,
  getVideoChannelStats,
  getFullChannelStats,
  getDailyVideoChannelStats,
  displayFullChannelStats,
  displayDailyVideoStats,
  displayVideoRevenueStats,
  displayAllVideoUploaded,
};

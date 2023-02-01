const axios = require("axios");
const qs = require("qs");

const yourDateTime = new Date();
const dateTimeInParts = yourDateTime.toISOString().split("T");

const endDate = dateTimeInParts[0];
console.log("End Date is ", endDate);
const updateOAuthTokens = async ({ refresh_token }) => {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_SECRET,
    refresh_token: refresh_token,
    grant_type: "refresh_token",
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error.response.data.error);

    throw new Error(error.message);
  }
};

const getGoogleOAuthTokens = async ({ code }) => {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error.response.data.error);

    throw new Error(error.message);
  }
};

const getGoogleUser = async ({ id_token, access_token }) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGoogleChannelID = async (access_token) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // console.log("Channel ID is", res.data.items[0].id);
    // console.log("Channel Title is", res.data.items[0].snippet.title);

    return res.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getVideoStats = async ({ channelID, accessToken }) => {
  //https://www.googleapis.com/youtube/analytics/v1/reports?access_token=access_token&ids=channel%3D%3DMINE&start-date=2016-05-01&end-date=2016-06-30&metrics=views
  console.log("Inside Video Stats_______________");
  console.log(channelID, accessToken);

  const fields =
    "views%2Ccomments%2Clikes%2Cdislikes%2Cshares%2CvideosAddedToPlaylists%2CvideosRemovedFromPlaylists%2CsubscribersLost%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2CsubscribersGained%2CestimatedRevenue%2CestimatedAdRevenue%2CestimatedRedPartnerRevenue%2CgrossRevenue%2Ccpm%2CadImpressions%2CmonetizedPlaybacks%2CplaybackBasedCpm";

  try {
    const res = await axios.get(
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=video&endDate=${endDate}&ids=channel%3D%3D${channelID}&maxResults=200&metrics=${fields}&sort=-estimatedRevenue&startDate=2017-01-01`
    );

    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getDailyVideoStats = async ({ channelID, accessToken }) => {
  //https://www.googleapis.com/youtube/analytics/v1/reports?access_token=access_token&ids=channel%3D%3DMINE&start-date=2016-05-01&end-date=2016-06-30&metrics=views
  console.log("Inside Video Stats_______________");
  console.log(channelID, accessToken);

  const fields =
    "views%2Ccomments%2Clikes%2Cdislikes%2Cshares%2CvideosAddedToPlaylists%2CvideosRemovedFromPlaylists%2CsubscribersLost%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2CsubscribersGained%2CestimatedRevenue%2CestimatedAdRevenue%2CestimatedRedPartnerRevenue%2CgrossRevenue%2Ccpm%2CadImpressions%2CmonetizedPlaybacks%2CplaybackBasedCpm";

  try {
    const res = await axios.get(
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=video&endDate=${endDate}&ids=channel%3D%3D${channelID}&maxResults=200&metrics=${fields}&sort=-estimatedRevenue&startDate=2017-01-01`
    );

    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getPerformanceStats = async ({ channelID, accessToken }) => {
  //https://www.googleapis.com/youtube/analytics/v1/reports?access_token=access_token&ids=channel%3D%3DMINE&start-date=2016-05-01&end-date=2016-06-30&metrics=views
  console.log("Inside Performance Stats_______________");
  console.log(channelID, accessToken);

  const fields =
    "views%2Ccomments%2Clikes%2Cdislikes%2Cshares%2CvideosAddedToPlaylists%2CvideosRemovedFromPlaylists%2CsubscribersLost%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2CsubscribersGained";

  try {
    const res = await axios.get(
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=day&&endDate=${endDate}&ids=channel%3D%3D${channelID}&metrics=${fields}&startDate=2017-01-01&sort=day`
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getFullStats = async ({ channelID, accessToken }) => {
  console.log("Inside Performance Stats_______________");
  console.log(channelID, accessToken);

  const fields =
    "views%2Ccomments%2Clikes%2Cdislikes%2Cshares%2CvideosAddedToPlaylists%2CvideosRemovedFromPlaylists%2CsubscribersLost%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2CsubscribersGained%2CestimatedRevenue%2CestimatedAdRevenue%2CestimatedRedPartnerRevenue%2CgrossRevenue%2Ccpm%2CadImpressions%2CmonetizedPlaybacks%2CplaybackBasedCpm";

  try {
    const res = await axios.get(
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=day&endDate=${endDate}&ids=channel%3D%3D${channelID}&metrics=${fields}&startDate=2017-01-01&sort=day`
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getPlaylistUploadsKey = async ({ channelID, accessToken }) => {
  console.log("Inside get Playlist Uploads Key_______________");
  //console.log(channelID, accessToken);

  const fields = "snippet%2CcontentDetails%2Cstatistics";

  try {
    const res = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/channels?part=${fields}&access_token=${accessToken}&id=${channelID}&key=${process.env.GOOGLE_API_KEY}`
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getVideoDataFirstPage = async ({ accessToken, uploads }) => {
  //youtube.googleapis.com/youtube/v3/playlistItems

  console.log("Inside get Full Video Data_______________");

  const fields = "snippet";

  try {
    const res = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${fields}&maxResults=500&access_token=${accessToken}&playlistId=${uploads}&key=${process.env.GOOGLE_API_KEY}`
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getVideoDataMultiplePages = async ({
  accessToken,
  uploads,
  nextPageToken,
}) => {
  //youtube.googleapis.com/youtube/v3/playlistItems

  console.log("Inside get Full Video Data Multiple Pages_______________");

  const fields = "snippet";

  try {
    const res = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${fields}&maxResults=500&access_token=${accessToken}&playlistId=${uploads}&pageToken=${nextPageToken}&key=${process.env.GOOGLE_API_KEY}`
    );

    return res.data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getGoogleOAuthTokens,
  getGoogleUser,
  getGoogleChannelID,
  getVideoStats,
  getPerformanceStats,
  getFullStats,
  updateOAuthTokens,
  getPlaylistUploadsKey,
  getVideoDataFirstPage,
  getVideoDataMultiplePages,
  getDailyVideoStats,
};

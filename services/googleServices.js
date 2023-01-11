const axios = require("axios");
const qs = require("qs");

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
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=video&endDate=2023-01-07&ids=channel%3D%3D${channelID}&maxResults=200&metrics=${fields}&sort=-estimatedRevenue&startDate=2017-01-01`
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
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=day&&endDate=2023-01-07&ids=channel%3D%3D${channelID}&metrics=${fields}&startDate=2017-01-01&sort=day`
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
      `https://youtubeanalytics.googleapis.com/v2/reports?access_token=${accessToken}&dimensions=day&endDate=2023-01-07&ids=channel%3D%3D${channelID}&metrics=${fields}&startDate=2017-01-01&sort=day`
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
};

const User = require("../models/User");
const NewChannel = require("../models/NewChannel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const {
  getGoogleOAuthTokens,
  getGoogleUser,
  getGoogleChannelID,
} = require("../services/googleServices");

const createNewChannelInfo = asyncHandler(async (req, res) => {
  // get the code from qs
  const code = req.query.code;

  try {
    // get the id and access token with the code
    const {
      id_token,
      access_token,
      expires_in,
      refresh_token,
      scope,
      token_type,
    } = await getGoogleOAuthTokens({ code });
    // console.log({
    //   id_token,
    //   access_token,
    //   expires_in,
    //   refresh_token,
    //   scope,
    //   token_type,
    // });

    // get user with tokens
    const googleUser = await getGoogleUser({ id_token, access_token });
    jwt.decode(id_token);

    console.log({ googleUser });

    if (!googleUser?.verified_email) {
      return res.status(403).send("Google account is not verified");
    }

    const { items } = await getGoogleChannelID(access_token);

    const channelID = items[0].id;
    const channelName = items[0].snippet.title;

    const { _id } = await User.findOne().select("-password").lean();

    // upsert the channel
    const newChannel = await NewChannel.findOneAndUpdate(
      {
        channelID: channelID,
      },
      {
        user: _id,
        googleID: googleUser.id,
        channelName: channelName,
        access_token: access_token,
        id_token: id_token,
        code: code,
        expires_in: expires_in,
        refresh_token: refresh_token,
        lastUpdatedDate: new Date().toLocaleDateString("en-IN"),
        scope: scope,
        token_type: token_type,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // // redirect back to client
    res.redirect(`${process.env.REDIRECT_CLIENT_URL}`);
  } catch (error) {
    console.log(error, "Failed to authorize Google user");
    return res.redirect(`${process.env.REDIRECT_CLIENT_URL}/oauth/error`);
  }
});

const updateChannelInfo = asyncHandler(async (req, res) => {});

const deleteChannelInfo = asyncHandler(async (req, res) => {});

module.exports = {
  createNewChannelInfo,
  updateChannelInfo,
  deleteChannelInfo,
};

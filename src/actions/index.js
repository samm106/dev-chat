import * as actiontypes from "./types";

export const setUser = (user) => {
  return {
    type: actiontypes.SET_USER,
    payload: {
      currentUser: user,
    },
  };
};

export const clearUser = () => {
  return {
    type: actiontypes.CLEAR_USER,
  };
};

export const setCurrentChannel = (channel) => {
  return {
    type: actiontypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel,
    },
  };
};

export const setPrivateChannel = (isPrivateChannel) => {
  return {
    type: actiontypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel,
    },
  };
};
export const setUserPosts = (userPosts) => {
  return {
    type: actiontypes.SET_USER_POSTS,
    payload: {
      userPosts,
    },
  };
};

export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actiontypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor,
    },
  };
};

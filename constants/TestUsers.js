const USER = {
  recentActivity: [], // From seperate collection, Activity, received from server
  jsonWebToken: null,
  pushTokens: [], // [{token, deviceInfo, active}]

  _id: null, // db id. if null, redirect to login
  localId: null, // local user id
  username: "User1",
  usernameDecoration: {
    prefixColor: "red",
    prefix: "",
    description: "",
  },
  name: "Test Name",
  email: "",
  dateJoined: null,
  rank: "user",
  plus: false, // premium
  friendRequests: [], // [{...userInfo, read: false}]
  friendsAdded: [], // [userInfo, userInfo]
  friends: [], // [friend, friend] -> certain info specified from server. Just ids in db
  subscriptions: [],
  profileImg: {},
  trouble: { bans: [], warnings: [], frozen: false }, //warning {title, message, active, date, id}
  googleId: null,
  appleId: null,
  facebookId: null,
  extraDetails: {
    // If updated:
    // Update the User model default value
    // AND update all existing users

    preferences: {
      // .......
    },
  },
  settings: {
    verifyEmail: null,
    emailVerified: false,
    emailChanged: Date.now(),
    resentEmailLast: null,
    forgotPassword: { tempCode: null, validUntil: null },
  },
  premiumSubscription: {
    service: "stripe", // stripe, apple, google

    stripe: {
      customerId: "",
      subscriptionId: "",
    },

    apple: {},
    google: {},
  },

  sites: [],

  // End necessary info from database

  // Only local not in live db

  disclaimers: {
    // by default start as true
    progress: true, // Initial progress page showing disclaimer
    aiScan: true, // when click ai
    profileImg: true,
  },
  missedHttpResponses: [], // [{endpoint, data}];
};

export const TestUsers = [USER];

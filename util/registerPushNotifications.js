import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { DOMAIN } from "../constants/ServerConstants";

export async function registerPushNotifications({
  jsonWebToken,
  currentTokens,
  active = true,
}) {
  // Hard stop if we are in Expo Go on Android or not on a physical device
  if (
    !Device.isDevice ||
    Constants.executionEnvironment === "storeClient" ||
    !Notifications
  ) {
    return null;
  }

  let Notifications;
  try {
    // Only require expo-notifications dynamically when we know we are safe (iOS or Dev Build)
    Notifications = require("expo-notifications");
  } catch (e) {
    console.log("Notifications module could not be loaded.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (
    active &&
    currentTokens?.some((t) => t.token === token && t.active === true)
  )
    return; // Already registered this token with server, no need to send again

  console.log("Registering token: status: ", active, token);

  // Send this token to your backend via a POST request
  await fetch(DOMAIN + "/save-push-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pushToken: token,
      deviceInfo: Device.modelName,
      jsonWebToken,
      active,
    }),
  });

  return token;
}

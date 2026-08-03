import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { DOMAIN } from '../constants/ServerConstants';
import { Platform } from 'react-native';

export async function registerPushNotifications({jsonWebToken, currentTokens, active=true}) {
  if (!Device.isDevice) return; // Only works on real hardware

  if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (active && currentTokens?.some(t => t.token === token && t.active === true)) return; // Already registered this token with server, no need to send again

  console.log('Registering token: status: ', active, token);

  // Send this token to your backend via a POST request
  await fetch(DOMAIN + '/save-push-token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pushToken: token, deviceInfo: Device.modelName, jsonWebToken, active}),
  });

  return token;
}
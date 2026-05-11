import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

let cached: Expo | undefined;
function client() {
  if (!cached) cached = new Expo();
  return cached;
}

export async function sendPush(message: ExpoPushMessage) {
  const expo = client();
  if (!Array.isArray(message.to) && !Expo.isExpoPushToken(message.to)) {
    throw new Error(`Invalid Expo push token: ${message.to}`);
  }
  const chunks = expo.chunkPushNotifications([message]);
  const tickets = [];
  for (const chunk of chunks) {
    tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
  }
  return tickets;
}

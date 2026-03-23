import notifee, { AndroidImportance } from '@notifee/react-native';
import { 
  getMessaging, 
  onMessage, 
  getToken, 
  onTokenRefresh, 
  requestPermission, 
  registerDeviceForRemoteMessages, 
  AuthorizationStatus,
  FirebaseMessagingTypes 
} from '@react-native-firebase/messaging';
import { api } from './api';

let channelReady = false;

const ensureAndroidChannel = async () => {
  if (channelReady) {
    return;
  }

  await notifee.createChannel({
    id: 'unibuddy-default',
    name: 'UniBuddy Notifications',
    importance: AndroidImportance.HIGH,
  });
  channelReady = true;
};

export const displayDeviceNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  await ensureAndroidChannel();
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'unibuddy-default',
      pressAction: { id: 'default' },
    },
  });
};

export const displayNotificationFromRemoteMessage = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) => {
  const title = remoteMessage.notification?.title ?? 'UniBuddy Update';
  const body = remoteMessage.notification?.body ?? 'You have a new update.';
  await displayDeviceNotification(title, body, remoteMessage.data);
};

export const setupForegroundMessageListener = () => {
  return onMessage(getMessaging(), async remoteMessage => {
    await displayNotificationFromRemoteMessage(remoteMessage);
  });
};

export const registerFcmTokenForUser = async (universityId: string) => {
  if (!universityId) {
    return;
  }

  const messaging = getMessaging();
  await registerDeviceForRemoteMessages(messaging);
  const authStatus = await requestPermission(messaging);
  const isAuthorized =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (!isAuthorized) {
    return;
  }

  const token = await getToken(messaging);
  if (!token) {
    return;
  }

  await api.put(`/users/${universityId}/fcm-token`, { fcmToken: token });
};

export const subscribeToTokenRefresh = (universityId: string) => {
  return onTokenRefresh(getMessaging(), async token => {
    if (!universityId || !token) {
      return;
    }
    await api.put(`/users/${universityId}/fcm-token`, { fcmToken: token });
  });
};

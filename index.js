/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { displayNotificationFromRemoteMessage } from './src/services/notifications';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  await displayNotificationFromRemoteMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

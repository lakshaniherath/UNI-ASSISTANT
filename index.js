/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { displayNotificationFromRemoteMessage } from './src/services/notifications';

// 🚀 1. Background Message Handler
// ඇප් එක සම්පූර්ණයෙන්ම වසා තිබියදී පණිවිඩ ලැබීමට මෙය අත්‍යවශ්‍ය වේ.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  await displayNotificationFromRemoteMessage(remoteMessage);
});

// 🚀 2. Pre-create Notification Channel (Android Only)
// Android 8.0+ සඳහා channel එක කලින් නිර්මාණය කර තිබීමෙන් notification එකක් එනවිට ඇතිවන ප්‍රමාදය වළකී.
const bootstrap = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }
};

bootstrap();

AppRegistry.registerComponent(appName, () => App);
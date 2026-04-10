import 'react-native-gesture-handler'; 
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupForegroundMessageListener } from './src/services/notifications';

import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen, { ONBOARDING_KEY } from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import StudyGroupScreen from './src/screens/StudyGroupScreen'; 
import CreateGroupScreen from './src/screens/CreateGroupScreen'; 
// 🚀 1. Profile Setup Screen එක Import කරන්න
import ProfileSetupScreen from './src/screens/ProfileSetupScreen'; 
// 🚀 2. Request Management Screen Import කරන්න
import RequestManagementScreen from './src/screens/RequestManagementScreen';
// 🚀 3. Group Details Screen Import කරන්න
import GroupDetailsScreen from './src/screens/GroupDetailsScreen';
import TimetableScreen from './src/screens/timetable/TimetableScreen';
import RecoveryResultsScreen from './src/screens/timetable/RecoveryResultsScreen';
import ReminderSettingsScreen from './src/screens/timetable/ReminderSettingsScreen';
import TaskTrackerScreen from './src/screens/timetable/TaskTrackerScreen';
import AddPersonalEventScreen from './src/screens/timetable/AddPersonalEventScreen';
import AcademicDashboardScreen from './src/screens/AcademicDashboardScreen';
import PeerSupportScreen from './src/screens/PeerSupportScreen';
import ForumModuleSelectionScreen from './src/screens/ForumModuleSelectionScreen';
import AcademicForumScreen from './src/screens/AcademicForumScreen';
import CreateQuestionScreen from './src/screens/CreateQuestionScreen';
import QuestionDetailScreen from './src/screens/QuestionDetailScreen';
import ResourceModuleSelectionScreen from './src/screens/ResourceModuleSelectionScreen';
import ResourceHubScreen from './src/screens/ResourceHubScreen';
import UploadResourceScreen from './src/screens/UploadResourceScreen';
import CampusEventHubScreen from './src/screens/events/CampusEventHubScreen';
import CreateEventScreen from './src/screens/events/CreateEventScreen';
import EventDetailScreen from './src/screens/events/EventDetailScreen';
import { appTheme } from './src/theme/appTheme';

const Stack = createStackNavigator();

const loadingContainerStyle = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const appBackgroundImage = require('./assets/com.png');

const App = () => {
  const [initialRouteName, setInitialRouteName] = useState<string | null>(null);

  useEffect(() => {
    // Listen for FCM messages while the app is in the foreground
    const unsubscribe = setupForegroundMessageListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const resolveInitialRoute = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      setInitialRouteName(seen === 'true' ? 'Login' : 'Onboarding');
    };

    resolveInitialRoute();
  }, []);

  if (!initialRouteName) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ImageBackground
          source={appBackgroundImage}
          style={styles.background}
          imageStyle={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={6}
        >
          <View style={styles.overlay} />
          <View style={[loadingContainerStyle, styles.content]}>
            <ActivityIndicator size="large" color={appTheme.colors.accent} />
          </View>
        </ImageBackground>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={appBackgroundImage}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={6}
      >
        <View style={styles.overlay} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
              headerStyle: {
                backgroundColor: appTheme.colors.bg,
              },
              headerTintColor: appTheme.colors.textPrimary,
              headerTitleStyle: {
                fontWeight: '700',
              },
              headerShadowVisible: false,
              cardStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >

          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Create Account' }} 
          />

          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Uni-Assistant Dashboard',
              headerLeft: () => null 
            }} 
          />

          <Stack.Screen 
            name="StudyGroups" 
            component={StudyGroupScreen} 
            options={{ title: 'Explore Study Groups' }} 
          />

          <Stack.Screen 
            name="CreateGroup" 
            component={CreateGroupScreen} 
            options={{ title: 'Start a Project Group' }} 
          />

          {/* 🚀 2. Profile Setup Screen එක Register කළා */}
          <Stack.Screen 
            name="ProfileSetup" 
            component={ProfileSetupScreen} 
            options={{ title: 'My Skill Profile' }} 
          />

          {/* 🚀 3. Request Management Screen - Group Leaders සඳහා */}
          <Stack.Screen 
            name="RequestManagement" 
            component={RequestManagementScreen} 
            options={{ title: 'Manage Join Requests' }} 
          />

          {/* 🚀 4. Group Details Screen - Members & Leader Management */}
          <Stack.Screen 
            name="GroupDetails" 
            component={GroupDetailsScreen} 
            options={{ title: 'Group Details' }} 
          />

          <Stack.Screen
            name="Timetable"
            component={TimetableScreen}
            options={{ title: 'Smart Timetable' }}
          />
          <Stack.Screen
            name="RecoveryResults"
            component={RecoveryResultsScreen}
            options={{ title: 'Recovery Suggestions' }}
          />
          <Stack.Screen
            name="ReminderSettings"
            component={ReminderSettingsScreen}
            options={{ title: 'Reminder Settings' }}
          />
          <Stack.Screen
            name="TaskTracker"
            component={TaskTrackerScreen}
            options={{ title: 'Task Tracker' }}
          />
          <Stack.Screen
            name="AddPersonalEvent"
            component={AddPersonalEventScreen}
            options={{ title: 'Personal Events' }}
          />

          <Stack.Screen
            name="AcademicDashboard"
            component={AcademicDashboardScreen}
            options={{ title: 'Academic Dashboard' }}
          />
          <Stack.Screen
            name="PeerSupport"
            component={PeerSupportScreen}
            options={{ title: 'Peer Support' }}
          />
          <Stack.Screen
            name="ForumModuleSelection"
            component={ForumModuleSelectionScreen}
            options={{ title: 'Forum Modules' }}
          />
          <Stack.Screen
            name="AcademicForum"
            component={AcademicForumScreen}
            options={{ title: 'Academic Forum' }}
          />
          <Stack.Screen
            name="CreateQuestion"
            component={CreateQuestionScreen}
            options={{ title: 'Create Question' }}
          />
          <Stack.Screen
            name="QuestionDetail"
            component={QuestionDetailScreen}
            options={{ title: 'Question Details' }}
          />
          <Stack.Screen
            name="ResourceModuleSelection"
            component={ResourceModuleSelectionScreen}
            options={{ title: 'Resource Modules' }}
          />
          <Stack.Screen
            name="ResourceHub"
            component={ResourceHubScreen}
            options={{ title: 'Resource Hub' }}
          />
          <Stack.Screen
            name="UploadResource"
            component={UploadResourceScreen}
            options={{ title: 'Upload Resource' }}
          />
          <Stack.Screen
            name="CampusEventHub"
            component={CampusEventHubScreen}
            options={{ title: 'Campus Events' }}
          />
          <Stack.Screen
            name="CreateEventScreen"
            component={CreateEventScreen}
            options={{ title: 'Create Event' }}
          />
          <Stack.Screen
            name="EventDetailScreen"
            component={EventDetailScreen}
            options={{ title: 'Event Details' }}
          />

          </Stack.Navigator>
        </NavigationContainer>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.96,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 17, 31, 0.58)',
  },
  content: {
    flex: 1,
  },
});

import 'react-native-gesture-handler'; 
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { setupForegroundMessageListener } from './src/services/notifications';

import LoginScreen from './src/screens/LoginScreen';
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

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Listen for FCM messages while the app is in the foreground
    const unsubscribe = setupForegroundMessageListener();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          
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

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

import 'react-native-gesture-handler'; 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import StudyGroupScreen from './src/screens/StudyGroupScreen'; 
import CreateGroupScreen from './src/screens/CreateGroupScreen'; 
// 🚀 1. Profile Setup Screen එක Import කරන්න
import ProfileSetupScreen from './src/screens/ProfileSetupScreen'; 
// 🚀 2. Request Management Screen Import කරන්න
import RequestManagementScreen from './src/screens/RequestManagementScreen';

const Stack = createStackNavigator();

const App = () => {
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

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
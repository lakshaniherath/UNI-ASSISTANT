import 'react-native-gesture-handler'; 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Screens tika import karagamu
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // Aluth register screen eka

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          
          {/* Login Screen */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />

          {/* Register Screen */}
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Create Account' }} 
          />

          {/* Home Screen (Dashboard) */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Uni-Assistant Dashboard',
              headerLeft: () => null // Dashboard ekedi aye login ekata back wenna bari wenna
            }} 
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
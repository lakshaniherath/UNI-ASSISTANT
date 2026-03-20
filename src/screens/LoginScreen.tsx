import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { api, testBackendConnection } from '../services/api';
import { registerFcmTokenForUser } from '../services/notifications';
import { appTheme } from '../theme/appTheme';

const logoSource = require('../../assets/app-logo-source.png');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Backend එකට request එක යවනවා
      const response = await api.post('/users/login', {
        email: email,
        password: password
      });

      // Backend එකෙන් සාර්ථකව (Status 200) User object එක ලැබුණා නම්
      if (response.status === 200 && response.data) {
        const loggedInUser = response.data;
        // Register FCM token in the background (don't block navigation)
        registerFcmTokenForUser(loggedInUser.universityId).catch(err =>
          console.warn('FCM token registration failed:', err)
        );
        Alert.alert('Success! 🎉', `Welcome back, ${loggedInUser.name}`, [
          { 
            text: 'OK', 
            // Home screen එකට යද්දී Login එක stack එකෙන් ඉවත් කරනවා (back press කළාම logout නොවන්න)
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home', params: { userData: loggedInUser } }],
            })
          }
        ]);
      }
    } catch (error: any) {
      console.error('Login Error:', error?.message || error);
      
      // 401 Error එකක් ආවොත් ඒ කියන්නේ email/password වැරදියි
      if (error?.response?.status === 401) {
        Alert.alert('Login Failed ❌', 'Invalid email or password.');
      } else if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
        // Network Timeout
        Alert.alert('Connection Timeout', 'Backend එක ඈතිගිය. නැවතත් උත්සාහ කරන්න.');
      } else if (!error?.response) {
        // Network error - Backend එක ගිහින් නැත
        Alert.alert('Connection Error', 'Backend එක ගිහින් නැත. Firewall එක check කරන්න. localhost:8080 ය running?');
      } else {
        // වෙනත් Server error එකක් ආවොත්
        Alert.alert('Server Error', `Error: ${error?.response?.status || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.heroCard}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your UniBuddy flow</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="SLIIT Email (e.g. IT23658790@my.sliit.lk)"
          placeholderTextColor={appTheme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={appTheme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={async () => {
            const result = await testBackendConnection();
            if (result.connected) {
              Alert.alert('✅ Success', 'Backend එක reachable ය!');
            } else {
              Alert.alert('❌ Connection Failed', result.hint);
            }
          }}
        >
          <Text style={styles.testButtonText}>Test Backend Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: appTheme.colors.bg },
  glowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: appTheme.colors.overlayOrange,
  },
  heroCard: {
    backgroundColor: appTheme.colors.card,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  logo: { width: 180, height: 140, marginBottom: 4 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: appTheme.colors.textDark, marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: appTheme.colors.textDarkSoft },
  formCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: appTheme.colors.chipBorder,
  },
  input: { backgroundColor: appTheme.colors.inputBg, borderWidth: 1, borderColor: appTheme.colors.inputBorder, padding: 15, borderRadius: 14, marginBottom: 15, fontSize: 16, color: appTheme.colors.textDark },
  button: { backgroundColor: appTheme.colors.primary, padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  testButton: { backgroundColor: appTheme.colors.surfaceSoft, padding: 12, borderRadius: 14, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: appTheme.colors.chipBorder },
  testButtonText: { color: appTheme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  linkText: { color: appTheme.colors.accent, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '600' }
});

export default LoginScreen;

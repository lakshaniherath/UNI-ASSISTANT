import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { api, testBackendConnection } from '../services/api'; 

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

        Alert.alert('Success! 🎉', `Welcome back, ${loggedInUser.name}`, [
          { 
            text: 'OK', 
            // Home screen එකට යද්දී user ගේ data ටිකත් එක්කම යවනවා
            onPress: () => navigation.navigate('Home', { userData: loggedInUser }) 
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
      <Text style={styles.title}>Uni-Assistant</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="SLIIT Email (e.g. IT23658790@my.sliit.lk)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
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
        <Text style={styles.testButtonText}>🧪 Test Backend Connection</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#102A43', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#627D98', marginBottom: 30 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9E2EC', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#1864AB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  testButton: { backgroundColor: '#999', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  testButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  linkText: { color: '#1864AB', textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '500' }
});

export default LoginScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { api } from '../services/api'; // Api file eka import kara

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state eka

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Backend ekata POST request eka yawamu
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      // Backend eken ena String response eka check karamu
      if (response.data.includes('Successful')) {
        Alert.alert('Success! 🎉', response.data);
        // Issarahata methana idan Home/Dashboard ekata navigate karanawa
      } else {
        Alert.alert('Login Failed ❌', response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Backend eka on da kiyala check karanna.');
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#102A43', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#627D98', marginBottom: 30 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9E2EC', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#1864AB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default LoginScreen;
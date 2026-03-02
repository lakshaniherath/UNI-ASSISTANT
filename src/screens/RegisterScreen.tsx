import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../services/api';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    universityId: '',
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic Validation
    if (!formData.universityId || !formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all fields before registering.');
      return;
    }

    setLoading(true);
    try {
      // UserControllerRequestMapping eka "/api/users" nisa path eka mehema wenawa
      const response = await api.post('/users/register', formData);
      
      if (response.data) {
        Alert.alert('Success! 🎉', 'Your account has been created. You can now login.', [
          { text: 'Login Now', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed ❌', 'Check if the University ID or Email is already registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join Uni-Assistant</Text>
      <Text style={styles.subtitle}>Create an account to manage your studies</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="University ID (e.g. IT23658790)" 
        onChangeText={(txt) => setFormData({...formData, universityId: txt})} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Full Name" 
        onChangeText={(txt) => setFormData({...formData, name: txt})} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="SLIIT Email" 
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(txt) => setFormData({...formData, email: txt})} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={(txt) => setFormData({...formData, password: txt})} 
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 30, justifyContent: 'center', flexGrow: 1, backgroundColor: '#F5F7FA' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#102A43', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#627D98', marginBottom: 30 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D9E2EC' },
  button: { backgroundColor: '#1864AB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#1864AB', textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '500' }
});

export default RegisterScreen;
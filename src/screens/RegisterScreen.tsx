import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // 🚀 Picker එක Import කළා
import { api } from '../services/api';
import { appTheme } from '../theme/appTheme';

const logoSource = require('../../assets/app-logo-source.png');

const RegisterScreen = ({ navigation }: any) => {
  // විශ්වවිද්‍යාලය ලබා දී ඇති නිවැරදි Subgroups ලැයිස්තුව
  const subgroups = [
    "Y3.S1.WD.IT.0101", "Y3.S1.WD.IT.0102",
    "Y3.S1.WD.IT.0201", "Y3.S1.WD.IT.0202",
    "Y3.S1.WD.IT.0301", "Y3.S1.WD.IT.0302", "Y3.S1.WD.IT.0303",
    "Y3.S1.WE.IT.0101", "Y3.S1.WE.IT.0102",
    "Y3.S1.WE.IT.0201", "Y3.S1.WE.IT.0202",
    "Y3.S1.WE.IT.0301", "Y3.S1.WE.IT.0302",
    "Y3.S1.WE.IT.0401", "Y3.S1.WE.IT.0402"
  ];

  const [formData, setFormData] = useState({
    universityId: '',
    name: '',
    email: '',
    password: '',
    subgroup: '', 
    role: 'STUDENT'
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.universityId || !formData.name || !formData.email || !formData.password || !formData.subgroup) {
      Alert.alert('Validation Required', 'All required information and the subgroup must be provided.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/register', formData);
      
      if (response.data) {
        Alert.alert('Registration Successful', 'Your account has been created. You can now log in.', [
          { text: 'Login Now', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed', 'The provided University ID or Email is already registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Join UniBuddy</Text>
        <Text style={styles.subtitle}>Create an account to manage your studies</Text>
      </View>
      
      <View style={styles.formCard}>
      
      <TextInput 
        style={styles.input} 
        placeholder="University ID (e.g. IT23658790)" 
        placeholderTextColor={appTheme.colors.textMuted}
        onChangeText={(txt) => setFormData({...formData, universityId: txt})} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Full Name" 
        placeholderTextColor={appTheme.colors.textMuted}
        onChangeText={(txt) => setFormData({...formData, name: txt})} 
      />

      {/* 🚀 Subgroup තෝරා ගැනීමට Dropdown (Picker) එක */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Your Subgroup:</Text>
        <Picker
          selectedValue={formData.subgroup}
          onValueChange={(itemValue) => setFormData({...formData, subgroup: itemValue})}
          style={styles.picker}
        >
          <Picker.Item label="-- Choose Subgroup --" value="" color="#999" />
          {subgroups.map((sg) => (
            <Picker.Item key={sg} label={sg} value={sg} />
          ))}
        </Picker>
      </View>
      
      <TextInput 
        style={styles.input} 
        placeholder="SLIIT Email" 
        placeholderTextColor={appTheme.colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(txt) => setFormData({...formData, email: txt})} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor={appTheme.colors.textMuted}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, justifyContent: 'center', flexGrow: 1, backgroundColor: appTheme.colors.bg },
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
  logo: { width: 170, height: 130, marginBottom: 6 },
  formCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: appTheme.colors.chipBorder,
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: appTheme.colors.textDark, marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: appTheme.colors.textDarkSoft, marginBottom: 8 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 14, marginBottom: 15, borderWidth: 1, borderColor: appTheme.colors.inputBorder, fontSize: 16, color: appTheme.colors.textDark },
  // 🚀 Picker එක සඳහා අලුත් Styles
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: appTheme.colors.inputBorder,
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  label: { fontSize: 12, color: appTheme.colors.textDarkSoft, marginTop: 8, marginLeft: 5 },
  picker: { height: 55, width: '100%', color: appTheme.colors.textDark },
  button: { backgroundColor: appTheme.colors.primary, padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: appTheme.colors.accent, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '600' }
});

export default RegisterScreen;

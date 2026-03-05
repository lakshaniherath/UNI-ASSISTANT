import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // 🚀 Picker එක Import කළා
import { api } from '../services/api';

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
      Alert.alert('Error', 'සියලුම තොරතුරු සහ Subgroup එක ඇතුළත් කිරීම අනිවාර්යයි.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/register', formData);
      
      if (response.data) {
        Alert.alert('Success! 🎉', 'ගිණුම සාර්ථකව සැකසූවා. දැන් ඔබට ලොග් විය හැක.', [
          { text: 'Login Now', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed ❌', 'University ID එක හෝ Email එක දැනටමත් භාවිතයේ පවතී.');
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
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D9E2EC', fontSize: 16 },
  // 🚀 Picker එක සඳහා අලුත් Styles
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  label: { fontSize: 12, color: '#627D98', marginTop: 8, marginLeft: 5 },
  picker: { height: 55, width: '100%' },
  button: { backgroundColor: '#1864AB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#1864AB', textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '500' }
});

export default RegisterScreen;
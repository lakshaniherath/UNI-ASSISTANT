import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// මෙතනට 'route' කියන parameter එක එකතු කළා
const HomeScreen = ({ route, navigation }: any) => {
  
  // LoginScreen එකෙන් එවපු user ගේ details ටික අල්ලගන්නවා
  const { userData } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Hardcode කරපු නම වෙනුවට දැන් ලොග් වෙන කෙනාගේ නම පෙන්නනවා */}
        <Text style={styles.welcomeText}>
          Hello, {userData ? userData.name.split(' ')[0] : 'Student'}! 👋
        </Text>
        <Text style={styles.subtitle}>Welcome to Uni-Assistant</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardTitle}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardEmoji}>📊</Text>
          <Text style={styles.cardTitle}>GPA Tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardEmoji}>📝</Text>
          <Text style={styles.cardTitle}>Assignments</Text>
        </TouchableOpacity>

        {/* Logout වෙද්දී ආයෙත් Login එකට යනවා */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.cardEmoji}>🚪</Text>
          <Text style={styles.cardTitle}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 30, backgroundColor: '#1864AB', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#D0EBFF', marginTop: 5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardEmoji: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#334E68' },
});

export default HomeScreen;
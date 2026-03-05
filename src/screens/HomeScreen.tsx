import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const HomeScreen = ({ route, navigation }: any) => {
  
  const { userData } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Hello, {userData ? userData.name.split(' ')[0] : 'Student'}! 👋
        </Text>
        <Text style={styles.subtitle}>
          {userData?.subgroup || 'Subgroup not set'} | Uni-Assistant
        </Text>
      </View>

      <View style={styles.menuGrid}>
        {/* 🚀 1. අලුතින් එකතු කළ Profile Setup Card එක */}
        <TouchableOpacity 
          style={[styles.card, styles.profileCard]} 
          onPress={() => navigation.navigate('ProfileSetup', { userData })}
        >
          <Text style={styles.cardEmoji}>👤</Text>
          <Text style={[styles.cardTitle, styles.profileTitle]}>Update Profile</Text>
          <Text style={styles.profileSub}>Set Skills & CGPA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StudyGroups', { userData })}>
          <Text style={styles.cardEmoji}>🤝</Text>
          <Text style={styles.cardTitle}>Study Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timetable')}>
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardTitle}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GPATracker')}>
          <Text style={styles.cardEmoji}>📊</Text>
          <Text style={styles.cardTitle}>GPA Tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CampusEvents')}>
          <Text style={styles.cardEmoji}>🏛️</Text>
          <Text style={styles.cardTitle}>Events Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Assignments')}>
          <Text style={styles.cardEmoji}>📝</Text>
          <Text style={styles.cardTitle}>Assignments</Text>
        </TouchableOpacity>

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
  subtitle: { fontSize: 14, color: '#D0EBFF', marginTop: 5 },
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
  // 🎨 Profile Card එක කැපී පෙනෙන්න අලුත් styles
  profileCard: { borderColor: '#1864AB', borderWidth: 1 },
  profileTitle: { color: '#1864AB' },
  profileSub: { fontSize: 10, color: '#627D98', marginTop: 4 },
  
  cardEmoji: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#334E68' },
});

export default HomeScreen;
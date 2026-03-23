import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { subscribeToTokenRefresh } from '../services/notifications';
import { appTheme } from '../theme/appTheme';

const HomeScreen = ({ route, navigation }: any) => {
  
  const { userData } = route.params || {};

  useEffect(() => {
    if (!userData?.universityId) return;
    // Keep the FCM token fresh as long as the user is logged in
    const unsubscribe = subscribeToTokenRefresh(userData.universityId);
    return unsubscribe;
  }, [userData?.universityId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Hello, {userData ? userData.name.split(' ')[0] : 'Student'}!
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
          <Text style={[styles.cardTitle, styles.profileTitle]}>Update Profile</Text>
          <Text style={styles.profileSub}>Set Skills & CGPA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StudyGroups', { userData })}>
          <Text style={styles.cardTitle}>Study Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timetable', { userData })}>
          <Text style={styles.cardTitle}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TaskTracker', { userData })}>
          <Text style={styles.cardTitle}>Task Tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ReminderSettings', { userData })}>
          <Text style={styles.cardTitle}>Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddPersonalEvent', { userData })}>
          <Text style={styles.cardTitle}>Personal Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.cardTitle}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  header: {
    margin: 16,
    padding: 24,
    backgroundColor: appTheme.colors.primaryStrong,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2A5A8D',
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: appTheme.colors.textPrimary },
  subtitle: { fontSize: 14, color: appTheme.colors.textSecondary, marginTop: 5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 20, justifyContent: 'space-between' },
  card: {
    backgroundColor: appTheme.colors.card,
    width: '47%',
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  // 🎨 Profile Card එක කැපී පෙනෙන්න අලුත් styles
  profileCard: { borderColor: appTheme.colors.accent, borderWidth: 1.5 },
  profileTitle: { color: appTheme.colors.primary },
  profileSub: { fontSize: 10, color: appTheme.colors.textDarkSoft, marginTop: 4 },
  
  cardTitle: { fontSize: 16, fontWeight: '600', color: appTheme.colors.textDark },
});

export default HomeScreen;

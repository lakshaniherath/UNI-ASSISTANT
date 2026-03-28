import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { campusEventApi } from '../../services/api';
import { appTheme } from '../../theme/appTheme';

const EventDetailScreen = ({ route, navigation }: any) => {
  const { event, currentUserId, isAdmin } = route.params;

  const [isGoing, setIsGoing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await campusEventApi.getRegistrationStatus(event.id, currentUserId);
      setIsGoing(res.data);
    } catch (e) {
      console.log('Error fetching status:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [event.id])
  );

  const toggleGoing = async () => {
    try {
      if (isGoing) {
        await campusEventApi.unmarkAsGoing(event.id, currentUserId);
        setIsGoing(false);
        Alert.alert('Status Updated', 'You are no longer marked as going.');
      } else {
        await campusEventApi.markAsGoing(event.id, currentUserId);
        setIsGoing(true);
        Alert.alert('Status Updated', 'You are marked as going! You will receive a reminder 24h before.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to update status.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await campusEventApi.deleteEvent(event.id);
            Alert.alert('Deleted', 'Event has been deleted.');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', 'Unable to delete event.');
          }
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: event.type === 'CAREER_FAIR' ? appTheme.colors.accent : appTheme.colors.primary }]}>
            <Text style={styles.badgeText}>{event.type === 'CAREER_FAIR' ? 'Career Fair' : 'University Event'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.detailText}>📅 Date: {event.eventDate}</Text>
        <Text style={styles.detailText}>🕒 Time: {event.startTime} - {event.endTime}</Text>
        <Text style={styles.detailText}>📍 Location: {event.location}</Text>
        <Text style={styles.detailText}>👩‍💼 Organizer: {event.organizerName}</Text>
        <Text style={styles.detailText}>👥 Going: {event.attendeesCount} people</Text>
      </View>

      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.goingBtn, isGoing ? styles.goingBtnActive : styles.goingBtnInactive]} 
          onPress={toggleGoing}
        >
          <Text style={[isGoing ? styles.goingTextActive : styles.goingTextInactive]}>
            {isGoing ? '✅ Going' : 'Mark as Going'}
          </Text>
        </TouchableOpacity>
        
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('CreateEventScreen', { event, currentUserId })}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: appTheme.colors.textDark, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3, marginBottom: 25 },
  detailText: { fontSize: 16, color: '#333', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: appTheme.colors.textDark, marginBottom: 10 },
  description: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 30 },
  actions: { flex: 1, marginTop: 10, marginBottom: 40 },
  goingBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: appTheme.colors.primary },
  goingBtnInactive: { backgroundColor: '#fff' },
  goingBtnActive: { backgroundColor: appTheme.colors.primary },
  goingTextInactive: { color: appTheme.colors.primary, fontSize: 18, fontWeight: 'bold' },
  goingTextActive: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  adminActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  editBtn: { flex: 1, backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#ffebe6', padding: 15, borderRadius: 8, alignItems: 'center' },
  editBtnText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  deleteBtnText: { color: 'red', fontWeight: 'bold', fontSize: 16 }
});

export default EventDetailScreen;

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { campusEventApi } from '../../services/api';
import { appTheme } from '../../theme/appTheme';

const CampusEventHubScreen = ({ route, navigation }: any) => {
  const { currentUserId, role } = route.params;
  const isAdmin = role === 'ADMIN';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await campusEventApi.getAllEvents();
      setEvents(res.data);
    } catch (error) {
      console.log('Error fetching events:', error);
      Alert.alert('Error', 'Unable to fetch campus events.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Downloading', 'Generating Monthly Calendar PDF...');
      await campusEventApi.downloadReport();
      // Normally here you'd use RNFS or similar to stream the blob to local disk
      Alert.alert('Success', 'Report Downloaded! (Stubbed for demo)');
    } catch (e) {
      Alert.alert('Error', 'Unable to download report.');
    }
  };

  const markedDates = events.reduce((acc, ev) => {
    acc[ev.eventDate] = { marked: true, dotColor: ev.type === 'CAREER_FAIR' ? appTheme.colors.accent : appTheme.colors.primary };
    return acc;
  }, {} as any);

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: appTheme.colors.primary,
    };
  }

  const selectedEvents = events.filter(e => e.eventDate === selectedDate);
  const displayEvents = selectedDate ? selectedEvents : events;

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color={appTheme.colors.primary} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Event Hub</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF} activeOpacity={0.7}>
          <Text style={styles.downloadText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <Animatable.View animation="fadeInDown" duration={600} style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: appTheme.colors.primary,
            todayTextColor: appTheme.colors.accent,
            arrowColor: appTheme.colors.primary,
          }}
        />
        {selectedDate ? (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedDate('')} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>Show All Events</Text>
          </TouchableOpacity>
        ) : null}
      </Animatable.View>

      <Text style={styles.sectionTitle}>
        {selectedDate ? `Events on ${selectedDate}` : 'Upcoming Events'}
      </Text>

      {displayEvents.length === 0 ? (
        <Text style={styles.emptyText}>No events to display.</Text>
      ) : (
        displayEvents.map((ev, idx) => (
          <Animatable.View key={idx} animation="slideInRight" delay={idx * 100} duration={500}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetailScreen', { event: ev, currentUserId, isAdmin })}
            >
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <View style={[styles.badge, { backgroundColor: ev.type === 'CAREER_FAIR' ? appTheme.colors.accent : appTheme.colors.primary }]}>
                  <Text style={styles.badgeText}>{ev.type === 'CAREER_FAIR' ? 'Career' : 'University'}</Text>
                </View>
              </View>
              <Text style={styles.eventInfo}>{ev.eventDate}  |  {ev.startTime} - {ev.endTime}</Text>
              <Text style={styles.eventInfo}>{ev.location}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))
      )}

      {isAdmin && (
        <Animatable.View animation="zoomIn" delay={600} style={styles.fabContainer}>
          <TouchableOpacity 
            style={styles.fab} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateEventScreen', { currentUserId })}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: appTheme.colors.textDark },
  downloadBtn: { backgroundColor: '#eee', padding: 8, borderRadius: 8 },
  downloadText: { fontSize: 16, color: appTheme.colors.textDark, fontWeight: 'bold' },
  calendarContainer: { backgroundColor: appTheme.colors.glassStrong, borderRadius: 12, padding: 5, marginBottom: 20, elevation: 2 },
  clearBtn: { padding: 10, alignItems: 'center' },
  clearBtnText: { color: appTheme.colors.primary, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: appTheme.colors.textDark },
  emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 20 },
  eventCard: { backgroundColor: appTheme.colors.glassStrong, padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  eventTitle: { fontSize: 18, fontWeight: 'bold',flex: 1, color: appTheme.colors.textDark },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  eventInfo: { fontSize: 14, color: '#666', marginBottom: 5 },
  fabContainer: { position: 'absolute', bottom: 30, right: 20 },
  fab: { backgroundColor: appTheme.colors.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' }
});

export default CampusEventHubScreen;

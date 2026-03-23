import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EventDetailModal from '../../components/timetable/EventDetailModal';
import {
  fetchTimetable,
  getReminderPreferences,
  ReminderPreference,
  TimetableEvent,
} from '../../services/timetableService';
import { clearScheduledReminders, scheduleClassRemindersForNextWeek } from '../../services/reminderScheduler';
import { appTheme } from '../../theme/appTheme';

const DAY_TABS = ['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TYPE_TABS = ['ALL', 'LECTURE', 'TUTORIAL', 'PRACTICAL'];

const TimetableScreen = ({ route, navigation }: any) => {
  const { userData } = route.params;
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showOnlyHall, setShowOnlyHall] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimetableEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  const subgroup = userData?.subgroup;

  const load = useCallback(async () => {
    if (!subgroup) {
      Alert.alert('Profile Required', 'Please set your subgroup first.');
      return;
    }

    try {
      setLoading(true);
      const [table, prefs] = await Promise.all([
        fetchTimetable(subgroup),
        getReminderPreferences(userData.universityId),
      ]);
      setEvents(table);
      await clearScheduledReminders();
      await scheduleClassRemindersForNextWeek(table, prefs as ReminderPreference);
    } catch {
      Alert.alert('Error', 'Could not load timetable.');
    } finally {
      setLoading(false);
    }
  }, [subgroup, userData.universityId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return events.filter(e => {
      const dayOk = selectedDay === 'ALL' || e.dayOfWeek === selectedDay;
      const typeOk = selectedType === 'ALL' || e.activityType === selectedType;
      const hallOk = !showOnlyHall || !e.location?.toLowerCase().includes('online');
      if (!dayOk || !typeOk || !hallOk) return false;
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [events, selectedDay, selectedType, showOnlyHall]);

  const openEvent = (event: TimetableEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <Text style={styles.title}>Smart Timetable</Text>
      <Text style={styles.subtitle}>Subgroup: {subgroup}</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate('ReminderSettings', { userData })}
        >
          <Text style={styles.quickText}>Reminder Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate('TaskTracker', { userData })}
        >
          <Text style={styles.quickText}>Task Tracker</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.personalBtn}
        onPress={() => navigation.navigate('AddPersonalEvent', { userData })}
      >
        <Text style={styles.personalBtnText}>Personal Events</Text>
      </TouchableOpacity>

      <View style={styles.chipContainer}>
        {DAY_TABS.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.tab, selectedDay === item && styles.tabActive]}
            onPress={() => setSelectedDay(item)}
          >
            <Text style={[styles.tabText, selectedDay === item && styles.tabTextActive]}>
              {item.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chipContainer}>
        {TYPE_TABS.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.tab, selectedType === item && styles.tabActive]}
            onPress={() => setSelectedType(item)}
          >
            <Text style={[styles.tabText, selectedType === item && styles.tabTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Show hall classes only</Text>
        <Switch
          value={showOnlyHall}
          onValueChange={setShowOnlyHall}
          trackColor={{ false: '#3D536B', true: '#295A89' }}
          thumbColor={showOnlyHall ? appTheme.colors.accent : '#f4f3f4'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={appTheme.colors.accent} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : String(index))}
          ListEmptyComponent={<Text style={styles.empty}>No classes found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openEvent(item)}>
              <View style={styles.rowBetween}>
                <Text style={styles.code}>{item.moduleCode || 'UNKNOWN'}</Text>
                <Text style={styles.type}>{item.activityType}</Text>
              </View>
              <Text style={styles.name}>{item.moduleName || item.mainGroup}</Text>
              <Text style={styles.meta}>
                {item.dayOfWeek} {item.startTime}-{item.endTime}
              </Text>
              <Text style={styles.meta}>Location: {item.location || 'N/A'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <EventDetailModal
        visible={showModal}
        event={selectedEvent}
        onClose={() => setShowModal(false)}
        onFindAlternative={() => {
          if (!selectedEvent) return;
          setShowModal(false);
          navigation.navigate('RecoveryResults', {
            userData,
            studentSubgroup: subgroup,
            missedEventId: selectedEvent.id,
          });
        }}
        onMarkMissed={() => {
          if (!selectedEvent) return;
          setShowModal(false);
          navigation.navigate('RecoveryResults', {
            userData,
            studentSubgroup: subgroup,
            missedEventId: selectedEvent.id,
          });
        }}
        onAddPersonal={() => {
          if (!selectedEvent) return;
          setShowModal(false);
          navigation.navigate('AddPersonalEvent', {
            userData,
            prefill: {
              title: `${selectedEvent.moduleCode} ${selectedEvent.activityType}`,
              notes: selectedEvent.moduleName,
              startTime: selectedEvent.startTime,
              endTime: selectedEvent.endTime,
            },
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 16 },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  title: { fontSize: 25, fontWeight: '700', color: appTheme.colors.textPrimary },
  subtitle: { color: appTheme.colors.textSecondary, marginTop: 4, marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  quickBtn: { flex: 1, backgroundColor: appTheme.colors.primary, padding: 12, borderRadius: 14 },
  quickText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 12 },
  personalBtn: { backgroundColor: appTheme.colors.success, borderRadius: 14, padding: 12, marginBottom: 8 },
  personalBtnText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6, gap: 8 },
  tab: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: appTheme.colors.chipBg, borderWidth: 1, borderColor: appTheme.colors.chipBorder },
  tabActive: { backgroundColor: appTheme.colors.primary, borderColor: appTheme.colors.primary },
  tabText: { color: appTheme.colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.chipBorder,
  },
  switchText: { color: appTheme.colors.textPrimary, fontWeight: '600' },
  card: {
    backgroundColor: appTheme.colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  code: { fontWeight: '800', color: appTheme.colors.primary },
  type: { color: appTheme.colors.textDarkSoft, fontWeight: '700' },
  name: { color: appTheme.colors.textDark, fontWeight: '600', marginTop: 4 },
  meta: { color: appTheme.colors.textDarkSoft, marginTop: 2 },
  empty: { textAlign: 'center', color: appTheme.colors.textSecondary, marginTop: 40 },
});

export default TimetableScreen;

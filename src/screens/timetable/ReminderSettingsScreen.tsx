import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  getReminderPreferences,
  ReminderPreference,
  updateReminderPreferences,
} from '../../services/timetableService';

const ReminderSettingsScreen = ({ route }: any) => {
  const { userData } = route.params;
  const userId = userData.universityId;
  const [prefs, setPrefs] = useState<ReminderPreference>({
    timetable24HoursEnabled: true,
    timetable2HoursEnabled: true,
    timetableStartEnabled: true,
    task7DaysEnabled: true,
    task1DayEnabled: true,
    task2HoursEnabled: true,
    taskDeadlineEnabled: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReminderPreferences(userId);
        setPrefs(data);
      } catch {
        Alert.alert('Error', 'Unable to fetch reminder settings.');
      }
    };
    load();
  }, [userId]);

  const save = async () => {
    try {
      const payload = {
        ...prefs,
      };
      const updated = await updateReminderPreferences(userId, payload);
      setPrefs(updated);
      Alert.alert('Saved', 'Reminder settings updated.');
    } catch {
      Alert.alert('Error', 'Unable to save your reminder settings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>

      <Text style={[styles.label, styles.sectionHeader]}>Timetable Reminders</Text>

      <View style={styles.row}>
        <Text style={styles.label}>24 hours before</Text>
        <Switch
          value={prefs.timetable24HoursEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, timetable24HoursEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>2 hours before</Text>
        <Switch
          value={prefs.timetable2HoursEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, timetable2HoursEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>At starting time</Text>
        <Switch
          value={prefs.timetableStartEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, timetableStartEnabled: v }))}
        />
      </View>

      <Text style={[styles.label, styles.sectionHeader, { marginTop: 16 }]}>Task Reminders</Text>

      <View style={styles.row}>
        <Text style={styles.label}>7 days before deadline</Text>
        <Switch
          value={prefs.task7DaysEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, task7DaysEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>1 day before deadline</Text>
        <Switch
          value={prefs.task1DayEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, task1DayEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>2 hours before deadline</Text>
        <Switch
          value={prefs.task2HoursEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, task2HoursEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>At deadline</Text>
        <Switch
          value={prefs.taskDeadlineEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, taskDeadlineEnabled: v }))}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={save}>
        <Text style={styles.btnText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#102A43', marginBottom: 12 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: '#334E68', fontWeight: '600', marginBottom: 6 },
  sectionHeader: { fontSize: 16, color: '#102A43', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  btn: { backgroundColor: '#1864AB', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default ReminderSettingsScreen;

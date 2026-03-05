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
    classRemindersEnabled: true,
    beforeMinutesPrimary: 10,
    beforeMinutesSecondary: 5,
    deadline7DaysEnabled: true,
    deadline1DayEnabled: true,
    deadline1HourEnabled: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReminderPreferences(userId);
        setPrefs(data);
      } catch {
        Alert.alert('Error', 'Could not load reminder settings.');
      }
    };
    load();
  }, [userId]);

  const save = async () => {
    try {
      const payload = {
        ...prefs,
        beforeMinutesPrimary: Number(prefs.beforeMinutesPrimary) || 10,
        beforeMinutesSecondary: Number(prefs.beforeMinutesSecondary) || 5,
      };
      const updated = await updateReminderPreferences(userId, payload);
      setPrefs(updated);
      Alert.alert('Saved', 'Reminder settings updated.');
    } catch {
      Alert.alert('Error', 'Could not save reminder settings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Class reminders</Text>
        <Switch
          value={prefs.classRemindersEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, classRemindersEnabled: v }))}
        />
      </View>

      <Text style={styles.label}>Primary offset (minutes)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(prefs.beforeMinutesPrimary)}
        onChangeText={v => setPrefs(prev => ({ ...prev, beforeMinutesPrimary: Number(v) }))}
      />

      <Text style={styles.label}>Secondary offset (minutes)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(prefs.beforeMinutesSecondary)}
        onChangeText={v => setPrefs(prev => ({ ...prev, beforeMinutesSecondary: Number(v) }))}
      />

      <View style={styles.row}>
        <Text style={styles.label}>7-day deadline reminder</Text>
        <Switch
          value={prefs.deadline7DaysEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, deadline7DaysEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>1-day deadline reminder</Text>
        <Switch
          value={prefs.deadline1DayEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, deadline1DayEnabled: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>1-hour deadline reminder</Text>
        <Switch
          value={prefs.deadline1HourEnabled}
          onValueChange={v => setPrefs(prev => ({ ...prev, deadline1HourEnabled: v }))}
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

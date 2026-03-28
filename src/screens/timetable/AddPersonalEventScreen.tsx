import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  createPersonalEvent,
  deletePersonalEvent,
  getPersonalEvents,
  getReminderPreferences,
  PersonalCalendarEvent,
  ReminderPreference,
  updatePersonalEvent,
} from '../../services/timetableService';
import { clearScheduledReminders, schedulePersonalEventReminders } from '../../services/reminderScheduler';

const emptyForm: PersonalCalendarEvent = {
  title: '',
  notes: '',
  date: '',
  startTime: '',
  endTime: '',
  colorTag: '#1864AB',
};

const AddPersonalEventScreen = ({ route }: any) => {
  const { userData, prefill } = route.params || {};
  const userId = userData.universityId;
  const [events, setEvents] = useState<PersonalCalendarEvent[]>([]);
  const [form, setForm] = useState<PersonalCalendarEvent>({ ...emptyForm, ...prefill });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [list, prefs] = await Promise.all([
        getPersonalEvents(userId),
        getReminderPreferences(userId),
      ]);
      setEvents(list);
      await clearScheduledReminders();
      await schedulePersonalEventReminders(list, prefs as ReminderPreference);
    } catch {
      Alert.alert('Error', 'Unable to retrieve personal events.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      Alert.alert('Validation Required', 'Title, date, start time, and end time are required.');
      return;
    }
    try {
      if (editingId) {
        await updatePersonalEvent(userId, editingId, form);
      } else {
        await createPersonalEvent(userId, form);
      }
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch {
      Alert.alert('Error', 'Unable to save the event.');
    }
  };

  const edit = (e: PersonalCalendarEvent) => {
    setEditingId(e.id || null);
    setForm({
      title: e.title,
      notes: e.notes,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      colorTag: e.colorTag,
    });
  };

  const remove = async (e: PersonalCalendarEvent) => {
    if (!e.id) return;
    try {
      await deletePersonalEvent(userId, e.id);
      await load();
    } catch {
      Alert.alert('Error', 'Unable to delete the event.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Events</Text>
      <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={v => setForm(prev => ({ ...prev, title: v }))} />
      <TextInput style={styles.input} placeholder="Date (yyyy-MM-dd)" value={form.date} onChangeText={v => setForm(prev => ({ ...prev, date: v }))} />
      <TextInput style={styles.input} placeholder="Start time (HH:mm)" value={form.startTime} onChangeText={v => setForm(prev => ({ ...prev, startTime: v }))} />
      <TextInput style={styles.input} placeholder="End time (HH:mm)" value={form.endTime} onChangeText={v => setForm(prev => ({ ...prev, endTime: v }))} />
      <TextInput style={[styles.input, styles.notes]} placeholder="Notes" value={form.notes} onChangeText={v => setForm(prev => ({ ...prev, notes: v }))} multiline />
      <TextInput style={styles.input} placeholder="Color tag (hex)" value={form.colorTag} onChangeText={v => setForm(prev => ({ ...prev, colorTag: v }))} />

      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitText}>{editingId ? 'Update Event' : 'Add Event'}</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.date} {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.cardMeta}>{item.notes || ''}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => edit(item)}>
                <Text style={styles.smallBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.deleteBtn]} onPress={() => remove(item)}>
                <Text style={styles.smallBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#102A43', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#D9E2EC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  notes: { height: 60, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#2F855A', borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 10 },
  submitText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardTitle: { color: '#102A43', fontWeight: '700' },
  cardMeta: { color: '#486581', marginTop: 3 },
  row: { flexDirection: 'row', marginTop: 10 },
  smallBtn: { flex: 1, backgroundColor: '#1864AB', borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 8 },
  deleteBtn: { backgroundColor: '#E53E3E', marginRight: 0 },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default AddPersonalEventScreen;

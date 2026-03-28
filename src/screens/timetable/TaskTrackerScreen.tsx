import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  createTask,
  deleteTask,
  getReminderPreferences,
  getTasks,
  ReminderPreference,
  TaskAssignment,
  updateTask,
} from '../../services/timetableService';
import { clearScheduledReminders, scheduleTaskReminders } from '../../services/reminderScheduler';
import { appTheme } from '../../theme/appTheme';

const TaskTrackerScreen = ({ route }: any) => {
  const { userData } = route.params;
  const userId = userData.universityId;
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'SUBMITTED'>('PENDING');
  const [title, setTitle] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [notes, setNotes] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      } else {
        updateDateString(selectedDate);
      }
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const finalDate = new Date(date);
      finalDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(finalDate);
      updateDateString(finalDate);
    }
  };

  const updateDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setDueDateTime(`${yyyy}-${MM}-${dd}T${HH}:${mm}`);
  };

  const load = useCallback(async () => {
    try {
      const list = await getTasks(userId);
      setTasks(list);
      const prefs = (await getReminderPreferences(userId)) as ReminderPreference;
      await clearScheduledReminders();
      await scheduleTaskReminders(list, prefs);
    } catch {
      Alert.alert('Error', 'Unable to load your tasks.');
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return tasks
      .filter(t => t.status === tab)
      .sort((a, b) => {
        const dateA = new Date(a.dueDateTime).getTime();
        const dateB = new Date(b.dueDateTime).getTime();
        return dateA - dateB; // Closest due date first
      });
  }, [tasks, tab]);

  const addTask = async () => {
    if (!title || !dueDateTime) {
      Alert.alert('Validation Required', 'Both the title and due date/time must be provided.');
      return;
    }
    try {
      await createTask(userId, { title, moduleCode, dueDateTime, notes, status: 'PENDING' });
      setTitle('');
      setModuleCode('');
      setDueDateTime('');
      setNotes('');
      await load();
    } catch {
      Alert.alert('Error', 'Unable to create the task.');
    }
  };

  const toggleStatus = async (task: TaskAssignment) => {
    if (!task.id) return;
    try {
      await updateTask(userId, task.id, {
        ...task,
        status: task.status === 'PENDING' ? 'SUBMITTED' : 'PENDING',
      });
      await load();
    } catch {
      Alert.alert('Error', 'Unable to update the task.');
    }
  };

  const removeTask = async (task: TaskAssignment) => {
    if (!task.id) return;
    try {
      await deleteTask(userId, task.id);
      await load();
    } catch {
      Alert.alert('Error', 'Unable to delete the task.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <Text style={styles.title}>Task Tracker</Text>
      <View style={styles.formPanel}>
      <TextInput style={styles.input} placeholder="Task title" placeholderTextColor={appTheme.colors.textMuted} value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Module code (optional)" placeholderTextColor={appTheme.colors.textMuted} value={moduleCode} onChangeText={setModuleCode} />
      <View style={styles.datePickerRow}>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="Due datetime (yyyy-MM-ddTHH:mm)"
          placeholderTextColor={appTheme.colors.textMuted}
          value={dueDateTime}
          onChangeText={setDueDateTime}
        />
        <TouchableOpacity style={styles.calendarBtn} onPress={() => { setShowDatePicker(true); if (Platform.OS === 'ios') setShowTimePicker(true); }}>
          <View style={styles.calendarIconContainer}>
            <View style={styles.calendarIconHeader} />
            <View style={styles.calendarIconBody}>
              {[...Array(6)].map((_, i) => <View key={i} style={styles.calendarIconDot} />)}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
          display="default"
          onChange={onChangeDate}
        />
      )}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      )}
      <TextInput style={[styles.input, styles.notes]} placeholder="Notes" placeholderTextColor={appTheme.colors.textMuted} value={notes} onChangeText={setNotes} multiline />
      <TouchableOpacity style={styles.addBtn} onPress={addTask}>
        <Text style={styles.addBtnText}>Add Task</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'PENDING' && styles.tabActive]} onPress={() => setTab('PENDING')}>
          <Text style={[styles.tabText, tab === 'PENDING' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'SUBMITTED' && styles.tabActive]} onPress={() => setTab('SUBMITTED')}>
          <Text style={[styles.tabText, tab === 'SUBMITTED' && styles.tabTextActive]}>Submitted</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>Module: {item.moduleCode || 'N/A'}</Text>
            <Text style={styles.cardMeta}>Due: {item.dueDateTime}</Text>
            <Text style={styles.cardMeta}>Status: {item.status}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => toggleStatus(item)}>
                <Text style={styles.smallBtnText}>{item.status === 'PENDING' ? 'Submit' : 'Mark Pending'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.deleteBtn]} onPress={() => removeTask(item)}>
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
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 16 },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  title: { fontSize: 24, fontWeight: '700', color: appTheme.colors.textPrimary, marginBottom: 10 },
  formPanel: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: appTheme.colors.chipBorder,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: appTheme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    color: appTheme.colors.textDark,
  },
  notes: { height: 70, textAlignVertical: 'top' },
  addBtn: { backgroundColor: appTheme.colors.primary, borderRadius: 14, padding: 13, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: appTheme.colors.chipBg,
    borderWidth: 1,
    borderColor: appTheme.colors.chipBorder,
    marginRight: 8,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: appTheme.colors.primary, borderColor: appTheme.colors.primary },
  tabText: { color: appTheme.colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: appTheme.colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  cardTitle: { color: appTheme.colors.textDark, fontWeight: '700' },
  cardMeta: { color: appTheme.colors.textDarkSoft, marginTop: 3 },
  row: { flexDirection: 'row', marginTop: 10 },
  smallBtn: { flex: 1, backgroundColor: appTheme.colors.primary, borderRadius: 10, padding: 10, alignItems: 'center', marginRight: 8 },
  deleteBtn: { backgroundColor: appTheme.colors.danger, marginRight: 0 },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  datePickerRow: { flexDirection: 'row', alignItems: 'center' },
  dateInput: { flex: 1, marginBottom: 0 },
  calendarBtn: { marginLeft: 10, padding: 10, backgroundColor: appTheme.colors.chipBg, borderRadius: 12, borderWidth: 1, borderColor: appTheme.colors.chipBorder },
  calendarIconContainer: { width: 22, height: 22, borderWidth: 2, borderColor: appTheme.colors.primary, borderRadius: 4, overflow: 'hidden' },
  calendarIconHeader: { backgroundColor: appTheme.colors.primary, height: 5, width: '100%' },
  calendarIconBody: { flex: 1, backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'wrap', padding: 2, gap: 2, justifyContent: 'center' },
  calendarIconDot: { width: 3, height: 3, backgroundColor: appTheme.colors.primary, borderRadius: 1.5 },
});

export default TaskTrackerScreen;

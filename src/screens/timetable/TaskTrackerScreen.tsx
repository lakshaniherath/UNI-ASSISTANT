import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

const TaskTrackerScreen = ({ route }: any) => {
  const { userData } = route.params;
  const userId = userData.universityId;
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'SUBMITTED'>('PENDING');
  const [title, setTitle] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    try {
      const list = await getTasks(userId);
      setTasks(list);
      const prefs = (await getReminderPreferences(userId)) as ReminderPreference;
      await clearScheduledReminders();
      await scheduleTaskReminders(list, prefs);
    } catch {
      Alert.alert('Error', 'Could not load tasks.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => tasks.filter(t => t.status === tab), [tasks, tab]);

  const addTask = async () => {
    if (!title || !dueDateTime) {
      Alert.alert('Validation', 'Title and dueDateTime are required.');
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
      Alert.alert('Error', 'Could not create task.');
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
      Alert.alert('Error', 'Could not update task.');
    }
  };

  const removeTask = async (task: TaskAssignment) => {
    if (!task.id) return;
    try {
      await deleteTask(userId, task.id);
      await load();
    } catch {
      Alert.alert('Error', 'Could not delete task.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Tracker</Text>
      <TextInput style={styles.input} placeholder="Task title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Module code (optional)" value={moduleCode} onChangeText={setModuleCode} />
      <TextInput
        style={styles.input}
        placeholder="Due datetime (yyyy-MM-ddTHH:mm)"
        value={dueDateTime}
        onChangeText={setDueDateTime}
      />
      <TextInput style={[styles.input, styles.notes]} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />
      <TouchableOpacity style={styles.addBtn} onPress={addTask}>
        <Text style={styles.addBtnText}>Add Task</Text>
      </TouchableOpacity>

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
                <Text style={styles.smallBtnText}>Toggle Status</Text>
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
  notes: { height: 70, textAlignVertical: 'top' },
  addBtn: { backgroundColor: '#1864AB', borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#E4ECF2', marginRight: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#1864AB' },
  tabText: { color: '#334E68', fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardTitle: { color: '#102A43', fontWeight: '700' },
  cardMeta: { color: '#486581', marginTop: 3 },
  row: { flexDirection: 'row', marginTop: 10 },
  smallBtn: { flex: 1, backgroundColor: '#1864AB', borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 8 },
  deleteBtn: { backgroundColor: '#E53E3E', marginRight: 0 },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default TaskTrackerScreen;

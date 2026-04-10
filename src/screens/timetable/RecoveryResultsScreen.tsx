import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchRecoverySuggestions, TimetableEvent, TimetableRecoveryResponse } from '../../services/timetableService';

const RecoveryResultsScreen = ({ route, navigation }: any) => {
  const { studentSubgroup, missedEventId, userData } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TimetableRecoveryResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRecoverySuggestions(studentSubgroup, missedEventId);
        setResult(data);
      } catch (e) {
        Alert.alert('Error', 'Could not find recovery options.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentSubgroup, missedEventId]);

  const savePlan = (event: TimetableEvent) => {
    Alert.alert('Saved', `Recovery plan saved for ${event.moduleCode} (${event.dayOfWeek} ${event.startTime}).`, [
      { text: 'OK', onPress: () => navigation.navigate('Timetable', { userData }) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1864AB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recovery Suggestions</Text>
      <Text style={styles.sub}>
        Original: {result?.originalEvent?.moduleCode} {result?.originalEvent?.activityType}
      </Text>

      <FlatList
        data={result?.alternatives || []}
        keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : String(index))}
        ListEmptyComponent={<Text style={styles.empty}>No alternative slots found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardCode}>
              {item.moduleCode} {item.activityType}
            </Text>
            <Text style={styles.cardMeta}>
              {item.dayOfWeek} {item.startTime}-{item.endTime}
            </Text>
            <Text style={styles.cardMeta}>Group: {item.subgroup}</Text>
            <Text style={styles.cardMeta}>Location: {item.location}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => savePlan(item)}>
              <Text style={styles.btnText}>Save as Recovery Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#102A43' },
  sub: { color: '#486581', marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 2 },
  cardCode: { fontWeight: '800', color: '#1864AB', fontSize: 16 },
  cardMeta: { color: '#486581', marginTop: 3 },
  btn: { marginTop: 10, backgroundColor: '#1864AB', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, color: '#829AB1' },
});

export default RecoveryResultsScreen;

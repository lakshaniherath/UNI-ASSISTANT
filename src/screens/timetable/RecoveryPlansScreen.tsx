import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteRecoveryPlan, getRecoveryPlans, RecoveryPlan } from '../../services/timetableService';
import { appTheme } from '../../theme/appTheme';

const RecoveryPlansScreen = ({ route }: any) => {
  const { userData } = route.params;
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRecoveryPlans(userData.universityId);
      setPlans(data);
    } catch {
      Alert.alert('Error', 'Could not load recovery plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removePlan = async (id: number) => {
    try {
      await deleteRecoveryPlan(id);
      load();
    } catch {
      Alert.alert('Error', 'Could not delete plan.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <Text style={styles.title}>My Recovery Plans</Text>
      <Text style={styles.subtitle}>Scheduled alternative slots for missed classes</Text>

      <FlatList
        data={plans}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>You don't have any recovery plans yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.missedTag}>
              <Text style={styles.tagText}>MISSED</Text>
            </View>
            <Text style={styles.origText}>
              Original: {item.originalModuleCode} ({item.originalTime})
            </Text>
            <View style={styles.divider} />
            <Text style={styles.recTitle}>
              Replacement: {item.recoveryModuleCode} {item.recoveryActivityType}
            </Text>
            <Text style={styles.recMeta}>
              {item.recoveryDay} | {item.recoveryStartTime}-{item.recoveryEndTime}
            </Text>
            <Text style={styles.recMeta}>Location: {item.recoveryLocation}</Text>
            <Text style={styles.recMeta}>Group: {item.recoverySubgroup}</Text>
            
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => item.id && removePlan(item.id)}
            >
              <Text style={styles.deleteText}>Remove Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appTheme.colors.bg },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  title: { fontSize: 24, fontWeight: '700', color: appTheme.colors.textPrimary },
  subtitle: { color: appTheme.colors.textSecondary, marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: appTheme.colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  missedTag: {
    backgroundColor: '#FFE3E3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: { color: '#C53030', fontSize: 10, fontWeight: '800' },
  origText: { color: appTheme.colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: appTheme.colors.chipBorder, marginVertical: 12, opacity: 0.5 },
  recTitle: { fontSize: 17, fontWeight: '800', color: appTheme.colors.primary },
  recMeta: { color: appTheme.colors.textDarkSoft, marginTop: 4, fontWeight: '600' },
  deleteBtn: { marginTop: 15, padding: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: appTheme.colors.chipBorder },
  deleteText: { color: appTheme.colors.danger, fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: appTheme.colors.textSecondary, marginTop: 50 },
});

export default RecoveryPlansScreen;

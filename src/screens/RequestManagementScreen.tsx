import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

// 🚀 Interface to match the new JoinRequestResponseDTO structure
interface JoinRequestDTO {
  id: number;
  studentId: string;
  studentName: string;
  studentSkills: string; // Now correctly populated from the User table
  studentCgpa: string;   // Now correctly populated from the User table
}

const RequestManagementScreen = ({ route }: any) => {
  const { groupId } = route.params;
  const [requests, setRequests] = useState<JoinRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${groupId}/requests`);
      setRequests(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await api.post(`/groups/accept-request/${requestId}`);
      Alert.alert('Success! 🎉', 'New member added.');
      fetchRequests(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to add member.');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1864AB" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.empty}>No pending requests.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              {/* Displaying Live Data from the User Profile */}
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.studentId}>ID: {item.studentId}</Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>📊 CGPA:</Text>
                <Text style={styles.value}>{item.studentCgpa || 'Not Set'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>🛠 Skills:</Text>
                <Text style={styles.value}>{item.studentSkills || 'No skills listed'}</Text>
              </View>

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={styles.acceptText}>Accept Member</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  requestCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#1864AB' },
  studentId: { fontSize: 13, color: '#627D98', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  label: { fontSize: 14, color: '#475569', fontWeight: '600', marginRight: 6 },
  value: { fontSize: 14, color: '#1E293B', flex: 1 },
  acceptBtn: {
    backgroundColor: '#40C057',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8', fontSize: 16 },
});

export default RequestManagementScreen;

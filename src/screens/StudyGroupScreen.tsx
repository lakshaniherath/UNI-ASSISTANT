import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { api } from '../services/api';

const StudyGroupScreen = ({ route, navigation }: any) => {
  const { userData } = route.params; 
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyMySubgroup, setShowOnlyMySubgroup] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroups();
    });
    return unsubscribe;
  }, [navigation]);

  // 🚀 Backend එකෙන් Match Score එකත් එක්කම Groups ලබා ගැනීම
  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Backend එකේ අපි හදපු අලුත් Endpoint එක (DTO එකක් ලබා දෙයි)
      const response = await api.get(`/groups/recommended/${userData.universityId}`);
      
      // Response එක DTO එකක් නිසා, එය පාවිච්චි කිරීමට පහසු පරිදි සකසා ගමු
      const groupsWithScores = response.data.map((item: any) => ({
        ...item.group,      
        matchScore: item.matchScore 
      }));

      // Subgroup එක අනුව filter කිරීම
      if (showOnlyMySubgroup) {
        setFilteredGroups(groupsWithScores.filter((g: any) => g.subgroup === userData.subgroup));
      } else {
        setFilteredGroups(groupsWithScores);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Groups ලබා ගැනීමට නොහැකි විය.');
    } finally {
      setLoading(false);
    }
  };

  // Switch එක වෙනස් කරන විට නැවත fetch කරමු
  useEffect(() => {
    fetchGroups();
  }, [showOnlyMySubgroup]);

  const handleRequestToJoin = async (groupId: number) => {
    try {
      const response = await api.post('/groups/request-to-join', null, {
        params: {
          groupId: groupId,
          studentId: userData.universityId
        }
      });
      Alert.alert('Success! 🎉', response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data || 'Could not send the request.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Study Groups</Text>
        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={() => navigation.navigate('CreateGroup', { userData })}
        >
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Show only my Subgroup ({userData.subgroup})</Text>
        <Switch
          value={showOnlyMySubgroup}
          onValueChange={setShowOnlyMySubgroup}
          trackColor={{ false: '#D9E2EC', true: '#A5D8FF' }}
          thumbColor={showOnlyMySubgroup ? '#1864AB' : '#f4f3f4'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1864AB" />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.empty}>දැනට කිසිදු කණ්ඩායමක් නොමැත.</Text>}
          renderItem={({ item }) => {
            const isLeader = item.creatorId === userData.universityId;
            return (
              <View style={styles.groupCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.groupName}>{item.groupName}</Text>
                  {/* Backend එකෙන් ලැබෙන Match Score එක පෙන්වීම */}
                  <View style={[styles.matchBadge, {backgroundColor: item.matchScore >= 70 ? '#40C057' : (item.matchScore >= 40 ? '#FAB005' : '#FA5252')}]}>
                    <Text style={styles.matchText}>{item.matchScore}% Match</Text>
                  </View>
                </View>

                <Text style={styles.subgroupTag}>{item.subgroup}</Text>
                <Text style={styles.desc}>{item.description}</Text>

                {/* 🎯 Displaying Target CGPA */}
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>🎯 Target CGPA: </Text>
                  <Text style={styles.targetValue}>{item.targetCGPA}</Text>
                </View>

                <Text style={styles.skills}>Target Skills: {item.requiredSkills?.join(', ')}</Text>

                <View style={styles.footer}>
                  <Text style={styles.members}>👥 {item.currentMembers}/{item.maxMembers}</Text>

                  {isLeader ? (
                    // 🚀 1. Button shown only to the Leader
                    <TouchableOpacity
                      style={[styles.actionButton, styles.manageBtn]}
                      onPress={() => navigation.navigate('RequestManagement', { groupId: item.id })}
                    >
                      <Text style={styles.btnText}>Manage Requests</Text>
                    </TouchableOpacity>
                  ) : (
                    // 🚀 2. Button shown to other students
                    <TouchableOpacity
                      style={[styles.actionButton, styles.requestBtn]}
                      onPress={() => handleRequestToJoin(item.id)}
                    >
                      <Text style={styles.btnText}>Request to Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

// Styles (දැනට ඇති ඒවා එලෙසම පවතී)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#102A43' },
  createBtn: { backgroundColor: '#1864AB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { color: '#fff', fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E1F0FF', padding: 12, borderRadius: 10, marginBottom: 20 },
  filterText: { fontSize: 14, fontWeight: '600', color: '#1864AB', flex: 1 },
  groupCard: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#1864AB', flex: 1 },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  subgroupTag: { fontSize: 12, color: '#40C057', fontWeight: 'bold', marginTop: 2 },
  desc: { fontSize: 14, color: '#334E68', marginVertical: 10 },
  skills: { fontSize: 12, color: '#627D98', fontStyle: 'italic' },
  targetRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  targetLabel: { fontSize: 13, color: '#627D98', fontWeight: '600' },
  targetValue: { fontSize: 13, color: '#1864AB', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  members: { fontSize: 14, fontWeight: '600' },
  actionButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, elevation: 2 },
  manageBtn: { backgroundColor: '#F59E0B' },
  requestBtn: { backgroundColor: '#1864AB' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default StudyGroupScreen;
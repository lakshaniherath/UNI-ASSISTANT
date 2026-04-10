import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { api } from '../services/api';
import { appTheme } from '../theme/appTheme';

const StudyGroupScreen = ({ route, navigation }: any) => {
  const { userData } = route.params; 
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyMySubgroup, setShowOnlyMySubgroup] = useState(true);
  const [requestedGroups, setRequestedGroups] = useState<Set<number>>(new Set());

  // 🚀 Backend එකෙන් Match Score එකත් එක්කම Groups ලබා ගැනීම
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/recommended/${userData.universityId}`);
      
      const groupsWithScores = response.data.map((item: any) => ({
        ...item.group,      
        matchScore: item.matchScore 
      }));

      setAllGroups(groupsWithScores);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Groups ලබා ගැනීමට නොහැකි විය.');
    } finally {
      setLoading(false);
    }
  }, [userData.universityId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroups();
    });
    return unsubscribe;
  }, [fetchGroups, navigation]);

  // 🔄 Switch එක වෙනස් කරන විට instantly filter වේ (re-fetch අවශ්‍ය නැත)
  const filteredGroups = useMemo(() => {
    if (showOnlyMySubgroup) {
      return allGroups.filter((g: any) => g.subgroup === userData.subgroup);
    }
    return allGroups;
  }, [allGroups, showOnlyMySubgroup, userData.subgroup]);

  const handleRequestToJoin = async (groupId: number) => {
    try {
      const response = await api.post('/groups/request-to-join', null, {
        params: {
          groupId: groupId,
          studentId: userData.universityId
        }
      });
      const message = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      setRequestedGroups(prev => new Set(prev).add(groupId));
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error('🔴 Request to Join Error:', JSON.stringify(error.response?.data));
      let errMsg = 'Could not send the request.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errMsg = error.response.data;
        } else if (error.response.data.message) {
          errMsg = error.response.data.message;
        }
      }
      Alert.alert('Error', errMsg);
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
          trackColor={{ false: '#3D536B', true: '#295A89' }}
          thumbColor={showOnlyMySubgroup ? appTheme.colors.accent : '#f4f3f4'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={appTheme.colors.accent} />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item: any) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.empty}>දැනට කිසිදු කණ්ඩායමක් නොමැත.</Text>}
          renderItem={({ item }) => {
            const isLeader = item.creatorId === userData.universityId;
            const isMember = item.memberIds?.includes(userData.universityId);
            return (
              <TouchableOpacity
                activeOpacity={isLeader || isMember ? 0.7 : 1}
                onPress={() => {
                  if (isLeader || isMember) {
                    navigation.navigate('GroupDetails', {
                      groupId: item.id,
                      groupData: item,
                      userData,
                    });
                  }
                }}
              >
              <View style={styles.groupCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.groupName}>{item.groupName}</Text>
                  {/* Backend එකෙන් ලැබෙන Match Score එක පෙන්වීම */}
                  <View style={[styles.matchBadge, {backgroundColor: item.matchScore >= 70 ? appTheme.colors.success : (item.matchScore >= 40 ? appTheme.colors.accent : appTheme.colors.danger)}]}>
                    <Text style={styles.matchText}>{item.matchScore}% Match</Text>
                  </View>
                </View>

                <Text style={styles.subgroupTag}>{item.subgroup}</Text>
                <Text style={styles.desc}>{item.description}</Text>

                {/* Displaying target CGPA */}
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Target CGPA: </Text>
                  <Text style={styles.targetValue}>{item.targetCGPA}</Text>
                </View>

                <Text style={styles.skills}>Target Skills: {item.requiredSkills?.join(', ')}</Text>

                <View style={styles.footer}>
                  <Text style={styles.members}>{item.currentMembers}/{item.maxMembers} Members</Text>

                  {isLeader ? (
                    // 🚀 1. Button shown only to the Leader
                    <TouchableOpacity
                      style={[styles.actionButton, styles.manageBtn]}
                      onPress={() => navigation.navigate('RequestManagement', { groupId: item.id })}
                    >
                      <Text style={styles.btnText}>Manage Requests</Text>
                    </TouchableOpacity>
                  ) : requestedGroups.has(item.id) ? (
                    // 🚀 2a. Already requested — disabled grey button
                    <TouchableOpacity
                      style={[styles.actionButton, styles.requestedBtn]}
                      disabled={true}
                    >
                      <Text style={styles.btnText}>Requested ✓</Text>
                    </TouchableOpacity>
                  ) : (
                    // 🚀 2b. Button shown to other students
                    <TouchableOpacity
                      style={[styles.actionButton, styles.requestBtn]}
                      onPress={() => handleRequestToJoin(item.id)}
                    >
                      <Text style={styles.btnText}>Request to Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {(isLeader || isMember) && (
                  <Text style={styles.tapHint}>Tap to view group details</Text>
                )}
              </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

// Styles (දැනට ඇති ඒවා එලෙසම පවතී)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: appTheme.colors.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: appTheme.colors.textPrimary },
  createBtn: { backgroundColor: appTheme.colors.accent, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: appTheme.colors.surface, padding: 14, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: appTheme.colors.chipBorder },
  filterText: { fontSize: 14, fontWeight: '600', color: appTheme.colors.textSecondary, flex: 1 },
  groupCard: { backgroundColor: appTheme.colors.card, padding: 18, borderRadius: 18, marginBottom: 15, borderWidth: 1, borderColor: appTheme.colors.cardBorder, ...appTheme.shadow.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  groupName: { fontSize: 18, fontWeight: 'bold', color: appTheme.colors.primary, flex: 1 },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  matchText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  subgroupTag: { fontSize: 12, color: appTheme.colors.success, fontWeight: 'bold', marginTop: 2 },
  desc: { fontSize: 14, color: appTheme.colors.textDark, marginVertical: 10 },
  skills: { fontSize: 12, color: appTheme.colors.textDarkSoft, fontStyle: 'italic' },
  targetRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  targetLabel: { fontSize: 13, color: appTheme.colors.textDarkSoft, fontWeight: '600' },
  targetValue: { fontSize: 13, color: appTheme.colors.primary, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  members: { fontSize: 14, fontWeight: '600', color: appTheme.colors.textDark },
  actionButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, elevation: 2 },
  manageBtn: { backgroundColor: appTheme.colors.accent },
  requestBtn: { backgroundColor: appTheme.colors.primary },
  requestedBtn: { backgroundColor: '#94A3B8' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  tapHint: { textAlign: 'center', color: appTheme.colors.textMuted, fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  empty: { textAlign: 'center', marginTop: 50, color: appTheme.colors.textSecondary }
});

export default StudyGroupScreen;

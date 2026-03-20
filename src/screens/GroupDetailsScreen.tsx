import React, { useCallback, useEffect, useState } from 'react';
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
import { appTheme } from '../theme/appTheme';

interface MemberDTO {
  universityId: string;
  name: string;
  email: string;
  subgroup: string;
  cgpa: string;
  skills: string;
  leader: boolean;
}

const GroupDetailsScreen = ({ route, navigation }: any) => {
  const { groupId, groupData, userData } = route.params;
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const isLeader = userData.universityId === groupData.creatorId;
  const isMember = groupData.memberIds?.includes(userData.universityId);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data);
    } catch {
      Alert.alert('Error', 'Could not load members.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/groups/${groupId}/remove-member`, null, {
                params: { memberId },
              });
              Alert.alert('Done', `${memberName} has been removed.`);
              fetchMembers();
            } catch (error: any) {
              const msg = typeof error.response?.data === 'string' ? error.response.data : 'Failed to remove member.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to permanently delete this group? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/groups/${groupId}`, {
                params: { requesterId: userData.universityId },
              });
              Alert.alert('Deleted', 'Group has been deleted.', [
                { text: 'OK', onPress: () => navigation.navigate('StudyGroups', { userData }) },
              ]);
            } catch (error: any) {
              const msg = typeof error.response?.data === 'string' ? error.response.data : 'Failed to delete group.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/groups/${groupId}/leave`, null, {
                params: { studentId: userData.universityId },
              });
              Alert.alert('Done', 'You have left the group.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              const msg = typeof error.response?.data === 'string' ? error.response.data : 'Failed to leave group.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      {/* Group Info Header */}
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{groupData.groupName}</Text>
        <Text style={styles.groupSub}>{groupData.subgroup}</Text>
        <Text style={styles.groupDesc}>{groupData.description}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>👥 {members.length}/{groupData.maxMembers} Members</Text>
          <Text style={styles.stat}>🎯 CGPA: {groupData.targetCGPA}</Text>
        </View>
        <Text style={styles.skillsText}>Skills: {groupData.requiredSkills?.join(', ')}</Text>
      </View>

      {/* Members Section */}
      <Text style={styles.sectionTitle}>Group Members</Text>

      {loading ? (
        <ActivityIndicator size="large" color={appTheme.colors.accent} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.universityId}
          ListEmptyComponent={<Text style={styles.empty}>No members found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberName}>
                  {item.name} {item.leader ? '👑' : ''}
                </Text>
                {item.leader && <Text style={styles.leaderTag}>Leader</Text>}
              </View>

              <Text style={styles.memberId}>🆔 {item.universityId}</Text>
              <Text style={styles.memberDetail}>📧 {item.email}</Text>
              <Text style={styles.memberDetail}>📊 CGPA: {item.cgpa}</Text>
              <Text style={styles.memberDetail}>🛠 Skills: {item.skills}</Text>
              <Text style={styles.memberDetail}>📋 Subgroup: {item.subgroup}</Text>

              {/* Leader can remove non-leader members */}
              {isLeader && !item.leader && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveMember(item.universityId, item.name)}
                >
                  <Text style={styles.removeBtnText}>Remove Member</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Action Buttons at bottom */}
      <View style={styles.actionArea}>
        {isLeader ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteGroup}>
            <Text style={styles.actionBtnText}>🗑 Delete Group</Text>
          </TouchableOpacity>
        ) : isMember ? (
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveGroup}>
            <Text style={styles.actionBtnText}>🚪 Leave Group</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: appTheme.colors.bg },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: appTheme.colors.overlayBlue,
  },
  groupHeader: {
    backgroundColor: appTheme.colors.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  groupName: { fontSize: 22, fontWeight: 'bold', color: appTheme.colors.primary },
  groupSub: { fontSize: 12, color: appTheme.colors.success, fontWeight: 'bold', marginTop: 2 },
  groupDesc: { fontSize: 14, color: appTheme.colors.textDark, marginTop: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  stat: { fontSize: 13, color: appTheme.colors.textDarkSoft, fontWeight: '600' },
  skillsText: { fontSize: 12, color: appTheme.colors.textDarkSoft, fontStyle: 'italic', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: appTheme.colors.textPrimary, marginBottom: 12 },
  memberCard: {
    backgroundColor: appTheme.colors.card,
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.cardBorder,
    ...appTheme.shadow.card,
  },
  memberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberName: { fontSize: 16, fontWeight: 'bold', color: appTheme.colors.primary },
  leaderTag: {
    backgroundColor: appTheme.colors.accent,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  memberId: { fontSize: 12, color: appTheme.colors.textDarkSoft, marginTop: 4 },
  memberDetail: { fontSize: 13, color: appTheme.colors.textDarkSoft, marginTop: 3 },
  removeBtn: {
    backgroundColor: appTheme.colors.danger,
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  removeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  actionArea: { paddingVertical: 15 },
  deleteBtn: {
    backgroundColor: appTheme.colors.danger,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  leaveBtn: {
    backgroundColor: appTheme.colors.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  empty: { textAlign: 'center', marginTop: 30, color: appTheme.colors.textSecondary, fontSize: 16 },
});

export default GroupDetailsScreen;

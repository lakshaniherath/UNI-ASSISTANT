import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { tutoringApi, userSearchApi } from '../services/api';
import { appTheme } from '../theme/appTheme';
import { useFocusEffect } from '@react-navigation/native';

const MODULE_OPTIONS = [
  { code: 'IT3010', name: 'NDM' },
  { code: 'IT3020', name: 'DS' },
  { code: 'IT3030', name: 'PAF' },
  { code: 'IT3040', name: 'ITPM' },
  { code: 'IT3050', name: 'ESD' },
];

const PeerSupportScreen = ({ route, navigation }: any) => {
  const { currentUserId } = route.params;

  const [history, setHistory] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'myBookings' | 'tutorRequests'>('myBookings');
  const [loading, setLoading] = useState(true);

  // Form State
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [tutorId, setTutorId] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isDeclineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedRequestId, setSelectedSessionId] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  const [dateObj, setDateObj] = useState(new Date());
  const [startObj, setStartObj] = useState(new Date());
  const [endObj, setEndObj] = useState(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setSessionDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartObj(selectedDate);
      const timeString = selectedDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      setStartTime(timeString);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndObj(selectedDate);
      const timeString = selectedDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      setEndTime(timeString);
    }
  };

  const handleTutorIdChange = async (text: string) => {
    setTutorId(text);
    if (text.length > 2) {
      try {
        const res = await userSearchApi.searchUsers(text);
        setSearchSuggestions(res.data);
      } catch (e) {
        console.log(e);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const selectTutor = (id: string) => {
    setTutorId(id);
    setSearchSuggestions([]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resHistory, resRequests] = await Promise.all([
        tutoringApi.getStudentHistory(currentUserId),
        tutoringApi.getTutorSchedule(currentUserId)
      ]);
      setHistory(resHistory.data);
      setTutorRequests(resRequests.data);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Unable to load tutoring sessions.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleBookSession = async () => {
    if (!tutorId || !moduleCode || !sessionDate || !startTime || !endTime) {
      Alert.alert('Validation Required', 'Please complete all fields.');
      return;
    }
    
    // Auto format time safely to HH:MM:SS for Spring Boot LocalTime bounds
    const formatTime = (t: string) => t.length <= 5 ? `${t}:00` : t;

    const payload = {
      studentId: currentUserId,
      tutorId: tutorId.toUpperCase(),
      moduleCode: moduleCode.toUpperCase(),
      sessionDate,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    };

    try {
      await tutoringApi.bookSession(payload);
      Alert.alert('Success', 'Your tutoring request has been sent successfully.');
      setBookModalVisible(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Booking Failed', e.response?.data?.error || 'The selected slot is currently unavailable.');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await tutoringApi.cancelSession(id, currentUserId);
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Unable to cancel the session.');
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await tutoringApi.acceptSession(id, currentUserId);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Unable to accept the request.');
    }
  };

  const openDeclineModal = (id: number) => {
    setSelectedSessionId(id);
    setDeclineModalVisible(true);
  };

  const handleDecline = async () => {
    if (!selectedRequestId || !declineReason) {
      Alert.alert('Validation Required', 'Please provide a reason.');
      return;
    }
    try {
      await tutoringApi.declineSession(selectedRequestId, currentUserId, declineReason);
      setDeclineModalVisible(false);
      setDeclineReason('');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Unable to decline the request.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Download Initiated', 'Please wait while the PDF summary is being generated.');
      const path = await tutoringApi.downloadReport(currentUserId);
      Alert.alert('Success', `PDF saved to ${path}`);
    } catch (e) {
      Alert.alert('Error', 'An error occurred while downloading the PDF.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent:'center' }} size="large" />;

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.title}>Peer Tutoring</Text>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={100} style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setBookModalVisible(true)}>
          <Text style={styles.btnText}>+ Book Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={handleDownloadPDF}>
          <Text style={styles.btnTextPrimary}>Summary PDF</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="fadeIn" delay={200} style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'myBookings' && styles.activeTab]} onPress={() => setActiveTab('myBookings')}>
          <Text style={[styles.tabText, activeTab === 'myBookings' && styles.activeTabText]}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'tutorRequests' && styles.activeTab]} onPress={() => setActiveTab('tutorRequests')}>
          <Text style={[styles.tabText, activeTab === 'tutorRequests' && styles.activeTabText]}>Requests For Me</Text>
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView>
        {activeTab === 'myBookings' ? (
          <>
            {history.length === 0 ? <Text style={styles.empty}>No bookings found.</Text> : null}
            {history.map((item, idx) => (
              <Animatable.View key={idx} animation="fadeInUp" delay={idx * 100} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modCode}>{item.moduleCode}</Text>
                  <Text style={styles.details}>Tutor: {item.tutorId}</Text>
                  <Text style={styles.details}>Date: {item.sessionDate}</Text>
                  <Text style={styles.details}>Time: {item.startTime} - {item.endTime}</Text>
                  <Text style={[styles.status, item.status === 'CANCELLED' || item.status === 'DECLINED' ? {color: 'red'} : item.status === 'COMPLETED' ? {color: 'green'} : item.status === 'PENDING' ? {color: 'orange'} : {}]}>{item.status}</Text>
                  {item.status === 'DECLINED' && item.declineReason && (
                    <Text style={{color: 'red', fontStyle:'italic', marginTop: 4}}>Reason: {item.declineReason}</Text>
                  )}
                </View>
                <View style={styles.actionBox}>
                  {(item.status === 'SCHEDULED' || item.status === 'PENDING') && (
                    <TouchableOpacity style={styles.delBtn} onPress={() => handleCancel(item.id)}>
                      <Text style={styles.delBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animatable.View>
            ))}
          </>
        ) : (
          <>
            {tutorRequests.length === 0 ? <Text style={styles.empty}>No requests found.</Text> : null}
            {tutorRequests.map((item, idx) => (
              <Animatable.View key={idx} animation="fadeInUp" delay={idx * 100} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modCode}>{item.moduleCode}</Text>
                  <Text style={styles.details}>Student: {item.studentId}</Text>
                  <Text style={styles.details}>Date: {item.sessionDate}</Text>
                  <Text style={styles.details}>Time: {item.startTime} - {item.endTime}</Text>
                  <Text style={[styles.status, item.status === 'CANCELLED' || item.status === 'DECLINED' ? {color: 'red'} : item.status === 'COMPLETED' ? {color: 'green'} : item.status === 'PENDING' ? {color: 'orange'} : {}]}>{item.status}</Text>
                </View>
                <View style={[styles.actionBox, {flexDirection: 'row', gap: 5}]}>
                  {item.status === 'PENDING' && (
                    <>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                        <Text style={styles.acceptBtnText}>✓ Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delBtn} onPress={() => openDeclineModal(item.id)}>
                        <Text style={styles.delBtnText}>✗ Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {item.status === 'SCHEDULED' && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => {
                        tutoringApi.completeSession(item.id, currentUserId).then(() => fetchData());
                    }}>
                      <Text style={styles.acceptBtnText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animatable.View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Book Session Modal */}
      <Modal visible={isBookModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Tutoring</Text>
            
            <Text style={styles.label}>Tutor IT Number</Text>
            <View style={{zIndex: 1000}}>
              <TextInput style={styles.input} placeholder="e.g. IT236" value={tutorId} onChangeText={handleTutorIdChange} />
              {searchSuggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {searchSuggestions.map((u, i) => (
                      <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectTutor(u.universityId)}>
                        <Text style={styles.suggestionText}>{u.universityId} - {u.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            <Text style={styles.label}>Module Code</Text>
            <View style={styles.pillContainer}>
              {MODULE_OPTIONS.map(mod => (
                <TouchableOpacity 
                   key={mod.code} 
                   style={[styles.pill, moduleCode === mod.code && styles.pillSelected]}
                   onPress={() => setModuleCode(mod.code)}>
                   <Text style={[styles.pillText, moduleCode === mod.code && styles.pillTextSelected]}>{mod.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.pickerBox} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerText}>{sessionDate ? sessionDate : 'Select Date'}</Text>
            </TouchableOpacity>
            
            <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Start Time</Text>
                    <TouchableOpacity style={styles.pickerBox} onPress={() => setShowStartTimePicker(true)}>
                      <Text style={styles.pickerText}>{startTime ? startTime : 'Start Time'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>End Time</Text>
                    <TouchableOpacity style={styles.pickerBox} onPress={() => setShowEndTimePicker(true)}>
                      <Text style={styles.pickerText}>{endTime ? endTime : 'End Time'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {showStartTimePicker && (
              <DateTimePicker
                value={startObj}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={endObj}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setBookModalVisible(false)} style={{padding: 10}}>
                 <Text style={{color: appTheme.colors.primary, fontWeight:'bold'}}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBookSession} style={{padding: 10}}>
                 <Text style={{color: appTheme.colors.primary, fontWeight:'bold'}}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isDeclineModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Decline Request</Text>
            <Text style={styles.label}>Reason for declining?</Text>
            <TextInput style={styles.input} placeholder="I have a class during this time" value={declineReason} onChangeText={setDeclineReason} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDeclineModalVisible(false)} style={{padding: 10}}>
                 <Text style={{color: appTheme.colors.primary, fontWeight:'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDecline} style={{padding: 10}}>
                 <Text style={{color: 'red', fontWeight:'bold'}}>Decline Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 15 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: appTheme.colors.textDark },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  empty: { color: '#888', fontStyle: 'italic', marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { backgroundColor: appTheme.colors.primary, padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  actionBtnOutline: { borderWidth: 1, borderColor: appTheme.colors.primary, padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnTextPrimary: { color: appTheme.colors.primary, fontWeight: 'bold' },
  historyCard: { backgroundColor: appTheme.colors.glassStrong, padding: 15, borderRadius: 8, flexDirection: 'row', alignItems:'center', marginBottom: 10, elevation: 1 },
  modCode: { fontSize: 18, fontWeight: 'bold', color: appTheme.colors.textDark },
  details: { fontSize: 14, color: '#555', marginTop: 2 },
  status: { fontSize: 13, fontWeight: 'bold', color: appTheme.colors.primary, marginTop: 5 },
  actionBox: { justifyContent: 'center' },
  delBtn: { backgroundColor: '#ffe5e5', padding: 8, borderRadius: 6 },
  delBtnText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: appTheme.colors.glassStrong, padding: 25, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: appTheme.colors.textDark },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 15, paddingVertical: 8, fontSize: 16 },
  pickerBox: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 15, paddingVertical: 12 },
  pickerText: { fontSize: 16, color: '#333' },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  pill: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 20 },
  pillSelected: { backgroundColor: appTheme.colors.primary },
  pillText: { color: '#333', fontWeight: 'bold' },
  pillTextSelected: { color: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  suggestionBox: { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: appTheme.colors.glassStrong, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, elevation: 10, zIndex: 1000, maxHeight: 150 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  suggestionText: { fontSize: 14, color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderColor: appTheme.colors.primary },
  tabText: { fontSize: 16, color: '#777', fontWeight: 'bold' },
  activeTabText: { color: appTheme.colors.primary },
  acceptBtn: { backgroundColor: '#e5f9e5', padding: 8, borderRadius: 6 },
  acceptBtnText: { color: 'green', fontWeight: 'bold', fontSize: 12 },
});

export default PeerSupportScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { campusEventApi } from '../../services/api';
import { appTheme } from '../../theme/appTheme';

const CreateEventScreen = ({ route, navigation }: any) => {
  const { currentUserId, event } = route.params; // If event is passed, we are editing
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [eventDate, setEventDate] = useState(event?.eventDate || ''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(event?.startTime || ''); // HH:mm:ss
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [type, setType] = useState(event?.type || 'UNIVERSITY_EVENT');

  const [dateObj, setDateObj] = useState(new Date());
  const [startObj, setStartObj] = useState(new Date());
  const [endObj, setEndObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title || !description || !location || !eventDate || !startTime || !endTime) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    const payload = {
      title,
      description,
      location,
      eventDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime, // Ensure HH:mm:ss
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      type
    };

    try {
      if (isEditing) {
        await campusEventApi.updateEvent(event.id, payload);
        Alert.alert('Success', 'Event updated successfully.');
      } else {
        await campusEventApi.createEvent(payload, currentUserId);
        Alert.alert('Success', 'Event created successfully.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Unable to save the event.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Event' : 'Create New Event'}</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event Title" />

      <Text style={styles.label}>Description *</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.label}>Location *</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Hall A, Main Campus" />

      <Text style={styles.label}>Date *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: eventDate ? '#000' : '#888', fontSize: 16 }}>
          {eventDate || 'Select Date'}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Start Time *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
            <Text style={{ color: startTime ? '#000' : '#888', fontSize: 16 }}>
              {startTime ? startTime.substring(0, 5) : 'Start Time'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
            <Text style={{ color: endTime ? '#000' : '#888', fontSize: 16 }}>
              {endTime ? endTime.substring(0, 5) : 'End Time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Event Type</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'UNIVERSITY_EVENT' && styles.typeBtnSelected]} 
          onPress={() => setType('UNIVERSITY_EVENT')}>
          <Text style={[styles.typeText, type === 'UNIVERSITY_EVENT' && styles.typeTextSelected]}>University</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, type === 'CAREER_FAIR' && styles.typeBtnSelected]} 
          onPress={() => setType('CAREER_FAIR')}>
          <Text style={[styles.typeText, type === 'CAREER_FAIR' && styles.typeTextSelected]}>Career Fair</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{isEditing ? 'Update Event' : 'Create Event'}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDateObj(selectedDate);
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              setEventDate(`${year}-${month}-${day}`);
            }
          }}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={startObj}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setStartObj(selectedTime);
              setStartTime(selectedTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
            }
          }}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={endObj}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setEndObj(selectedTime);
              setEndTime(selectedTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: appTheme.colors.textDark, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { backgroundColor: appTheme.colors.glassStrong, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  typeBtn: { flex: 1, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  typeBtnSelected: { backgroundColor: appTheme.colors.primary },
  typeText: { fontWeight: 'bold', color: '#444' },
  typeTextSelected: { color: '#fff' },
  saveBtn: { backgroundColor: appTheme.colors.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 50 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default CreateEventScreen;

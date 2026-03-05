import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimetableEvent } from '../../services/timetableService';

interface Props {
  visible: boolean;
  event: TimetableEvent | null;
  onClose: () => void;
  onFindAlternative: () => void;
  onAddPersonal: () => void;
  onMarkMissed: () => void;
}

const EventDetailModal = ({
  visible,
  event,
  onClose,
  onFindAlternative,
  onAddPersonal,
  onMarkMissed,
}: Props) => {
  if (!event) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>
            {event.moduleCode} {event.moduleName}
          </Text>
          <Text style={styles.line}>Type: {event.activityType}</Text>
          <Text style={styles.line}>Day: {event.dayOfWeek}</Text>
          <Text style={styles.line}>
            Time: {event.startTime} - {event.endTime}
          </Text>
          <Text style={styles.line}>Location: {event.location || 'N/A'}</Text>
          <Text style={styles.line}>Lecturer: {event.lecturer || 'N/A'}</Text>

          <TouchableOpacity style={styles.actionBtn} onPress={onFindAlternative}>
            <Text style={styles.actionText}>Find Alternative Slot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={onMarkMissed}>
            <Text style={styles.actionText}>Mark as Missed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={onAddPersonal}>
            <Text style={styles.actionText}>Add to Personal Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#102A43', marginBottom: 10 },
  line: { color: '#334E68', marginBottom: 6 },
  actionBtn: { backgroundColor: '#1864AB', padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  secondary: { backgroundColor: '#4C6F8C' },
  actionText: { color: '#fff', fontWeight: '700' },
  close: { textAlign: 'center', marginTop: 16, color: '#1864AB', fontWeight: '700' },
});

export default EventDetailModal;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { forumApi } from '../services/api';

const CreateQuestionScreen = ({ navigation, route }: any) => {
  const { moduleCode, currentUserId } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (title.length > 5) {
        checkDuplicates();
      } else {
        setDuplicates([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [title]);

  const checkDuplicates = async () => {
    try {
      setIsSearching(true);
      const res = await forumApi.getPotentialDuplicates(title, moduleCode);
      setDuplicates(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Validation Required', 'Please complete all fields.');
      return;
    }
    try {
      setSubmitting(true);
      await forumApi.createQuestion({
        title,
        content,
        moduleCode,
        universityId: currentUserId
      });
      Alert.alert('Success', 'Question posted successfully');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Question Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. How does Dijkstra's algorithm work?"
        value={title}
        onChangeText={setTitle}
      />

      {isSearching && <ActivityIndicator size="small" color="#0000ff" />}
      
      {duplicates.length > 0 && (
        <View style={styles.duplicateBox}>
          <Text style={styles.duplicateTitle}>⚠️ Potential Duplicates Detected:</Text>
          {duplicates.map(q => (
            <Text key={q.id} style={styles.duplicateItem}>- {q.title}</Text>
          ))}
          <Text style={styles.duplicateWarning}>Please check if these answer your doubt before posting.</Text>
        </View>
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Explain your doubt in detail..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Post Question</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  duplicateBox: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16, borderColor: '#FFEEBA', borderWidth: 1 },
  duplicateTitle: { fontWeight: 'bold', color: '#856404', marginBottom: 4 },
  duplicateItem: { color: '#856404', marginLeft: 8, fontSize: 14 },
  duplicateWarning: { color: '#856404', fontStyle: 'italic', marginTop: 8, fontSize: 12 },
  submitBtn: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateQuestionScreen;

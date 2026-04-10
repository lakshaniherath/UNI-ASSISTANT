import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { forumApi } from '../services/api';
import ForumCard from '../components/ForumCard';

const AcademicForumScreen = ({ navigation, route }: any) => {
  const { moduleCode, currentUserId } = route.params || { moduleCode: 'CS101', currentUserId: 'IT12345678' };
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchQuestions();
    }, [moduleCode])
  );

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await forumApi.getQuestionsByModule(moduleCode);
      const sorted = res.data.sort((a: any, b: any) => (b.upvotes - (b.downvotes || 0)) - (a.upvotes - (a.downvotes || 0)));
      setQuestions(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: number, upvote: boolean) => {
    try {
      await forumApi.voteQuestion(id, upvote, currentUserId);
      fetchQuestions();
    } catch (e: any) {
      if (e.response && e.response.status === 500 && e.response.data && e.response.data.message) {
        Alert.alert('Notice', e.response.data.message || 'It seems you have already voted or an error occurred.');
      } else {
        console.error(e);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await forumApi.deleteQuestion(id, currentUserId);
      fetchQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (item: any) => {
    setEditingQuestion(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      Alert.alert('Validation Required', 'Both title and content are required.');
      return;
    }
    try {
      await forumApi.updateQuestion(editingQuestion.id, { title: editTitle, content: editContent }, currentUserId);
      setEditModalVisible(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Unable to update the question.');
    }
  };

  const renderItem = ({ item, index }: any) => (
    <Animatable.View animation="fadeInUp" delay={index * 50} duration={500}>
      <TouchableOpacity onPress={() => navigation.navigate('QuestionDetail', { question: item, currentUserId })} activeOpacity={0.8}>
        <ForumCard 
          item={item} 
          currentUserId={currentUserId} 
          onVote={handleVote}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.headerTitle}>Forum: {moduleCode}</Text>
        <TouchableOpacity 
          style={styles.askBtn} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateQuestion', { moduleCode, currentUserId })}
        >
          <Text style={styles.askBtnText}>+ Ask</Text>
        </TouchableOpacity>
      </Animatable.View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No questions asked yet.</Text>}
        />
      )}

      {/* Edit Question Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Question</Text>
            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Question title"
            />
            <Text style={styles.modalLabel}>Content</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Question content"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#6200EE' 
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  askBtn: { backgroundColor: '#FFC107', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  askBtnText: { fontWeight: 'bold', color: '#333' },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  modalLabel: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12 },
  cancelBtnText: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AcademicForumScreen;

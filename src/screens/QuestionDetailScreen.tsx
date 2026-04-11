import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { forumApi } from '../services/api';
import ForumCard from '../components/ForumCard';

const QuestionDetailScreen = ({ route, navigation }: any) => {
  const { question, currentUserId } = route.params;
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qData, setQData] = useState(question);

  // Edit Question modal state
  const [editQuestionModalVisible, setEditQuestionModalVisible] = useState(false);
  const [editQTitle, setEditQTitle] = useState('');
  const [editQContent, setEditQContent] = useState('');

  // Edit Answer modal state
  const [editAnswerModalVisible, setEditAnswerModalVisible] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<any>(null);
  const [editAContent, setEditAContent] = useState('');

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const res = await forumApi.getAnswersForQuestion(question.id);
      const sorted = res.data.sort((a: any, b: any) => {
        if (a.isMostRecommended) return -1;
        if (b.isMostRecommended) return 1;
        return (b.upvotes || 0) - (a.upvotes || 0);
      });
      setAnswers(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;
    try {
      await forumApi.createAnswer({
        questionId: question.id,
        content: newAnswer,
        universityId: currentUserId
      });
      setNewAnswer('');
      fetchAnswers();
    } catch (e) {
      Alert.alert('Error', 'Failed to post answer');
    }
  };

  const handleVoteQuestion = async (id: number, upvote: boolean) => {
    try {
      const res = await forumApi.voteQuestion(id, upvote, currentUserId);
      setQData(res.data);
    } catch (e: any) {
      if (e.response?.status === 500) Alert.alert('Notice', 'You have already voted on this question.');
      else console.error(e);
    }
  };

  const handleVoteAnswer = async (id: number, upvote: boolean) => {
    try {
      await forumApi.voteAnswer(id, upvote, currentUserId);
      fetchAnswers();
    } catch (e: any) {
      if (e.response?.status === 500) Alert.alert('Notice', 'You have already voted on this answer.');
      else console.error(e);
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    try {
      await forumApi.deleteAnswer(id, currentUserId);
      fetchAnswers();
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Question
  const handleEditQuestion = (item: any) => {
    setEditQTitle(item.title);
    setEditQContent(item.content);
    setEditQuestionModalVisible(true);
  };

  const handleSaveEditQuestion = async () => {
    if (!editQTitle.trim() || !editQContent.trim()) {
      Alert.alert('Validation Required', 'Both title and content are required.');
      return;
    }
    try {
      const res = await forumApi.updateQuestion(qData.id, { title: editQTitle, content: editQContent }, currentUserId);
      setQData(res.data);
      setEditQuestionModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Unable to update the question.');
    }
  };

  // Edit Answer
  const handleEditAnswer = (item: any) => {
    setEditingAnswer(item);
    setEditAContent(item.content);
    setEditAnswerModalVisible(true);
  };

  const handleSaveEditAnswer = async () => {
    if (!editAContent.trim()) {
      Alert.alert('Error', 'Answer content cannot be empty');
      return;
    }
    try {
      await forumApi.updateAnswer(editingAnswer.id, { content: editAContent }, currentUserId);
      setEditAnswerModalVisible(false);
      setEditingAnswer(null);
      fetchAnswers();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update answer');
    }
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const path = await forumApi.downloadReport(question.id);
      Alert.alert('Success', `PDF saved to ${path}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to download report');
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={answers}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={(
          <View style={styles.headerArea}>
            <ForumCard 
              item={qData} 
              currentUserId={currentUserId} 
              onVote={handleVoteQuestion}
              onDelete={() => { /* parent deletes */ }}
              onEdit={handleEditQuestion} 
            />
            
            <TouchableOpacity style={styles.pdfBtn} onPress={handleDownloadReport} disabled={downloading}>
              {downloading ? <ActivityIndicator color="#fff" /> : <Text style={styles.pdfBtnText}>Download QA Report</Text>}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Answers ({answers.length})</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ForumCard 
            item={item} 
            isAnswer={true}
            currentUserId={currentUserId} 
            onVote={handleVoteAnswer}
            onDelete={handleDeleteAnswer}
            onEdit={handleEditAnswer} 
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No answers yet. Be the first!</Text> : <ActivityIndicator />}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Write your answer..."
          value={newAnswer}
          onChangeText={setNewAnswer}
          multiline
        />
        <TouchableOpacity style={styles.postBtn} onPress={handlePostAnswer}>
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Question Modal */}
      <Modal visible={editQuestionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Question</Text>
            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              value={editQTitle}
              onChangeText={setEditQTitle}
              placeholder="Question title"
            />
            <Text style={styles.modalLabel}>Content</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editQContent}
              onChangeText={setEditQContent}
              placeholder="Question content"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditQuestionModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEditQuestion}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Answer Modal */}
      <Modal visible={editAnswerModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Answer</Text>
            <Text style={styles.modalLabel}>Content</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editAContent}
              onChangeText={setEditAContent}
              placeholder="Answer content"
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditAnswerModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEditAnswer}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerArea: { marginBottom: 16 },
  pdfBtn: { backgroundColor: '#E91E63', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  pdfBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#333' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, maxHeight: 100 },
  postBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#2196F3', paddingHorizontal: 20, borderRadius: 20 },
  postBtnText: { color: '#fff', fontWeight: 'bold' },
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

export default QuestionDetailScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { api, resourceApi } from '../services/api';
import { appTheme } from '../theme/appTheme';

const CATEGORIES = [
  "Past Papers", "Lecture Notes", "Short Notes", 
  "Lecture Videos", "Kuppi Videos", "Assignments", 
  "Lab Tests", "Projects"
];

const UploadResourceScreen = ({ navigation, route }: any) => {
  const { moduleCode, currentUserId, defaultCategory } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(defaultCategory || CATEGORIES[0]);
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      setFile(res[0]);
    } catch (err: any) {
      if (err.code === 'OPERATION_CANCELED' || err.code === 'DOCUMENT_PICKER_CANCELED') {
        // User cancelled
      } else {
        console.error(err);
      }
    }
  };

  const handleUpload = async () => {
    if (!title || !file) {
      Alert.alert('Validation Required', 'Please provide a title and select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: file.fileCopyUri || file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name,
      } as any);

      formData.append('uploaderId', currentUserId);
      formData.append('moduleCode', moduleCode);
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);

      // Send to backend via FormData
      await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          }
        }
      });

      Alert.alert('Success', 'The resource has been uploaded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'An error occurred while uploading your file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Upload to {moduleCode}</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput 
        style={styles.input} 
        value={title} 
        onChangeText={setTitle} 
        placeholder="E.g., Midterm Past Paper 2023"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Brief description (optional)"
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catPill, category === cat && styles.catPillSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catPillText, category === cat && styles.catPillTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>File *</Text>
      <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
        <Text style={styles.filePickerText}>
          {file ? `📎 ${file.name}` : '📁 Tap to Select File'}
        </Text>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.submitBtn, uploading && styles.submitBtnDisabled]} 
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Upload Resource</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: appTheme.colors.bg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appTheme.colors.textDark,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: appTheme.colors.textDark,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: appTheme.colors.glassStrong,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 16,
  },
  catPillSelected: {
    backgroundColor: appTheme.colors.primary,
  },
  catPillText: {
    color: '#333',
  },
  catPillTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filePicker: {
    borderWidth: 2,
    borderColor: appTheme.colors.accent,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: appTheme.colors.glassStrong,
  },
  filePickerText: {
    fontSize: 16,
    color: appTheme.colors.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressText: {
    fontSize: 14,
    color: appTheme.colors.textDark,
    marginBottom: 5,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: appTheme.colors.primary,
  },
  submitBtn: {
    backgroundColor: appTheme.colors.primaryStrong,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default UploadResourceScreen;

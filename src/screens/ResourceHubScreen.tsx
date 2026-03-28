import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { useFocusEffect } from '@react-navigation/native';
import { resourceApi, api } from '../services/api';
import { appTheme } from '../theme/appTheme';

const CATEGORIES = [
  "Past Papers", "Lecture Notes", "Short Notes", 
  "Lecture Videos", "Kuppi Videos", "Assignments", 
  "Lab Tests", "Projects"
];

const ResourceHubScreen = ({ navigation, route }: any) => {
  const { moduleCode, userData } = route.params;
  const currentUserId = userData?.universityId || "IT00000000";

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1]); // Default to Lecture Notes
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  useFocusEffect(
    useCallback(() => {
      fetchResources();
    }, [moduleCode])
  );

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getResourcesByModule(moduleCode);
      setResources(res.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (item: any) => {
    try {
      if (!item.firebaseStorageUrl) {
        Alert.alert('Error', 'The file URL could not be found.');
        return;
      }
      
      const fileName = item.fileName || `file_${item.id}`;
      const destPath = Platform.OS === 'android' 
         ? `${RNFS.DownloadDirectoryPath}/${fileName}` 
         : `${RNFS.DocumentDirectoryPath}/${fileName}`;
         
      setDownloadProgress(prev => ({ ...prev, [item.id.toString()]: 0 }));

      const ret = RNFS.downloadFile({
        fromUrl: item.firebaseStorageUrl,
        toFile: destPath,
        progressDivider: 1,
        progress: (res) => {
          let progressPercent = 0;
          if (res.contentLength > 0) {
            progressPercent = Math.round((res.bytesWritten / res.contentLength) * 100);
          }
          setDownloadProgress(prev => ({ ...prev, [item.id.toString()]: progressPercent }));
        }
      });

      await ret.promise;
      
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[item.id.toString()];
        return newProgress;
      });

      Alert.alert('Success', `Downloaded to ${destPath}`);
      await resourceApi.registerDownload(item.id);
      fetchResources(); 
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to download the file.');
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[item.id.toString()];
        return newProgress;
      });
    }
  };

  const handleBulkDownload = async () => {
    try {
      const url = `${api.defaults.baseURL}/resources/module/${moduleCode}/zip`;
      const fileName = `${moduleCode}_resources.zip`;
      const destPath = Platform.OS === 'android' 
         ? `${RNFS.DownloadDirectoryPath}/${fileName}` 
         : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      setDownloadProgress(prev => ({ ...prev, ['bulk']: 0 }));

      const ret = RNFS.downloadFile({
        fromUrl: url,
        toFile: destPath,
        progressDivider: 1,
        progress: (res) => {
          let progressPercent = 0;
          if (res.contentLength > 0) {
            progressPercent = Math.round((res.bytesWritten / res.contentLength) * 100);
          }
          setDownloadProgress(prev => ({ ...prev, ['bulk']: progressPercent }));
        }
      });

      await ret.promise;
      Alert.alert('Success', `Downloaded to ${destPath}`);
      
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'The bulk download failed.');
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress['bulk'];
        return newProgress;
      });
    }
  };

  const handleGetReport = async () => {
    try {
      const url = `${api.defaults.baseURL}/resources/module/${moduleCode}/report`;
      const fileName = `${moduleCode}_report.pdf`;
      const destPath = Platform.OS === 'android' 
         ? `${RNFS.DownloadDirectoryPath}/${fileName}` 
         : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      setDownloadProgress(prev => ({ ...prev, ['report']: 0 }));

      const ret = RNFS.downloadFile({
        fromUrl: url,
        toFile: destPath,
        progressDivider: 1,
        progress: (res) => {
          let progressPercent = 0;
          if (res.contentLength > 0) {
            progressPercent = Math.round((res.bytesWritten / res.contentLength) * 100);
          }
          setDownloadProgress(prev => ({ ...prev, ['report']: progressPercent }));
        }
      });

      await ret.promise;
      Alert.alert('Success', `Report downloaded to ${destPath}`);
      
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'The report download failed.');
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress['report'];
        return newProgress;
      });
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      await resourceApi.upvoteResource(id);
      fetchResources();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number, uploaderId: string) => {
    try {
      if (currentUserId !== uploaderId) {
        Alert.alert('Permission Denied', 'You are only authorized to delete your own files.');
        return;
      }
      await resourceApi.deleteResource(id, currentUserId);
      fetchResources();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to delete the resource.');
    }
  };

  const filteredResources = resources.filter(r => r.category === selectedCategory);
  
  // Sort by upvotes for quality rendering
  const sortedResources = [...filteredResources].sort((a, b) => b.upvotes - a.upvotes);

  const renderResourceItem = ({ item }: any) => {
    const isOwner = item.uploaderId === currentUserId;
    return (
      <View style={styles.resourceCard}>
        <View style={styles.cardContent}>
          <Text style={styles.resourceTitle}>{item.title || item.fileName}</Text>
          {item.description ? <Text style={styles.resourceDesc}>{item.description}</Text> : null}
          <Text style={styles.resourceMeta}>Uploaded by: {item.uploaderId} • ▲ {item.upvotes} • ↓ {item.downloads}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtnItem} onPress={() => handleDownloadFile(item)}>
            <Text style={styles.actionBtnText}>Preview / Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnItem} onPress={() => handleUpvote(item.id)}>
            <Text style={styles.actionBtnText}>Upvote</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity style={[styles.actionBtnItem, styles.deleteBtn]} onPress={() => handleDelete(item.id, item.uploaderId)}>
              <Text style={[styles.actionBtnText, {color: '#fff'}]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        {downloadProgress[item.id.toString()] !== undefined && (
          <View style={styles.resourceProgressContainer}>
            <Text style={styles.resourceProgressText}>Downloading... {downloadProgress[item.id.toString()]}%</Text>
            <View style={styles.resourceProgressBarBg}>
              <View style={[styles.resourceProgressBarFill, { width: `${downloadProgress[item.id.toString()]}%` }]} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{moduleCode} Resource Hub</Text>
      </View>

      <View style={styles.specialActionsRow}>
        <View style={styles.specialActionContainer}>
          <TouchableOpacity style={styles.specialBtn} onPress={handleBulkDownload}>
            <Text style={styles.specialBtnText}>📦 Download All (ZIP)</Text>
          </TouchableOpacity>
          {downloadProgress['bulk'] !== undefined && (
            <View style={styles.miniProgressContainer}>
              <View style={[styles.miniProgressBar, { width: `${downloadProgress['bulk']}%` }]} />
            </View>
          )}
        </View>
        <View style={styles.specialActionContainer}>
          <TouchableOpacity style={styles.specialBtn} onPress={handleGetReport}>
            <Text style={styles.specialBtnText}>📄 Usage Report (PDF)</Text>
          </TouchableOpacity>
          {downloadProgress['report'] !== undefined && (
            <View style={styles.miniProgressContainer}>
              <View style={[styles.miniProgressBar, { width: `${downloadProgress['report']}%` }]} />
            </View>
          )}
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryTab, selectedCategory === item && styles.categoryTabSelected]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryTabText, selectedCategory === item && styles.categoryTabTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={appTheme.colors.accent} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={sortedResources}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResourceItem}
          contentContainerStyle={styles.resourceList}
          ListEmptyComponent={<Text style={styles.emptyText}>No {selectedCategory} uploaded yet.</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('UploadResource', { moduleCode, currentUserId, defaultCategory: selectedCategory })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg },
  header: { 
    padding: 20, 
    backgroundColor: appTheme.colors.primaryStrong, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  specialActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    ...appTheme.shadow.card,
    zIndex: 1
  },
  specialBtn: {
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  specialBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14
  },
  specialActionContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  miniProgressContainer: {
    width: '90%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: appTheme.colors.accent,
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryTabSelected: {
    backgroundColor: appTheme.colors.primary,
  },
  categoryTabText: {
    color: '#666',
    fontWeight: '600',
  },
  categoryTabTextSelected: {
    color: '#fff',
  },
  resourceList: {
    padding: 16,
    paddingBottom: 80, // for FAB
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...appTheme.shadow.card,
  },
  cardContent: {
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appTheme.colors.textDark,
  },
  resourceDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtnItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#e53935'
  },
  actionBtnText: {
    color: appTheme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13
  },
  resourceProgressContainer: {
    marginTop: 12,
  },
  resourceProgressText: {
    fontSize: 12,
    color: appTheme.colors.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  resourceProgressBarBg: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  resourceProgressBarFill: {
    height: '100%',
    backgroundColor: appTheme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: appTheme.colors.accent,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...appTheme.shadow.card,
  },
  fabText: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
  }
});

export default ResourceHubScreen;

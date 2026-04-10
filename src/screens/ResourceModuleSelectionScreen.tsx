import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { appTheme } from '../theme/appTheme';

const MODULES = [
  { code: 'IT3010', name: 'NDM' },
  { code: 'IT3020', name: 'DS' },
  { code: 'IT3030', name: 'PAF' },
  { code: 'IT3040', name: 'ITPM' },
  { code: 'IT3050', name: 'ESD' },
];

const ResourceModuleSelectionScreen = ({ navigation, route }: any) => {
  const { userData, currentUserId } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Module</Text>
        <Text style={styles.subtitle}>Choose a subject to access its Resource Hub</Text>
      </View>
      <View style={styles.list}>
        {MODULES.map((mod) => (
          <TouchableOpacity 
            key={mod.code} 
            style={styles.card}
            onPress={() => navigation.navigate('ResourceHub', { 
              moduleCode: mod.code,
              userData: userData || { universityId: currentUserId } 
            })}
          >
            <Text style={styles.cardCode}>{mod.code}: {mod.name}</Text>
            <Text style={styles.cardName}>Enter Resource Hub</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg },
  header: { 
    padding: 24, 
    backgroundColor: appTheme.colors.primaryStrong, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  list: { padding: 16 },
  card: {
    backgroundColor: appTheme.colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: appTheme.colors.accent,
    ...appTheme.shadow.card,
  },
  cardCode: { fontSize: 18, fontWeight: 'bold', color: appTheme.colors.textDark },
  cardName: { fontSize: 14, color: appTheme.colors.textDarkSoft, marginTop: 4, fontWeight: '600' },
});

export default ResourceModuleSelectionScreen;

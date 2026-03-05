import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../services/api';

// Expanded list of skills covering development, design, management, and documentation
const AVAILABLE_SKILLS = [
  "Java", "React", "React Native", "Spring Boot", 
  "Node.js", "Python", "C++", "SQL", "MongoDB", "Firebase",
  "Git/GitHub", "API Development",
  "UI/UX Design", "Figma", "QA/Testing", 
  "Project Management", "Agile/Scrum", "Time Management", 
  "Team Collaboration", "Leadership", "Problem Solving",
  "System Documentation", "Report Writing", "Technical Writing",
  "Presentation Preparation", "Public Speaking/Presenting", "Video Editing"
];

// Pre-defined CGPA target ranges
const CGPA_RANGES = [
  "0.5 - 1.0", "1.0 - 1.5", "1.5 - 2.0", 
  "2.0 - 2.5", "2.5 - 3.0", "3.0 - 3.5", "3.5 - 4.0"
];

const CreateGroupScreen = ({ route, navigation }: any) => {
  const { userData } = route.params; 
  const [groupData, setGroupData] = useState({
    groupName: '',
    description: '',
    maxMembers: '4',
    subgroup: userData.subgroup 
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCGPA, setSelectedCGPA] = useState<string>('');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleCreate = async () => {
    if (!groupData.groupName || !groupData.description) {
      Alert.alert('Validation Error', 'Please enter a group name and description.');
      return;
    }

    if (selectedSkills.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one required skill.');
      return;
    }

    if (!selectedCGPA) {
      Alert.alert('Validation Error', 'Please select a target CGPA range.');
      return;
    }

    const payload = {
      groupName: groupData.groupName,
      description: groupData.description,
      subgroup: groupData.subgroup,
      maxMembers: parseInt(groupData.maxMembers) || 4,
      requiredSkills: selectedSkills,
      targetCGPA: selectedCGPA,
    };

    try {

      await api.post('/groups/create', payload, {
        params: { creatorId: userData.universityId }
      });

      Alert.alert('Success! 🎉', 'Your study group has been created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage =
        typeof error?.response?.data === 'string'
          ? error.response.data
          : error?.response?.data?.message || error?.message;

      console.log('Create group failed:', {
        status,
        url: error?.config?.url,
        method: error?.config?.method,
        payload,
        serverMessage,
      });

      Alert.alert(
        'Creation Failed',
        status ? `Server Error ${status}: ${serverMessage || 'Unknown error'}` : 'Unable to create the group. Please try again later.'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Study Group</Text>
      <Text style={styles.subText}>Subgroup: {userData.subgroup}</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Group Name (e.g. ITPM Alpha Team)" 
        onChangeText={(txt) => setGroupData({...groupData, groupName: txt})} 
      />
      <TextInput 
        style={[styles.input, {height: 90, textAlignVertical: 'top'}]} 
        placeholder="Description" 
        multiline 
        onChangeText={(txt) => setGroupData({...groupData, description: txt})} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Max Members (Default: 4)" 
        keyboardType="numeric" 
        onChangeText={(txt) => setGroupData({...groupData, maxMembers: txt})} 
      />

      <Text style={styles.label}>Target CGPA Range:</Text>
      <View style={styles.skillsContainer}>
        {CGPA_RANGES.map((cgpa) => {
          const isSelected = selectedCGPA === cgpa;
          return (
            <TouchableOpacity 
              key={cgpa}
              style={[styles.skillChip, isSelected && styles.cgpaChipSelected]}
              onPress={() => setSelectedCGPA(isSelected ? '' : cgpa)}
            >
              <Text style={[styles.skillText, isSelected && styles.skillTextSelected]}>
                {cgpa}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Required Skills:</Text>
      <View style={styles.skillsContainer}>
        {AVAILABLE_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          return (
            <TouchableOpacity 
              key={skill}
              style={[styles.skillChip, isSelected && styles.skillChipSelected]}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={[styles.skillText, isSelected && styles.skillTextSelected]}>
                {skill}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#102A43', marginBottom: 5 },
  subText: { fontSize: 14, color: '#1864AB', marginBottom: 20, fontWeight: '600' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D9E2EC' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#334E68', marginBottom: 10, marginTop: 5 },
  
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  skillChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  skillChipSelected: { backgroundColor: '#1864AB', borderColor: '#1864AB' },
  cgpaChipSelected: { backgroundColor: '#E67700', borderColor: '#E67700' }, 
  skillText: { color: '#627D98', fontSize: 14, fontWeight: '500' },
  skillTextSelected: { color: '#fff' },

  button: { backgroundColor: '#1864AB', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CreateGroupScreen;

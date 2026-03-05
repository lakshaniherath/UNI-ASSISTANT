import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../services/api';

// 🚀 ඔයා ලබාදුන් සම්පූර්ණ Skills සහ CGPA ලැයිස්තුව
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

const CGPA_RANGES = [
  "0.5 - 1.0", "1.0 - 1.5", "1.5 - 2.0", 
  "2.0 - 2.5", "2.5 - 3.0", "3.0 - 3.5", "3.5 - 4.0"
];

const ProfileSetupScreen = ({ route, navigation }: any) => {
  const { userData } = route.params;
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCGPA, setSelectedCGPA] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const saveProfile = async () => {
    try {
      // Backend එකේ අපි හදපු @PutMapping("/{universityId}/profile") endpoint එකට දත්ත යැවීම
      await api.put(`/users/${userData.universityId}/profile`, {
        cgpa: selectedCGPA,
        mySkills: selectedSkills
      });
      // Updated userData එක Home එකට ආපසු යවමු
      const updatedUserData = { ...userData, cgpa: selectedCGPA, mySkills: selectedSkills };
      Alert.alert("Success! 🎉", "ඔබේ Profile එක යාවත්කාලීන කරන ලදී. දැන් ඔබට ගැලපෙන කණ්ඩායම් පරීක්ෂා කළ හැක.");
      navigation.navigate('Home', { userData: updatedUserData });
    } catch (error) {
      Alert.alert("Error", "Profile එක යාවත්කාලීන කිරීමට නොහැකි විය.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setup Your Profile</Text>
      
      <Text style={styles.label}>Select Your Expertise (Skills):</Text>
      <View style={styles.chipGroup}>
        {AVAILABLE_SKILLS.map(skill => (
          <TouchableOpacity 
            key={skill} 
            style={[styles.chip, selectedSkills.includes(skill) && styles.selectedChip]} 
            onPress={() => toggleSkill(skill)}
          >
            <Text style={selectedSkills.includes(skill) ? styles.whiteText : styles.blueText}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Current CGPA Range:</Text>
      <View style={styles.chipGroup}>
        {CGPA_RANGES.map(range => (
          <TouchableOpacity 
            key={range} 
            style={[styles.chip, selectedCGPA === range && styles.selectedCGPA]} 
            onPress={() => setSelectedCGPA(range)}
          >
            <Text style={selectedCGPA === range ? styles.whiteText : styles.orangeText}>{range}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
        <Text style={styles.saveBtnText}>Save Profile</Text>
      </TouchableOpacity>
      <View style={{ height: 50 }} /> 
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#102A43' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#334E68' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1864AB', borderRadius: 20, marginRight: 8, marginBottom: 10 },
  selectedChip: { backgroundColor: '#1864AB' },
  selectedCGPA: { backgroundColor: '#E67E22', borderColor: '#E67E22' },
  whiteText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  blueText: { color: '#1864AB', fontSize: 13 },
  orangeText: { color: '#E67E22', fontSize: 13 },
  saveBtn: { backgroundColor: '#1864AB', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center', elevation: 2 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileSetupScreen;
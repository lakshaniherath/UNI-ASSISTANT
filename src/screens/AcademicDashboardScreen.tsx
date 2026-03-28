import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { academicApi } from '../services/api';
import { appTheme } from '../theme/appTheme';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Y1S1' }, { value: '2', label: 'Y1S2' },
  { value: '3', label: 'Y2S1' }, { value: '4', label: 'Y2S2' },
  { value: '5', label: 'Y3S1' }, { value: '6', label: 'Y3S2' },
  { value: '7', label: 'Y4S1' }, { value: '8', label: 'Y4S2' },
];

const MODULE_OPTIONS = [
  { code: 'IT3010', name: 'NDM', credits: 4 },
  { code: 'IT3020', name: 'DS', credits: 4 },
  { code: 'IT3030', name: 'PAF', credits: 4 },
  { code: 'IT3040', name: 'ITPM', credits: 3 },
  { code: 'IT3050', name: 'ESD', credits: 2 },
];

const GRADE_OPTIONS = [
  { value: 'A+', points: 4.0 }, { value: 'A', points: 4.0 }, { value: 'A-', points: 3.7 },
  { value: 'B+', points: 3.3 }, { value: 'B', points: 3.0 }, { value: 'B-', points: 2.7 },
  { value: 'C+', points: 2.3 }, { value: 'C', points: 2.0 }, { value: 'E', points: 0.0 },
];

const getGradePoint = (grade: string) => {
  const found = GRADE_OPTIONS.find(g => g.value === grade.toUpperCase());
  return found ? found.points : 0.0;
};

const AcademicDashboardScreen = ({ route, navigation }: any) => {
  const { currentUserId } = route.params;

  const [results, setResults] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [semester, setSemester] = useState('1');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');

  // Predictor State
  const [isPredictorVisible, setPredictorVisible] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  const [prediction, setPrediction] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await academicApi.getResultsByStudent(currentUserId);
      setResults(res.data);
      const cgpaRes = await academicApi.getCGPA(currentUserId);
      setCgpa(cgpaRes.data);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Unable to fetch academic data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const handleAddResult = async () => {
    if (!moduleCode || !credits || !grade) {
      Alert.alert('Validation Required', 'Please complete all required fields.');
      return;
    }
    const gp = getGradePoint(grade);
    const payload = {
      studentId: currentUserId,
      semester: parseInt(semester),
      moduleCode,
      moduleName,
      credits: parseInt(credits),
      grade: grade.toUpperCase(),
      gradePoint: gp,
    };

    try {
      await academicApi.createResult(payload);
      setAddModalVisible(false);
      fetchDashboardData();
      
      setModuleCode('');
      setModuleName('');
      setCredits('');
      setGrade('');
    } catch (e) {
      Alert.alert('Error', 'Unable to save the result.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await academicApi.deleteResult(id);
      fetchDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Unable to delete the result.');
    }
  };

  const handlePredict = async () => {
    if (!targetCGPA || !remainingCredits) return;
    try {
      const res = await academicApi.predictGPA(currentUserId, parseFloat(targetCGPA), parseInt(remainingCredits));
      setPrediction(res.data);
    } catch (e) {
      Alert.alert('Error', 'Prediction failed. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Download Initiated', 'Your PDF is being generated. Please wait.');
      // Normally here you'd use RNFS or similar to stream the blob to local disk
      await academicApi.downloadReport(currentUserId);
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'An error occurred while downloading the PDF.');
    }
  };

  const semesters = [...new Set(results.map(r => r.semester))].sort((a,b)=>a-b);
  const trendData = semesters.map(sem => {
    const semResults = results.filter(r => r.semester === sem);
    const tPoints = semResults.reduce((acc, r) => acc + (r.gradePoint * r.credits), 0);
    const tCredits = semResults.reduce((acc, r) => acc + r.credits, 0);
    return tCredits > 0 ? (tPoints / tCredits) : 0;
  });

  const chartData = {
    labels: semesters.length > 0 ? semesters.map(s => `Sem ${s}`) : ['None'],
    datasets: [{ data: trendData.length > 0 ? trendData : [0] }]
  };

  const completedCredits = results.reduce((acc, r) => acc + r.credits, 0);
  const totalDegreeCredits = 120; // Example average target
  const pieData = [
    { name: 'Completed', credits: completedCredits, color: appTheme.colors.primary, legendFontColor: '#333', legendFontSize: 13 },
    { name: 'Remaining', credits: Math.max(0, totalDegreeCredits - completedCredits), color: '#ddd', legendFontColor: '#333', legendFontSize: 13 }
  ];

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent:'center' }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Hub</Text>
        <Text style={styles.cgpa}>CGPA: {cgpa.toFixed(2)}</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Progress Trends</Text>
        {semesters.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: appTheme.colors.primary }
            }}
            bezier
            style={styles.chart}
          />
        ) : <Text style={styles.emptyText}>Add results to see your trend</Text>}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Credit Distribution</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 60}
          height={150}
          chartConfig={{ color: () => '#000' }}
          accessor={"credits"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          absolute
        />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.btnText}>+ Log Grade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => setPredictorVisible(true)}>
          <Text style={styles.btnTextDark}>Predictor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline} onPress={handleDownloadPDF}>
          <Text style={styles.btnTextPrimary}>📄 Generate Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>History</Text>
        {results.map((item, idx) => (
          <View key={idx} style={styles.historyCard}>
            <View>
              <Text style={styles.modCode}>{item.moduleCode}</Text>
              <Text style={styles.modName}>Sem {item.semester} • {item.credits} Cr</Text>
            </View>
            <View style={styles.gradeBox}>
              <Text style={styles.gradeTxt}>{item.grade}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delBtn}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add Grade Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Result</Text>
            
            <Text style={styles.label}>Select Semester</Text>
            <View style={styles.pillContainer}>
              {SEMESTER_OPTIONS.map(sem => (
                <TouchableOpacity 
                   key={sem.value} 
                   style={[styles.pill, semester === sem.value && styles.pillSelected]}
                   onPress={() => setSemester(sem.value)}>
                   <Text style={[styles.pillText, semester === sem.value && styles.pillTextSelected]}>{sem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Select Module</Text>
            <View style={styles.pillContainer}>
              {MODULE_OPTIONS.map(mod => (
                <TouchableOpacity 
                   key={mod.code} 
                   style={[styles.pill, moduleCode === mod.code && styles.pillSelected]}
                   onPress={() => {
                     setModuleCode(mod.code);
                     setModuleName(mod.name);
                     setCredits(mod.credits.toString());
                   }}>
                   <Text style={[styles.pillText, moduleCode === mod.code && styles.pillTextSelected]}>{mod.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {moduleCode ? <Text style={styles.helperText}>{moduleName} • {credits} Credits</Text> : null}

            <Text style={styles.label}>Select Grade</Text>
            <View style={styles.pillContainer}>
              {GRADE_OPTIONS.map(g => (
                <TouchableOpacity 
                   key={g.value} 
                   style={[styles.pill, grade === g.value && styles.pillSelected]}
                   onPress={() => setGrade(g.value)}>
                   <Text style={[styles.pillText, grade === g.value && styles.pillTextSelected]}>{g.value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setAddModalVisible(false)} />
              <Button title="Save" onPress={handleAddResult} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Predictor Modal */}
      <Modal visible={isPredictorVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Smart Predictor</Text>
            <Text style={styles.promptText}>Find out the minimum GPA you need to maintain to reach a target CGPA.</Text>
            <TextInput style={styles.input} placeholder="Target CGPA (out of 4.0)" value={targetCGPA} onChangeText={setTargetCGPA} keyboardType="numeric"/>
            <TextInput style={styles.input} placeholder="Est. Remaining Credits in Degree" value={remainingCredits} onChangeText={setRemainingCredits} keyboardType="numeric" />
            
            <TouchableOpacity style={styles.predictBtnCore} onPress={handlePredict}>
              <Text style={styles.btnText}>Calculate</Text>
            </TouchableOpacity>

            {prediction && (
              <View style={styles.predResult}>
                <Text>Current standing: {prediction.currentCGPA} CGPA</Text>
                <Text style={styles.highlight}>Required Minimum GPA: {prediction.requiredGPA}</Text>
                <Text style={prediction.isPossible ? styles.successTxt : styles.errorTxt}>
                  {prediction.isPossible ? "✅ This is mathematically achievable!" : "❌ Impossible with remaining credits."}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Button title="Close" onPress={() => setPredictorVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const Button = ({title, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={{padding: 10}}><Text style={{color: appTheme.colors.primary, fontWeight:'bold'}}>{title}</Text></TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.bg, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: appTheme.colors.textDark },
  cgpa: { fontSize: 22, fontWeight: 'bold', color: appTheme.colors.primary },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 30, marginBottom: 30 },
  chart: { borderRadius: 12, alignSelf:'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, marginBottom: 20 },
  actionBtn: { backgroundColor: appTheme.colors.primary, padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', minWidth: '30%' },
  actionBtnSecondary: { backgroundColor: '#eee', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', minWidth: '30%' },
  actionBtnOutline: { borderWidth: 1, borderColor: appTheme.colors.primary, padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', minWidth: '30%' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnTextDark: { color: '#333', fontWeight: 'bold' },
  btnTextPrimary: { color: appTheme.colors.primary, fontWeight: 'bold' },
  historySection: { marginBottom: 40 },
  historyCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginBottom: 10, elevation: 1 },
  modCode: { fontSize: 16, fontWeight: 'bold' },
  modName: { fontSize: 13, color: '#666', marginTop: 2 },
  gradeBox: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  gradeTxt: { fontSize: 20, fontWeight: 'bold', color: appTheme.colors.primary },
  delBtn: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: appTheme.colors.textDark },
  promptText: { fontSize: 14, color: '#555', marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, paddingVertical: 10, fontSize: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#444' },
  helperText: { fontSize: 14, color: '#666', marginBottom: 15, fontStyle: 'italic' },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  pill: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#eee', borderRadius: 20 },
  pillSelected: { backgroundColor: appTheme.colors.primary },
  pillText: { color: '#333', fontWeight: 'bold' },
  pillTextSelected: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  predictBtnCore: { backgroundColor: appTheme.colors.accent, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  predResult: { marginTop: 20, padding: 15, backgroundColor: '#f0f4ff', borderRadius: 8 },
  highlight: { fontSize: 18, fontWeight: 'bold', color: appTheme.colors.primary, marginVertical: 8 },
  successTxt: { color: 'green', fontWeight: 'bold' },
  errorTxt: { color: 'red', fontWeight: 'bold' }
});

export default AcademicDashboardScreen;

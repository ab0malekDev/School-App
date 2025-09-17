import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, Subject } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SECTIONS = [
  { id: 'scientific', name: 'علمي' },
  { id: 'literary', name: 'أدبي' },
  { id: 'intensive', name: 'مكثفات' },
];

const AddUnit = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [unitName, setUnitName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedSection) {
      fetchSubjects(selectedSection);
      setSelectedSubject(null);
    }
  }, [selectedSection]);

  const fetchSubjects = async (sectionId: string) => {
    try {
      const data = await api.subjects.getBySection(sectionId);
      setSubjects(data);
    } catch (err) {
      setSubjects([]);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المواد');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedSubject || !unitName.trim()) {
      Alert.alert('خطأ', 'يرجى اختيار القسم والمادة وكتابة اسم الوحدة');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.units.create(selectedSubject.id, { name: unitName, order: 0 });
      Alert.alert('نجاح', 'تمت إضافة الوحدة بنجاح');
      navigation.goBack();
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الوحدة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة وحدة جديدة</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>اختر القسم</Text>
        <View style={styles.rowList}>
          {SECTIONS.map(section => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionButton, selectedSection === section.id && styles.selectedButton]}
              onPress={() => setSelectedSection(section.id)}
            >
              <Text style={selectedSection === section.id ? styles.selectedButtonText : styles.sectionButtonText}>{section.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedSection && (
          <>
            <Text style={styles.label}>اختر المادة</Text>
            <View style={styles.rowList}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject.id}
                  style={[styles.subjectButton, selectedSubject?.id === subject.id && styles.selectedButton]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text style={selectedSubject?.id === subject.id ? styles.selectedButtonText : styles.subjectButtonText}>{subject.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {selectedSubject && (
          <>
            <Text style={styles.label}>اسم الوحدة</Text>
            <TextInput
              style={styles.input}
              value={unitName}
              onChangeText={setUnitName}
              placeholder="أدخل اسم الوحدة"
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>حفظ الوحدة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#E31E24',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rowList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  sectionButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 90,
    alignItems: 'center',
  },
  sectionButtonText: { color: '#333', fontSize: 17 },
  subjectButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 90,
    alignItems: 'center',
  },
  subjectButtonText: { color: '#333', fontSize: 16 },
  selectedButton: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#E31E24',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddUnit; 
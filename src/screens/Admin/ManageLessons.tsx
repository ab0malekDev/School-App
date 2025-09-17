import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api, Lesson, Subject, Unit } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getImageUrl = (imageName: string) => {
  return `${API_URL}/uploads/subjects/${imageName}`;
};

const renderSubjectImage = (subject: Subject) => {
  if (!subject.image) return null;
  const imageUrl = getImageUrl(subject.image);
  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.subjectImage}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
};

const ManageLessons = () => {
  const navigation = useNavigation<NavigationProp>();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editUnitModalVisible, setEditUnitModalVisible] = useState(false);
  const [editLessonModalVisible, setEditLessonModalVisible] = useState(false);
  const [unitEditValue, setUnitEditValue] = useState('');
  const [lessonEditValue, setLessonEditValue] = useState({ name: '', description: '', isFree: false });
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.subjects.getAll();
      setSubjects(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المواد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setLessons([]);
  };

  const handleUnitPress = async (unit: Unit) => {
    setSelectedUnit(unit);
    setLoading(true);
    setError(null);
    try {
      const data = await api.lessons.getAll(selectedSubject!.id, unit.id);
      setLessons(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الدروس');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedUnit) {
      setSelectedUnit(null);
      setLessons([]);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      navigation.goBack();
    }
  };

  // SUBJECT ACTIONS
  const handleEditSubject = (subject: Subject) => {
    navigation.navigate('AddSubject', { subject });
  };
  const handleDeleteSubject = (subject: Subject) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف المادة "${subject.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          try {
            await api.subjects.delete(subject.id);
            setSubjects(subjects.filter(s => s.id !== subject.id));
            setSelectedSubject(null);
            setSelectedUnit(null);
            setLessons([]);
            Alert.alert('نجاح', 'تم حذف المادة بنجاح');
          } catch (err) {
            Alert.alert('خطأ', 'حدث خطأ أثناء حذف المادة');
          }
        }
      }
    ]);
  };

  // UNIT ACTIONS
  const handleEditUnit = (unit: Unit) => {
    setUnitToEdit(unit);
    setUnitEditValue(unit.name);
    setEditUnitModalVisible(true);
  };
  const handleSaveUnitEdit = async () => {
    if (!selectedSubject || !unitToEdit) return;
    try {
      await api.units.update(selectedSubject.id, unitToEdit.id, { name: unitEditValue, order: (unitToEdit as any).order || 0 });
      // update local state
      const updatedUnits = selectedSubject.units.map(u => u.id === unitToEdit.id ? { ...u, name: unitEditValue } : u);
      setSelectedSubject({ ...selectedSubject, units: updatedUnits });
      setEditUnitModalVisible(false);
      setUnitToEdit(null);
      setUnitEditValue('');
      Alert.alert('نجاح', 'تم تعديل الوحدة بنجاح');
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تعديل الوحدة');
    }
  };
  const handleDeleteUnit = (unit: Unit) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف الوحدة "${unit.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          if (!selectedSubject) return;
          try {
            await api.units.delete(selectedSubject.id, unit.id);
            const updatedUnits = selectedSubject.units.filter(u => u.id !== unit.id);
            setSelectedSubject({ ...selectedSubject, units: updatedUnits });
            setSelectedUnit(null);
            setLessons([]);
            Alert.alert('نجاح', 'تم حذف الوحدة بنجاح');
          } catch (err) {
            Alert.alert('خطأ', 'حدث خطأ أثناء حذف الوحدة');
          }
        }
      }
    ]);
  };

  // LESSON ACTIONS
  const handleEditLesson = (lesson: Lesson) => {
    setLessonToEdit(lesson);
    setLessonEditValue({ 
      name: lesson.name, 
      description: lesson.description, 
      isFree: lesson.isFree || false 
    });
    setEditLessonModalVisible(true);
  };
  const handleSaveLessonEdit = async () => {
    if (!selectedSubject || !selectedUnit || !lessonToEdit) return;
    try {
      await api.lessons.update(selectedSubject.id, selectedUnit.id, lessonToEdit.id, {
        name: lessonEditValue.name,
        description: lessonEditValue.description,
        order: lessonToEdit.order || 0,
        isFree: lessonEditValue.isFree
      });
      const updatedLessons = lessons.map(l => l.id === lessonToEdit.id ? { ...l, ...lessonEditValue } : l);
      setLessons(updatedLessons);
      setEditLessonModalVisible(false);
      setLessonToEdit(null);
      setLessonEditValue({ name: '', description: '', isFree: false });
      Alert.alert('نجاح', 'تم تعديل الدرس بنجاح');
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تعديل الدرس');
    }
  };
  const handleDeleteLesson = (lesson: Lesson) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف الدرس "${lesson.name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          if (!selectedSubject || !selectedUnit) return;
          try {
            await api.lessons.delete(selectedSubject.id, selectedUnit.id, lesson.id);
            setLessons(lessons.filter(l => l.id !== lesson.id));
            Alert.alert('نجاح', 'تم حذف الدرس بنجاح');
          } catch (err) {
            Alert.alert('خطأ', 'حدث خطأ أثناء حذف الدرس');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>إدارة الدروس</Text>
      </View>
      <View style={styles.content}>
        {loading && <ActivityIndicator size="large" color="#E31E24" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && !selectedSubject && (
          <>
            <Text style={styles.sectionTitle}>اختر المادة</Text>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectCard}
                onPress={() => handleSubjectPress(subject)}
                activeOpacity={0.8}
              >
                <View style={styles.subjectContent}>
                  {renderSubjectImage(subject)}
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectSection}>
                      {subject.section === 'scientific' && 'علمي'}
                      {subject.section === 'literary' && 'أدبي'}
                      {subject.section === 'intensive' && 'مكثف'}
                    </Text>
                    <Text style={styles.unitCount}>{subject.units.length} وحدة</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditSubject(subject)}>
                      <Ionicons name="pencil" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteSubject(subject)}>
                      <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
        {!loading && !error && selectedSubject && !selectedUnit && (
          <>
            <Text style={styles.sectionTitle}>الوحدات في {selectedSubject.name}</Text>
            {selectedSubject.units.length === 0 && <Text style={styles.placeholderText}>لا توجد وحدات</Text>}
            {selectedSubject.units.map((unit, idx) => (
              <View key={unit.id} style={styles.unitCard}>
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => handleUnitPress(unit)}
                  activeOpacity={0.85}
                >
                  <View style={styles.unitInfo}>
                    <View style={styles.unitNumberContainer}>
                      <Ionicons name="folder-open" size={22} color="#fff" />
                    </View>
                    <View style={styles.unitDetails}>
                      <Text style={styles.unitName}>{unit.name}</Text>
                      <Text style={styles.unitStats}>{unit.lessons?.length || 0} درس | {unit.quizzes?.length || 0} اختبار</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#666" style={styles.unitArrow} />
                </TouchableOpacity>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditUnit(unit)}>
                    <Ionicons name="pencil" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteUnit(unit)}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        {!loading && !error && selectedSubject && selectedUnit && (
          <>
            <Text style={styles.sectionTitle}>الدروس في {selectedUnit.name}</Text>
            {lessons.length === 0 && <Text style={styles.placeholderText}>لا توجد دروس متاحة حالياً</Text>}
            {lessons.map((lesson, idx) => (
              <View key={lesson.id} style={styles.lessonCard}>
                <View style={styles.lessonIconContainer}>
                  <Ionicons name="book-outline" size={22} color="#E31E24" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonName}>{lesson.name}</Text>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  <View style={styles.lessonStatus}>
                    <Text style={[
                      styles.statusText,
                      lesson.isFree ? styles.freeStatus : styles.paidStatus
                    ]}>
                      {lesson.isFree ? 'مجاني' : 'مدفوع'}
                    </Text>
                  </View>
                </View>
                {lesson.video && (
                  <Ionicons name="videocam" size={20} color="#E31E24" style={{ marginLeft: 8 }} />
                )}
                <View style={styles.cardActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditLesson(lesson)}>
                    <Ionicons name="pencil" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteLesson(lesson)}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
      <Modal visible={editUnitModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل الوحدة</Text>
            <TextInput
              style={styles.input}
              value={unitEditValue}
              onChangeText={setUnitEditValue}
              placeholder="اسم الوحدة"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditUnitModalVisible(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleSaveUnitEdit}>
                <Text style={styles.modalButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={editLessonModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل الدرس</Text>
            <TextInput
              style={styles.input}
              value={lessonEditValue.name}
              onChangeText={name => setLessonEditValue(v => ({ ...v, name }))}
              placeholder="اسم الدرس"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={lessonEditValue.description}
              onChangeText={description => setLessonEditValue(v => ({ ...v, description }))}
              placeholder="وصف الدرس"
              multiline
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>درس مجاني (تجريبي)</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#E31E24" }}
                thumbColor={lessonEditValue.isFree ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={isFree => setLessonEditValue(v => ({ ...v, isFree }))}
                value={lessonEditValue.isFree}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditLessonModalVisible(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleSaveLessonEdit}>
                <Text style={styles.modalButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  subjectImage: {
    width: '100%',
    height: '100%',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectSection: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  unitCount: {
    fontSize: 14,
    color: '#666',
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unitDetails: {
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  unitStats: {
    fontSize: 14,
    color: '#666',
  },
  unitArrow: {
    marginLeft: 8,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  lessonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5eaea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  errorText: {
    color: '#E31E24',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#E31E24',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    marginRight: 8,
  },
  lessonStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  freeStatus: {
    color: '#4CAF50',
  },
  paidStatus: {
    color: '#F44336',
  },
});

export default ManageLessons; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import { api, Lesson, QuizQuestion, Subject, Unit } from '../../services/api';

type Section = 'scientific' | 'literary' | 'intensive';

const AddQuiz = () => {
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState<Section>('scientific');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentChoices, setCurrentChoices] = useState(['', '', '', '']);
  const [currentCorrectIndex, setCurrentCorrectIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    // Filter subjects based on selected section from database
    const filtered = subjects.filter(subject => subject.section === selectedSection);
    setFilteredSubjects(filtered);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setLessons([]);
  }, [selectedSection, subjects]);

  const loadSubjects = async () => {
    try {
      const data = await api.subjects.getAll();
      setSubjects(data);
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المواد');
    }
  };

  const getSectionName = (section: Section) => {
    switch (section) {
      case 'scientific':
        return 'علمي';
      case 'literary':
        return 'أدبي';
      case 'intensive':
        return 'مكثف';
      default:
        return section;
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setLessons([]);
  };

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedLesson(null);
    setLessons([]);
    loadLessons(selectedSubject!.id, unit.id);
  };

  const loadLessons = async (subjectId: string, unitId: string) => {
    try {
      const data = await api.lessons.getAll(subjectId, unitId);
      setLessons(data);
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الدروس');
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.trim() || currentChoices.some(c => !c.trim()) || currentCorrectIndex === null) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول وتحديد الإجابة الصحيحة');
      return;
    }
    setQuestions([...questions, {
      id: Date.now().toString(),
      question: currentQuestion,
      choices: [...currentChoices],
      correctIndex: currentCorrectIndex,
    }]);
    setCurrentQuestion('');
    setCurrentChoices(['', '', '', '']);
    setCurrentCorrectIndex(null);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedSubject || !selectedUnit || !selectedLesson) {
      Alert.alert('خطأ', 'يرجى اختيار المادة والوحدة والدرس');
      return;
    }
    if (!quizTitle.trim() || questions.length === 0) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الاختبار وإضافة أسئلة');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.quizzes.create(selectedSubject.id, selectedUnit.id, selectedLesson.id, {
        title: quizTitle,
        questions: questions.map(q => ({
          question: q.question,
          choices: q.choices,
          correctIndex: q.correctIndex,
        })),
      });
      Alert.alert('نجاح', 'تم إضافة الاختبار بنجاح');
      navigation.goBack();
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الاختبار');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة اختبار جديد</Text>
      </View>
      <View style={styles.content}>
        {/* اختيار القسم */}
        <Text style={styles.label}>اختر القسم</Text>
        <View style={styles.sectionButtons}>
          <TouchableOpacity
            style={[
              styles.sectionButton,
              selectedSection === 'scientific' && styles.selectedSection
            ]}
            onPress={() => setSelectedSection('scientific')}
          >
            <Text style={[
              styles.sectionButtonText,
              selectedSection === 'scientific' && styles.selectedSectionText
            ]}>
              علمي
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sectionButton,
              selectedSection === 'literary' && styles.selectedSection
            ]}
            onPress={() => setSelectedSection('literary')}
          >
            <Text style={[
              styles.sectionButtonText,
              selectedSection === 'literary' && styles.selectedSectionText
            ]}>
              أدبي
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sectionButton,
              selectedSection === 'intensive' && styles.selectedSection
            ]}
            onPress={() => setSelectedSection('intensive')}
          >
            <Text style={[
              styles.sectionButtonText,
              selectedSection === 'intensive' && styles.selectedSectionText
            ]}>
              مكثف
            </Text>
          </TouchableOpacity>
        </View>

        {/* اختيار المادة */}
        <Text style={styles.label}>اختر المادة</Text>
        {filteredSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد مواد في القسم {getSectionName(selectedSection)}</Text>
            <Text style={styles.emptySubText}>قم بإضافة مواد جديدة في هذا القسم أولاً</Text>
          </View>
        ) : (
          <View style={styles.rowList}>
            {filteredSubjects.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={[styles.selectButton, selectedSubject?.id === subject.id && styles.selectedButton]}
                onPress={() => handleSelectSubject(subject)}
              >
                <Text style={selectedSubject?.id === subject.id ? styles.selectedButtonText : styles.selectButtonText}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* اختيار الوحدة */}
        {selectedSubject && (
          <>
            <Text style={styles.label}>اختر الوحدة</Text>
            <View style={styles.rowList}>
              {selectedSubject.units.map(unit => (
                <TouchableOpacity
                  key={unit.id}
                  style={[styles.selectButton, selectedUnit?.id === unit.id && styles.selectedButton]}
                  onPress={() => handleSelectUnit(unit)}
                >
                  <Text style={selectedUnit?.id === unit.id ? styles.selectedButtonText : styles.selectButtonText}>{unit.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* اختيار الدرس */}
        {selectedUnit && (
          <>
            <Text style={styles.label}>اختر الدرس</Text>
            <View style={styles.rowList}>
              {lessons.map(lesson => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.selectButton, selectedLesson?.id === lesson.id && styles.selectedButton]}
                  onPress={() => setSelectedLesson(lesson)}
                >
                  <Text style={selectedLesson?.id === lesson.id ? styles.selectedButtonText : styles.selectButtonText}>{lesson.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* عنوان الاختبار */}
        {selectedLesson && (
          <>
            <Text style={styles.label}>عنوان الاختبار</Text>
            <TextInput
              style={styles.input}
              value={quizTitle}
              onChangeText={setQuizTitle}
              placeholder="أدخل عنوان الاختبار"
            />
            {/* إضافة سؤال */}
            <Text style={styles.label}>أضف سؤالاً</Text>
            <TextInput
              style={styles.input}
              value={currentQuestion}
              onChangeText={setCurrentQuestion}
              placeholder="نص السؤال"
            />
            {currentChoices.map((choice, idx) => (
              <View key={idx} style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.radio, currentCorrectIndex === idx && styles.radioSelected]}
                  onPress={() => setCurrentCorrectIndex(idx)}
                >
                  {currentCorrectIndex === idx && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <TextInput
                  style={styles.choiceInput}
                  value={choice}
                  onChangeText={text => {
                    const newChoices = [...currentChoices];
                    newChoices[idx] = text;
                    setCurrentChoices(newChoices);
                  }}
                  placeholder={`الاختيار ${idx + 1}`}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
              <Text style={styles.addQuestionButtonText}>إضافة السؤال</Text>
            </TouchableOpacity>
          </>
        )}

        {/* عرض الأسئلة المضافة */}
        {questions.length > 0 && (
          <>
            <Text style={styles.label}>الأسئلة المضافة ({questions.length})</Text>
            {questions.map((q, idx) => (
              <View key={q.id} style={styles.questionItem}>
                <Text style={styles.questionText}>{idx + 1}. {q.question}</Text>
                {q.choices.map((choice, choiceIdx) => (
                  <Text
                    key={choiceIdx}
                    style={[
                      styles.choiceText,
                      choiceIdx === q.correctIndex && styles.correctChoice
                    ]}
                  >
                    {String.fromCharCode(65 + choiceIdx)}. {choice}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

        {/* زر الإرسال */}
        {selectedLesson && (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmitQuiz}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة الاختبار'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#E31E24',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 15 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  sectionButtons: { flexDirection: 'row', marginBottom: 12 },
  sectionButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSection: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  sectionButtonText: { color: '#333', fontSize: 15 },
  selectedSectionText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  rowList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  selectButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  selectButtonText: { color: '#333', fontSize: 15 },
  selectedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  choiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E31E24',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: { backgroundColor: '#E31E24' },
  choiceInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  addQuestionButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#333', fontSize: 16 },
  emptySubText: { color: '#666', fontSize: 14 },
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  questionText: { fontWeight: 'bold', marginBottom: 4 },
  choiceText: { color: '#333', marginLeft: 16 },
  correctChoice: { color: '#388e3c', fontWeight: 'bold', marginLeft: 16 },
  submitButton: {
    backgroundColor: '#E31E24',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#ddd' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddQuiz; 
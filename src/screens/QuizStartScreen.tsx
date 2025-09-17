import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Modal, ProgressBarAndroid, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';

type QuizStartRouteProp = RouteProp<RootStackParamList, 'QuizStart'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuizStart'>;

type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

type Quiz = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  quizIndex?: number;
};

const QuizStartScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<QuizStartRouteProp>();
  const { quiz, subjectName, keepAnswers, resetQuiz, subjectId, unitId, lessonId, lesson } = route.params as any;
  const questions: QuizQuestion[] = quiz.questions || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Track if we are in review mode
  const isReviewMode = !!keepAnswers;

  // When in review mode, update selected and showResult on question change
  React.useEffect(() => {
    if (isReviewMode) {
      setSelected(answers[current] ?? null);
      setShowResult(true);
    }
    // eslint-disable-next-line
  }, [current, isReviewMode]);

  React.useEffect(() => {
    if (keepAnswers) {
      setCurrent(0);
      setShowResult(true);
      setSelected(answers[0] ?? null);
    } else if (resetQuiz) {
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setShowResult(false);
    }
    // eslint-disable-next-line
  }, [keepAnswers, resetQuiz]);

  const handleSelect = (idx: number) => {
    if (showResult || isReviewMode) return;
    setSelected(idx);
    setShowResult(true);
  };

  const handleFooterNext = () => {
    if (isReviewMode) {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
      } else if (current === questions.length - 1) {
        // Go back to result screen
        let score = 0;
        questions.forEach((q, idx) => {
          if (answers[idx] === q.correctIndex) score++;
        });
        navigation.navigate('QuizResult', { score, total: questions.length, quiz, lesson, subjectId, unitId });
      }
      return;
    }
    if (selected === null && current !== questions.length - 1) return;
    if (current + 1 < questions.length) {
      // Move to next question
      if (selected !== null) {
        setAnswers([...answers, selected]);
        setSelected(null);
        setShowResult(false);
        setCurrent(current + 1);
      } else {
        setCurrent(current + 1);
      }
    } else if (current === questions.length - 1 && selected !== null) {
      // Last question, show result
      const newAnswers = [...answers, selected];
      let score = 0;
      questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) score++;
      });
      navigation.navigate('QuizResult', { score, total: questions.length, quiz, lesson, subjectId, unitId });
    }
  };

  if (!questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>لا توجد أسئلة في هذا الاختبار</Text>
      </View>
    );
  }

  const q = questions[current];
  const progress = (current + 1) / questions.length;
  const canShowExplanation = showResult && q.explanation && selected !== null;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.exitBtn} onPress={() => {
        Alert.alert(
          'تحذير',
          'إذا خرجت الآن ستفقد جميع إجاباتك. هل أنت متأكد أنك تريد الخروج؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'خروج', style: 'destructive', onPress: () => navigation.goBack() },
          ]
        );
      }}>
        <Ionicons name="close" size={28} color="#E31E24" />
      </TouchableOpacity>
      <View style={styles.quizHeader}>
        <Text style={styles.quizHeaderText} numberOfLines={1}>
          {(subjectName || '') + ' / ' + (quiz.quizIndex !== undefined ? `الاختبار ${quiz.quizIndex + 1}` : 'الاختبار')}
        </Text>
        <Text style={styles.quizHeaderQNum}>{`${current + 1}/${questions.length}`}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ProgressBarAndroid styleAttr="Horizontal" color="#E31E24" indeterminate={false} progress={progress} style={{ marginVertical: 16 }} />
        <View style={styles.questionCard}>
          <ScrollView style={styles.questionScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.question}>{q.question}</Text>
          </ScrollView>
        </View>
        <View style={[styles.choices, { marginBottom: 16 }]}>
          {q.choices.map((choice: string, idx: number) => {
            let choiceStyle = { ...styles.choice };
            let choiceTextStyle = { ...styles.choiceText };
            if (showResult) {
              if (idx === q.correctIndex) {
                choiceStyle = { ...styles.choice, ...styles.correctChoice };
                choiceTextStyle = { ...styles.choiceText, ...styles.correctChoiceText };
              } else if (selected === idx && selected !== q.correctIndex) {
                choiceStyle = { ...styles.choice, ...styles.wrongChoice };
                choiceTextStyle = { ...styles.choiceText, ...styles.wrongChoiceText };
              }
            } else if (selected === idx) {
              choiceStyle = { ...styles.choice, ...styles.selectedChoice };
              choiceTextStyle = { ...styles.choiceText, ...styles.selectedChoiceText };
            }
            return (
              <TouchableOpacity
                key={idx}
                style={choiceStyle}
                onPress={() => handleSelect(idx)}
                disabled={showResult || isReviewMode}
              >
                <Text style={choiceTextStyle}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.footerBtn} onPress={handleFooterNext} disabled={isReviewMode ? false : current === questions.length - 1 && selected === null}>
          <Ionicons name="arrow-back" size={22} color={(isReviewMode ? false : current === questions.length - 1 && selected === null) ? '#ccc' : '#E31E24'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => setShowExpand(true)}>
          <Ionicons name="expand" size={22} color="#E31E24" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => setShowExplanation(true)} disabled={!canShowExplanation}>
          <Ionicons name="book" size={22} color={canShowExplanation ? '#E31E24' : '#ccc'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <Ionicons name="arrow-forward" size={22} color={current === 0 ? '#ccc' : '#E31E24'} />
        </TouchableOpacity>
      </View>
      <Modal visible={showExpand} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.expandedModalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExpand(false)}>
              <Ionicons name="close" size={28} color="#E31E24" />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.expandedQuestion}>{q.question || 'لا يوجد نص للسؤال'}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={showExplanation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExplanation(false)}>
              <Ionicons name="close" size={28} color="#E31E24" />
            </TouchableOpacity>
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.explanationTitle}>شرح السؤال:</Text>
              <Text style={styles.explanationText}>{q.explanation || 'لا يوجد شرح لهذا السؤال.'}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#E31E24', textAlign: 'center' },
  question: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
  choices: { marginBottom: 32 },
  choice: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#f5f5f5' },
  selectedChoice: { borderColor: '#E31E24', backgroundColor: '#FFF3F3' },
  choiceText: { fontSize: 18, color: '#333', textAlign: 'center' },
  selectedChoiceText: { color: '#E31E24', fontWeight: 'bold' },
  nextButton: { backgroundColor: '#E31E24', borderRadius: 12, padding: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  questionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, borderWidth: 2, borderColor: '#E31E24', flexGrow: 1, minHeight: 100, justifyContent: 'center' },
  questionScroll: { flex: 1 },
  correctChoice: { borderColor: '#4CAF50', backgroundColor: '#E8F5E8' },
  wrongChoice: { borderColor: '#F44336', backgroundColor: '#FFEBEE' },
  correctChoiceText: { color: '#4CAF50', fontWeight: 'bold' },
  wrongChoiceText: { color: '#F44336', fontWeight: 'bold' },
  quizHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24, paddingHorizontal: 4 },
  quizHeaderText: { fontSize: 16, color: '#E31E24', fontWeight: 'bold', flex: 1, marginRight: 8 },
  quizHeaderQNum: { fontSize: 16, color: '#333', fontWeight: 'bold', marginLeft: 8, minWidth: 48, textAlign: 'right' },
  footerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', paddingVertical: 10, marginTop: 8 },
  footerBtn: { padding: 10, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#f7f7f7' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxHeight: '80%' },
  modalCloseBtn: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  expandedQuestion: { fontSize: 28, color: '#000', fontWeight: 'bold', textAlign: 'center', padding: 24 },
  explanationTitle: { fontSize: 18, color: '#E31E24', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  explanationText: { fontSize: 16, color: '#333', textAlign: 'center' },
  expandedModalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: '#E31E24',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  exitBtn: {
    position: 'absolute',
    top: 36,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default QuizStartScreen; 
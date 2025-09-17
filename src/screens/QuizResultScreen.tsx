import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';

// Types

type QuizResultRouteProp = RouteProp<RootStackParamList, 'QuizResult'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuizResult'>;

const QuizResultScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<QuizResultRouteProp>();
  const { score, total, quiz } = route.params;
  const subjectId = quiz?.subjectId;
  const unitId = quiz?.unitId;
  const lessonId = quiz?.lessonId;
  const percent = Math.round((score / total) * 100);
  let message = '';
  if (percent === 100) message = 'ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح!';
  else if (percent >= 80) message = 'رائع! نتيجتك ممتازة.';
  else if (percent >= 60) message = 'جيد! يمكنك التحسن أكثر.';
  else message = 'لا بأس، حاول مرة أخرى!';

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          <Ionicons name={percent >= 80 ? 'trophy' : percent >= 60 ? 'happy-outline' : 'sad-outline'} size={64} color="#fff" />
        </View>
      </View>
      <View style={styles.circleContainer}>
        <View style={styles.circleBg}>
          <Text style={styles.scoreText}>{score} / {total}</Text>
        </View>
        <Text style={styles.percentText}>{percent}%</Text>
      </View>
      <Text style={styles.congrats}>{message}</Text>
      <Text style={styles.quizTitle}>{quiz.quizIndex !== undefined ? `الاختبار ${quiz.quizIndex + 1}` : 'الاختبار'}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QuizStart', { quiz, subjectId, unitId, lessonId, keepAnswers: true })}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.buttonText}>العودة</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E31E24', marginTop: 12 }]} onPress={() => navigation.navigate('QuizStart', { quiz, subjectId, unitId, lessonId, resetQuiz: true })}>
        <Ionicons name="refresh" size={20} color="#E31E24" />
        <Text style={[styles.buttonText, { color: '#E31E24' }]}>إعادة الاختبار</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#fff', borderWidth: 2, borderColor: '#F44336', marginTop: 12 }]} onPress={() => {
        Alert.alert(
          'تحذير',
          'إذا خرجت الآن ستفقد جميع إجاباتك. هل أنت متأكد أنك تريد الخروج؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'خروج', style: 'destructive', onPress: () => {
              if (quiz && quiz.lesson && quiz.subjectId && quiz.unitId) {
                navigation.navigate('LessonQuizzes', { lesson: quiz.lesson, subjectId: quiz.subjectId, unitId: quiz.unitId });
              } else {
                navigation.navigate('Home');
              }
            } },
          ]
        );
      }}>
        <Ionicons name="exit" size={20} color="#F44336" />
        <Text style={[styles.buttonText, { color: '#F44336' }]}>خروج</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  illustrationContainer: { alignItems: 'center', marginBottom: 12 },
  illustrationCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E31E24', justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#E31E24', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  circleContainer: { alignItems: 'center', marginBottom: 32 },
  circleBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E31E24', justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#E31E24', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  scoreText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  percentText: { fontSize: 22, color: '#E31E24', fontWeight: 'bold' },
  congrats: { fontSize: 20, color: '#333', fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  quizTitle: { fontSize: 18, color: '#666', marginBottom: 32, textAlign: 'center' },
  button: { flexDirection: 'row', backgroundColor: '#E31E24', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});

export default QuizResultScreen; 
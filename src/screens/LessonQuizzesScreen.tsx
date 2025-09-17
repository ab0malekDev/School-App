import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../services/api';
import { RootStackParamList } from '../types/navigation';

interface Quiz {
  id: string;
  title: string;
  description?: string;
}

type LessonQuizzesRouteProp = RouteProp<RootStackParamList, 'LessonQuizzes'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LessonQuizzes'>;

const LessonQuizzesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LessonQuizzesRouteProp>();
  const { lesson, subjectId, unitId } = route.params;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.quizzes.getAll(subjectId, unitId, lesson.id);
      setQuizzes(data);
      if (!data || data.length === 0) {
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
      // تحديث كاش المواد بالاختبارات الجديدة
      try {
        const subjectsCache = await AsyncStorage.getItem('subjects');
        if (subjectsCache) {
          const subjectsArr = JSON.parse(subjectsCache);
          const subject = subjectsArr.find((s: any) => s.id === subjectId);
          if (subject) {
            const unit = subject.units.find((u: any) => u.id === unitId);
            if (unit) {
              const lessonObj = unit.lessons?.find((l: any) => l.id === lesson.id);
              if (lessonObj) {
                lessonObj.quizzes = data;
                await AsyncStorage.setItem('subjects', JSON.stringify(subjectsArr));
              }
            }
          }
        }
      } catch (e) {
        // ignore cache update errors
      }
    } catch (err) {
      // حاول جلب البيانات من الكاش مباشرة (احتياطي)
      const cacheKey = `quizzes_${subjectId}_${unitId}_${lesson.id}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setQuizzes(JSON.parse(cached));
        Alert.alert('أوفلاين', 'تم عرض البيانات المخزنة مؤقتًا.');
      } else {
        setQuizzes([]);
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz, idx: number) => {
    navigation.navigate('QuizStart', {
      quiz: { ...quiz, quizIndex: idx },
      subjectId,
      unitId,
      lessonId: lesson.id
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{lesson.name}</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : quizzes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="help-circle" size={64} color="#ccc" />
          <Text style={styles.emptyText}>لا توجد اختبارات متاحة لهذا الدرس</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {quizzes.map((quiz, idx) => (
            <TouchableOpacity key={quiz.id} style={styles.quizCard} onPress={() => handleStartQuiz(quiz, idx)}>
              <Text style={styles.quizTitle}>{`الاختبار ${idx + 1}`}</Text>
              <Ionicons name="play" size={20} color="#E31E24" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E31E24',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
    marginRight: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#E31E24',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default LessonQuizzesScreen; 
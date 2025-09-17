import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, Lesson } from '../services/api';
import { getDeviceId } from '../services/device';

type RootStackParamList = {
  UnitLessons: {
    unitId: string;
    subjectId: string;
    unitName: string;
    viewType?: 'quizzes' | 'lessons';
  };
  LessonVideo: {
    lesson: Lesson;
  };
  LessonQuizzes: {
    lesson: Lesson;
    subjectId: string;
    unitId: string;
  };
  QuizStart: {
    quiz: any;
    subjectId: string;
    unitId: string;
    lessonId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UnitLessons'>;
type UnitLessonsRouteProp = RouteProp<RootStackParamList, 'UnitLessons'>;

const UnitLessonsScreen = () => {
  const route = useRoute<UnitLessonsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { unitId, subjectId, unitName, viewType: routeViewType } = route.params;
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewType, setViewType] = useState<'quizzes' | 'lessons'>(routeViewType || 'lessons');
  const [quizzesByLesson, setQuizzesByLesson] = useState<{ [lessonId: string]: any[] }>({});

  useEffect(() => {
    loadLessons();
    checkSubscriptionStatus();
  }, [unitId]);

  useEffect(() => {
    if (viewType === 'quizzes' && lessons.length > 0) {
      fetchAllQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType, lessons]);

  const checkSubscriptionStatus = async () => {
    try {
      const deviceId = await getDeviceId();
      const response = await api.devices.getStatus(deviceId);
      
      if (response.isActive) {
        setIsSubscribed(true);
        console.log('Device is subscribed to section:', response.section);
      } else {
        setIsSubscribed(false);
        console.log('Device is not subscribed');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    }
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = null;
      try {
        data = await api.lessons.getAll(subjectId, unitId);
      } catch (err) {
        data = null;
      }
      if (!data) {
        // جرب جلب الدروس من كاش المواد
        const subjectsCache = await AsyncStorage.getItem('subjects');
        if (subjectsCache) {
          const subjectsArr = JSON.parse(subjectsCache);
          const subject = subjectsArr.find((s: any) => s.id === subjectId);
          const unit = subject?.units?.find((u: any) => u.id === unitId);
          const lessonsArr = unit?.lessons || [];
          setLessons(lessonsArr);
          if (lessonsArr.length === 0) {
            Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
          } else {
            Alert.alert('أوفلاين', 'تم عرض البيانات المخزنة مؤقتًا.');
          }
          // تحديث كاش المواد بالدروس الجديدة
          try {
            const subjectsCache = await AsyncStorage.getItem('subjects');
            if (subjectsCache) {
              const subjectsArr = JSON.parse(subjectsCache);
              const subject = subjectsArr.find((s: any) => s.id === subjectId);
              if (subject) {
                const unit = subject.units.find((u: any) => u.id === unitId);
                if (unit) {
                  unit.lessons = lessonsArr;
                  await AsyncStorage.setItem('subjects', JSON.stringify(subjectsArr));
                }
              }
            }
          } catch (e) {
            // ignore cache update errors
          }
          return;
        }
        setLessons([]);
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
        return;
      }
      const lessonsArray = Array.isArray(data) ? data : [];
      setLessons(lessonsArray);
      if (lessonsArray.length === 0) {
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
      // تحديث كاش المواد بالدروس الجديدة
      try {
        const subjectsCache = await AsyncStorage.getItem('subjects');
        if (subjectsCache) {
          const subjectsArr = JSON.parse(subjectsCache);
          const subject = subjectsArr.find((s: any) => s.id === subjectId);
          if (subject) {
            const unit = subject.units.find((u: any) => u.id === unitId);
            if (unit) {
              unit.lessons = lessonsArray;
              await AsyncStorage.setItem('subjects', JSON.stringify(subjectsArr));
            }
          }
        }
      } catch (e) {
        // ignore cache update errors
      }
    } catch (err) {
      // حاول جلب البيانات من الكاش مباشرة (احتياطي)
      const cacheKey = `lessons_${subjectId}_${unitId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const lessonsArr = JSON.parse(cached);
        setLessons(lessonsArr);
        Alert.alert('أوفلاين', 'تم عرض البيانات المخزنة مؤقتًا.');
      } else {
        setLessons([]);
        Alert.alert('أوفلاين', 'لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuizzes = async () => {
    const quizzesMap: { [lessonId: string]: any[] } = {};
    for (const lesson of lessons) {
      try {
        const quizzes = await api.quizzes.getAll(subjectId, unitId, lesson.id);
        quizzesMap[lesson.id] = quizzes;
      } catch (err) {
        quizzesMap[lesson.id] = [];
      }
    }
    setQuizzesByLesson(quizzesMap);
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (viewType === 'quizzes') {
      navigation.navigate('LessonQuizzes', { lesson, subjectId, unitId });
      return;
    }
    if (!isSubscribed && !lesson.isFree) {
      Alert.alert(
        'اشتراك مطلوب',
        'هذا الدرس يتطلب اشتراك مدفوع. يمكنك استكشاف الدروس المجانية أو تفعيل اشتراكك للوصول لجميع الدروس.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'تفعيل الاشتراك', 
            onPress: () => navigation.navigate('Subscription' as any)
          }
        ]
      );
      return;
    }
    navigation.navigate('LessonVideo', { lesson: { ...lesson, subjectId, unitId } });
  };

  const renderSubscriptionIcon = (lesson: Lesson) => {
    if (isSubscribed) {
      return (
        <View style={[styles.subscriptionIcon, styles.subscribedIcon]}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      );
    }
    
    if (lesson.isFree) {
      return (
        <View style={[styles.subscriptionIcon, styles.freeIcon]}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      );
    } else {
      return (
        <View style={[styles.subscriptionIcon, styles.lockedIcon]}>
          <Ionicons name="lock-closed" size={20} color="#F44336" />
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{unitName}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{unitName}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (viewType === 'quizzes') {
    // Show all lessons as cards. On press, navigate to LessonQuizzesScreen for that lesson.
    if (lessons.length === 0) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{unitName}</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد دروس متاحة حالياً</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{unitName}</Text>
        </View>
        <ScrollView style={styles.content}>
          {lessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonCardContainer}>
              {renderSubscriptionIcon(lesson)}
              <TouchableOpacity
                style={[
                  styles.lessonCard,
                  !isSubscribed && !lesson.isFree && styles.lockedLessonCard
                ]}
                onPress={() => navigation.navigate('LessonQuizzes', { lesson, subjectId, unitId })}
              >
                <View style={styles.lessonInfo}>
                  <View style={styles.lessonNumberContainer}>
                    <Text style={styles.lessonNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonDetails}>
                    <Text style={styles.lessonName}>{lesson.name}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>{lesson.description}</Text>
                  </View>
                </View>
                <View style={styles.lessonArrow}>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{unitName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {lessons.map((lesson, index) => (
          <View key={lesson.id} style={styles.lessonCardContainer}>
            {renderSubscriptionIcon(lesson)}
            <TouchableOpacity
              style={[
                styles.lessonCard,
                !isSubscribed && !lesson.isFree && styles.lockedLessonCard
              ]}
              onPress={() => handleLessonPress(lesson)}
            >
              <View style={styles.lessonInfo}>
                <View style={styles.lessonNumberContainer}>
                  <Text style={styles.lessonNumber}>{index + 1}</Text>
                </View>
                <View style={styles.lessonDetails}>
                  <Text style={styles.lessonName}>{lesson.name}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                  <View style={styles.lessonStats}>
                    {isSubscribed && (
                      <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={[styles.statText, styles.freeText]} numberOfLines={1}>مشترك</Text>
                      </View>
                    )}
                    {!isSubscribed && lesson.isFree && (
                      <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={[styles.statText, styles.freeText]} numberOfLines={1}>مجاني</Text>
                      </View>
                    )}
                    {!isSubscribed && !lesson.isFree && (
                      <View style={styles.statItem}>
                        <Ionicons name="lock-closed" size={16} color="#F44336" />
                        <Text style={[styles.statText, styles.lockedText]} numberOfLines={1}>مدفوع</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.lessonArrow}>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
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
  lessonCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  lessonInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E31E24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lessonDetails: {
    flex: 1,
  },
  lessonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonStats: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 80,
    paddingHorizontal: 6,
    justifyContent: 'center',
    overflow: 'visible',
    flexShrink: 0,
    flexGrow: 0,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flexShrink: 0,
    flexGrow: 0,
    textAlign: 'center',
    maxWidth: '100%',
    flexBasis: 0,
  },
  lessonArrow: {
    marginLeft: 8,
  },
  subscriptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subscribedIcon: {
    backgroundColor: '#E8F5E8',
  },
  freeIcon: {
    backgroundColor: '#E8F5E8',
  },
  lockedIcon: {
    backgroundColor: '#FFEBEE',
  },
  lockedLessonCard: {
    backgroundColor: '#FFEBEE',
  },
  lockedText: {
    color: '#F44336',
  },
  freeText: {
    color: '#4CAF50',
  },
});

export default UnitLessonsScreen; 
// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
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
import { api } from '../../services/api';
import { getDeviceId } from '../../services/device';

// Define navigation types
type RootStackParamList = {
  UnitLessons: {
    unitId: string;
    subjectId: string;
    unitName: string;
    viewType: 'videos' | 'quizzes' | 'all';
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UnitLessons'>;
type SubjectUnitsRouteProp = RouteProp<{ params: { subjectId: string; viewType?: 'videos' | 'quizzes' } }>;

interface Unit {
  id: string;
  name: string;
  lessons?: any[];
  quizzes?: any[];
  order?: number;
}

interface Subject {
  id: string;
  name: string;
  image?: string;
  units: Unit[];
}

const SubjectUnitsView = () => {
  const route = useRoute<SubjectUnitsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { subjectId, viewType } = route.params;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      console.error('No subject ID provided');
      setError('معرف المادة غير صالح');
      setLoading(false);
      return;
    }
    console.log('Loading subject with ID:', subjectId);
    loadSubject();
    checkSubscriptionStatus();
  }, [subjectId]);

  const loadSubject = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }
      let data = null;
      try {
        data = await api.subjects.getById(subjectId);
      } catch (err) {
        data = null;
      }
      if (!data) {
        // جرب جلب المادة من كاش المواد
        const cached = await AsyncStorage.getItem('subjects');
        if (cached) {
          const subjectsArr = JSON.parse(cached);
          const found = subjectsArr.find((s: any) => s.id === subjectId);
          if (found) {
            setSubject(found);
            Alert.alert('أوفلاين', 'تم عرض البيانات المخزنة مؤقتًا.');
          } else {
            setSubject(null);
            setError('لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
          }
        } else {
          setSubject(null);
          setError('لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
        }
        return;
      }
      setSubject(data);
    } catch (err) {
      setSubject(null);
      setError('لا توجد بيانات متاحة أوفلاين. يرجى الاتصال بالإنترنت أول مرة.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleUnitPress = (unit: Unit) => {
    navigation.navigate('UnitLessons', { 
      unitId: unit.id, 
      subjectId,
      unitName: unit.name,
      viewType: viewType ?? 'videos'
    });
  };

  const getUnitStatus = (unit: Unit) => {
    if (isSubscribed) {
      return { type: 'subscribed', text: 'مشترك', color: '#4CAF50', icon: 'checkmark-circle' };
    }
    
    const hasFreeLessons = unit.lessons && unit.lessons.some(lesson => lesson.isFree);
    const hasPaidLessons = unit.lessons && unit.lessons.some(lesson => !lesson.isFree);
    
    if (hasFreeLessons && !hasPaidLessons) {
      return { type: 'free', text: 'مجاني', color: '#4CAF50', icon: 'checkmark-circle' };
    } else if (hasFreeLessons && hasPaidLessons) {
      return { type: 'mixed', text: 'مجاني + مدفوع', color: '#FF9800', icon: 'information-circle' };
    } else if (hasPaidLessons) {
      return { type: 'paid', text: 'مدفوع', color: '#F44336', icon: 'lock-closed' };
    } else {
      // إذا لم يكن هناك دروس، نعرض حالة الاستكشاف
      return { type: 'explore', text: 'استكشاف', color: '#2196F3', icon: 'eye' };
    }
  };

  const filteredUnits = subject?.units || [];
  
  // Debug logging
  console.log('SubjectUnitsView Debug:', {
    subjectId,
    viewType,
    loading,
    subjectExists: !!subject,
    unitsCount: filteredUnits.length,
    units: filteredUnits.map(unit => ({
      id: unit.id,
      name: unit.name,
      lessonsCount: unit.lessons?.length || 0,
      lessons: unit.lessons,
      quizzesCount: unit.quizzes?.length || 0
    }))
  });

  // Always show all units, only show empty if there are no units at all
  const hasContent = filteredUnits.length > 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E31E24" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>لم يتم العثور على المادة</Text>
      </View>
    );
  }

  if (!hasContent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{subject.name}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد وحدات متاحة</Text>
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
        <Text style={styles.title}>{subject.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        {filteredUnits.map((unit, index) => {
          const unitStatus = getUnitStatus(unit);
          const isLocked = !isSubscribed && unitStatus.type === 'paid';
          
          return (
            <View key={unit.id} style={styles.unitCardContainer}>
              <View style={[styles.statusIcon, { backgroundColor: unitStatus.color + '20' }]}>
                <Ionicons name={unitStatus.icon as any} size={20} color={unitStatus.color} />
              </View>
              <TouchableOpacity
                style={[
                  styles.unitCard,
                  isLocked && styles.lockedUnitCard
                ]}
                onPress={() => handleUnitPress(unit)}
              >
                <View style={styles.unitInfo}>
                  <View style={styles.unitNumberContainer}>
                    <Text style={styles.unitNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.unitDetails}>
                    <Text style={styles.unitName}>{unit.name}</Text>
                    <View style={styles.unitStats}>
                      {viewType === 'videos' ? (
                        <View style={styles.statItem}>
                          <Ionicons name="videocam" size={16} color="#E31E24" />
                          <Text style={styles.statText}>{unit.lessons?.length || 0} درس</Text>
                        </View>
                      ) : viewType === 'quizzes' ? (
                        <View style={styles.statItem}>
                          <Ionicons name="help-circle" size={16} color="#FFB800" />
                          <Text style={styles.statText}>{unit.quizzes?.length || 0} اختبار</Text>
                        </View>
                      ) : (
                        <>
                          <View style={styles.statItem}>
                            <Ionicons name="videocam" size={16} color="#E31E24" />
                            <Text style={styles.statText}>{unit.lessons?.length || 0} درس</Text>
                          </View>
                          <View style={styles.statDivider} />
                          <View style={styles.statItem}>
                            <Ionicons name="help-circle" size={16} color="#FFB800" />
                            <Text style={styles.statText}>{unit.quizzes?.length || 0} اختبار</Text>
                          </View>
                        </>
                      )}
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Ionicons name={unitStatus.icon as any} size={16} color={unitStatus.color} />
                        <Text style={[styles.statText, { color: unitStatus.color }]}>{unitStatus.text}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.unitArrow}>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
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
  unitCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  unitCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
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
  lockedUnitCard: {
    backgroundColor: '#FFEBEE',
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
  unitNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unitDetails: {
    flex: 1,
  },
  unitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  unitStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  unitArrow: {
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
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
  },
});

export default SubjectUnitsView; 
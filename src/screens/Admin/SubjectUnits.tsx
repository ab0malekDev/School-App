// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SubjectUnitsRouteProp = RouteProp<RootStackParamList, 'SubjectUnits'>;

interface Unit {
  id: string;
  name: string;
  lessons: any[];
  quizzes: any[];
  order: number;
}

interface Subject {
  id: string;
  name: string;
  image: string;
  units: Unit[];
}

const SubjectUnits = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SubjectUnitsRouteProp>();
  const { subjectId } = route.params;

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubject();
  }, []);

  const loadSubject = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subject');
      }

      const subjectData = await response.json();
      setSubject(subjectData);
    } catch (error) {
      console.error('Error loading subject:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم الوحدة');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/subjects/${subjectId}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUnitName.trim(),
          order: subject?.units?.length || 0
        }),
      });

      const text = await response.text();
      console.log('Create unit raw response:', text);
      let newUnit;
      try {
        newUnit = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error('الرد من السيرفر ليس JSON. ربما هناك خطأ في السيرفر أو الرابط غير صحيح. الرد: ' + text);
      }

      if (!response.ok) {
        throw new Error(newUnit.message || 'Failed to create unit');
      }
      
      // Update local state
      if (subject) {
        const updatedSubject = {
          ...subject,
          units: [...(subject.units || []), newUnit]
        };
        setSubject(updatedSubject);
        Alert.alert('نجاح', 'تم إضافة الوحدة بنجاح');
        setIsAddModalVisible(false);
        setNewUnitName('');
      }
    } catch (error: any) {
      console.error('Error creating unit:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إضافة الوحدة');
    }
  };

  const handleEditUnit = async () => {
    if (!editingUnit || !newUnitName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم الوحدة');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${editingUnit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUnitName.trim(),
          order: editingUnit.order
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update unit');
      }

      const updatedUnit = await response.json();

      // Update local state
      if (subject) {
        const updatedSubject = {
          ...subject,
          units: subject.units.map(u => u.id === editingUnit.id ? updatedUnit : u)
        };
        setSubject(updatedSubject);
        Alert.alert('نجاح', 'تم تعديل الوحدة بنجاح');
        setIsEditModalVisible(false);
        setNewUnitName('');
        setEditingUnit(null);
      }
    } catch (error: any) {
      console.error('Error editing unit:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تعديل الوحدة');
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الوحدة؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                throw new Error('No authentication token found');
              }

              const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete unit');
              }

              // Update local state
              if (subject) {
                const updatedSubject = {
                  ...subject,
                  units: subject.units.filter(u => u.id !== unitId)
                };
                setSubject(updatedSubject);
                Alert.alert('نجاح', 'تم حذف الوحدة بنجاح');
              }
            } catch (error: any) {
              console.error('Error deleting unit:', error);
              Alert.alert('خطأ', error.message || 'حدث خطأ أثناء حذف الوحدة');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setNewUnitName(unit.name);
    setIsEditModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>جاري التحميل...</Text>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>إضافة وحدة جديدة</Text>
        </TouchableOpacity>

        {subject.units?.map(unit => (
          <View key={unit.id} style={styles.unitCard}>
            <View style={styles.unitInfo}>
              <Text style={styles.unitName}>{unit.name}</Text>
              <Text style={styles.lessonCount}>
                {unit.lessons?.length || 0} درس | {unit.quizzes?.length || 0} اختبار
              </Text>
            </View>
            <View style={styles.unitActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(unit)}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUnit(unit.id)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Unit Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة وحدة جديدة</Text>
            <TextInput
              style={styles.input}
              value={newUnitName}
              onChangeText={setNewUnitName}
              placeholder="اسم الوحدة"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewUnitName('');
                }}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddUnit}
              >
                <Text style={styles.modalButtonText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل الوحدة</Text>
            <TextInput
              style={styles.input}
              value={newUnitName}
              onChangeText={setNewUnitName}
              placeholder="اسم الوحدة"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setNewUnitName('');
                  setEditingUnit(null);
                }}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEditUnit}
              >
                <Text style={styles.modalButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#E31E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonCount: {
    fontSize: 14,
    color: '#666',
  },
  unitActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#E31E24',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default SubjectUnits; 

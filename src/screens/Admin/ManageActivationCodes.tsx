import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ActivationCode {
  id: string;
  code: string;
  deviceUUID: string;
  section: 'scientific' | 'literary' | 'intensive';
  isUsed: boolean;
  usedByDevice?: string;
  activatedAt?: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
}

const ManageActivationCodes = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({
    deviceUUID: '',
    section: 'scientific' as 'scientific' | 'literary' | 'intensive'
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.activationCodes.getAll();
      console.log('Loaded codes:', data);
      setCodes(data);
    } catch (err: any) {
      console.error('Error loading codes:', err);
      let errorMessage = 'حدث خطأ أثناء تحميل الأكواد';
      if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.deviceUUID.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال UUID الجهاز');
      return;
    }

    try {
      console.log('Creating code for:', newCode);
      const createdCode = await api.activationCodes.create({
        deviceUUID: newCode.deviceUUID.trim(),
        section: newCode.section
      });
      
      console.log('Created code:', createdCode);
      setCodes([createdCode, ...codes]);
      setShowCreateModal(false);
      setNewCode({ deviceUUID: '', section: 'scientific' });
      
      // عرض الكود المُنشأ مع إمكانية النسخ
      Alert.alert(
        'تم إنشاء كود التفعيل بنجاح',
        `الكود: ${createdCode.code}\n\nالقسم: ${getSectionName(createdCode.section)}\nصالح حتى: ${formatSubscriptionEndDate(createdCode.expiresAt)}\n\nقم بنسخ هذا الكود وإرساله للطالب`,
        [
          {
            text: 'نسخ الكود',
            onPress: () => {
              // نسخ الكود إلى الحافظة
              Clipboard.setStringAsync(createdCode.code);
              Alert.alert('تم النسخ', 'تم نسخ كود التفعيل إلى الحافظة');
            }
          },
          {
            text: 'حسناً',
            style: 'cancel'
          }
        ]
      );
    } catch (err: any) {
      console.error('Error creating code:', err);
      let errorMessage = 'حدث خطأ أثناء إنشاء كود التفعيل';
      if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert('خطأ', errorMessage);
    }
  };

  const handleDeleteCode = (code: ActivationCode) => {
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من حذف كود التفعيل "${code.code}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          try {
            await api.activationCodes.delete(code.id);
            setCodes(codes.filter(c => c.id !== code.id));
            Alert.alert('نجاح', 'تم حذف كود التفعيل بنجاح');
          } catch (err) {
            Alert.alert('خطأ', 'حدث خطأ أثناء حذف كود التفعيل');
          }
        }
      }
    ]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSubscriptionEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSectionName = (section: string) => {
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

  const getStatusText = (code: any) => {
    if (code.isUsed) {
      return 'مستخدم';
    }
    const now = new Date();
    const expiresAt = new Date(code.expiresAt);
    if (now > expiresAt) {
      return 'منتهي الصلاحية';
    }
    return 'متاح';
  };

  const getStatusColor = (code: any) => {
    if (code.isUsed) {
      return '#28a745'; // Green
    }
    const now = new Date();
    const expiresAt = new Date(code.expiresAt);
    if (now > expiresAt) {
      return '#dc3545'; // Red
    }
    return '#007bff'; // Blue
  };

  const handleDebug = async () => {
    try {
      const debugData = await api.activationCodes.debug();
      console.log('Debug data:', debugData);
      Alert.alert('Debug Info', JSON.stringify(debugData, null, 2));
    } catch (err: any) {
      console.error('Debug error:', err);
      Alert.alert('Debug Error', err.message);
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
          <Text style={styles.title}>إدارة أكواد التفعيل</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
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
        <Text style={styles.title}>إدارة أكواد التفعيل</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleDebug}
          >
            <Ionicons name="bug-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>معلومات نظام التفعيل:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#007AFF" />
            <Text style={styles.infoText}>الاشتراك صالح من سبتمبر إلى سبتمبر (سنة دراسية كاملة)</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#007AFF" />
            <Text style={styles.infoText}>كود التفعيل صالح ليوم واحد فقط</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="key" size={16} color="#007AFF" />
            <Text style={styles.infoText}>يمكن استخدام الكود مرة واحدة فقط</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait" size={16} color="#007AFF" />
            <Text style={styles.infoText}>الكود مرتبط بجهاز محدد</Text>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {codes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="key-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد أكواد تفعيل</Text>
          </View>
        ) : (
          codes.map((code) => (
            <View key={code.id} style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <View style={styles.codeInfo}>
                  <Text style={styles.codeText}>{code.code}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(code) }]}>
                    <Text style={styles.statusText}>{getStatusText(code)}</Text>
                  </View>
                </View>
                <View style={styles.codeActions}>
                  {!code.isUsed && (
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        Clipboard.setStringAsync(code.code);
                        Alert.alert('تم النسخ', 'تم نسخ كود التفعيل إلى الحافظة');
                      }}
                    >
                      <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCode(code)}
                  >
                    <Ionicons name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.codeDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="phone-portrait" size={16} color="#666" />
                  <Text style={styles.detailText}>UUID: {code.deviceUUID}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="school" size={16} color="#666" />
                  <Text style={styles.detailText}>القسم: {getSectionName(code.section)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>تاريخ الإنشاء: {formatDate(code.createdAt)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.detailText}>ينتهي في: {formatSubscriptionEndDate(code.expiresAt)}</Text>
                </View>
                
                {code.isUsed && (
                  <>
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.detailText, { color: '#4CAF50' }]}>
                        تم التفعيل في: {formatDate(code.activatedAt!)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="phone-portrait" size={16} color="#4CAF50" />
                      <Text style={[styles.detailText, { color: '#4CAF50' }]}>
                        الجهاز المفعل: {code.usedByDevice}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Code Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء كود تفعيل جديد</Text>
            
            <Text style={styles.label}>UUID الجهاز</Text>
            <TextInput
              style={styles.input}
              value={newCode.deviceUUID}
              onChangeText={(text) => setNewCode({ ...newCode, deviceUUID: text })}
              placeholder="أدخل UUID الجهاز"
              autoCapitalize="none"
            />
            
            <Text style={styles.label}>القسم</Text>
            <View style={styles.sectionButtons}>
              <TouchableOpacity
                style={[
                  styles.sectionButton,
                  newCode.section === 'scientific' && styles.selectedSection
                ]}
                onPress={() => setNewCode({ ...newCode, section: 'scientific' })}
              >
                <Text style={[
                  styles.sectionButtonText,
                  newCode.section === 'scientific' && styles.selectedSectionText
                ]}>
                  علمي
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sectionButton,
                  newCode.section === 'literary' && styles.selectedSection
                ]}
                onPress={() => setNewCode({ ...newCode, section: 'literary' })}
              >
                <Text style={[
                  styles.sectionButtonText,
                  newCode.section === 'literary' && styles.selectedSectionText
                ]}>
                  أدبي
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sectionButton,
                  newCode.section === 'intensive' && styles.selectedSection
                ]}
                onPress={() => setNewCode({ ...newCode, section: 'intensive' })}
              >
                <Text style={[
                  styles.sectionButtonText,
                  newCode.section === 'intensive' && styles.selectedSectionText
                ]}>
                  مكثف
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateCode}
              >
                <Text style={styles.modalButtonText}>إنشاء</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    marginRight: 15,
  },
  addButton: {
    marginLeft: 15,
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
  errorText: {
    color: '#E31E24',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
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
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  codeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  sectionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  sectionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedSection: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  sectionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedSectionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#E31E24',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    padding: 8,
  },
});

export default ManageActivationCodes; 
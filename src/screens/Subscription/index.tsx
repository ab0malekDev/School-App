import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../../services/api';
import { getDeviceId } from '../../services/device';

const SubscriptionScreen = ({ navigation }: any) => {
  const [deviceId, setDeviceId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isAlreadyActivated, setIsAlreadyActivated] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
      // فحص حالة التفعيل
      checkActivationStatus(id);
    };
    fetchDeviceId();
  }, []);

  const checkActivationStatus = async (deviceId: string) => {
    try {
      const response = await api.devices.getStatus(deviceId);
      if (response.isActive) {
        setIsAlreadyActivated(true);
        setSubscriptionInfo(response);
      }
    } catch (error) {
      // إذا لم يكن مفعل، هذا طبيعي
      console.log('Device not activated yet');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(deviceId);
    Alert.alert('تم النسخ', 'تم نسخ معرف الجهاز إلى الحافظة.');
  };

  const handleActivation = async () => {
    if (!activationCode.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال كود التفعيل.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.activationCodes.activate(activationCode.trim(), deviceId);

      Alert.alert(
        'تم التفعيل بنجاح',
        `تم تفعيل الاشتراك بنجاح!\nينتهي في: ${new Date(response.expiresAt).toLocaleDateString('ar-SA')}\nالقسم: ${response.section === 'scientific' ? 'علمي' : response.section === 'literary' ? 'أدبي' : 'مكثف'}`,
        [
          {
            text: 'حسناً',
            onPress: () => {
              // Navigate based on section
              switch (response.section) {
                case 'scientific':
                  navigation.navigate('ScientificSubjects');
                  break;
                case 'literary':
                  navigation.navigate('LiterarySubjects');
                  break;
                case 'intensive':
                  navigation.navigate('IntensiveSubjects');
                  break;
                default:
                  navigation.navigate('Home');
              }
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Activation error:', error);
      let errorMessage = 'حدث خطأ أثناء التفعيل';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('خطأ في التفعيل', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفعيل الاشتراك</Text>
      </View>

      <View style={styles.content}>
        {isAlreadyActivated ? (
          // عرض حالة التفعيل إذا كان مفعل
          <View style={styles.activatedContainer}>
            <View style={styles.activatedIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.activatedTitle}>أنت مفعل بالفعل!</Text>
            <Text style={styles.activatedSubtitle}>
              اشتراكك نشط ومفعل
            </Text>
            
            <View style={styles.subscriptionDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="school" size={20} color="#E31E24" />
                <Text style={styles.detailText}>
                  القسم: {subscriptionInfo?.section === 'scientific' ? 'علمي' : 
                          subscriptionInfo?.section === 'literary' ? 'أدبي' : 'مكثف'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color="#E31E24" />
                <Text style={styles.detailText}>
                  ينتهي في: {subscriptionInfo?.expiresAt ? 
                    new Date(subscriptionInfo.expiresAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.goToSectionButton}
              onPress={() => {
                // التنقل للقسم المفعل
                switch (subscriptionInfo?.section) {
                  case 'scientific':
                    navigation.navigate('ScientificSubjects');
                    break;
                  case 'literary':
                    navigation.navigate('LiterarySubjects');
                    break;
                  case 'intensive':
                    navigation.navigate('IntensiveSubjects');
                    break;
                  default:
                    navigation.navigate('Home');
                }
              }}
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
              <Text style={styles.goToSectionText}>اذهب للقسم المفعل</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // عرض واجهة التفعيل إذا لم يكن مفعل
          <>
            <Text style={styles.sectionTitle}>معرف الجهاز الخاص بك</Text>
            <Text style={styles.sectionDescription}>
              استخدم هذا المعرف لتفعيل اشتراكك. قم بنسخه وإرساله للمسؤول للحصول على كود التفعيل.
            </Text>
            <View style={styles.deviceIdContainer}>
              <Text style={styles.deviceIdText} selectable>{deviceId}</Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={24} color="#E31E24" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>إدخال كود التفعيل</Text>
            <Text style={styles.sectionDescription}>
              قم بإدخال كود التفعيل المقدم لك للحصول على اشتراك لمدة سنة دراسية
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="أدخل كود التفعيل هنا"
                value={activationCode}
                onChangeText={setActivationCode}
                placeholderTextColor="#999"
                secureTextEntry={!showCode}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCode(!showCode)}
              >
                <Ionicons
                  name={showCode ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.activateButton, loading && styles.disabledButton]} 
              onPress={handleActivation} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.activateButtonText}>تفعيل الاشتراك</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>معلومات مهمة:</Text>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color="#E31E24" />
                <Text style={styles.infoText}>الاشتراك صالح من سبتمبر إلى سبتمبر (سنة دراسية كاملة)</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#E31E24" />
                <Text style={styles.infoText}>الكود صالح ليوم واحد فقط</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="key" size={16} color="#E31E24" />
                <Text style={styles.infoText}>يمكن استخدام الكود مرة واحدة فقط</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="phone-portrait" size={16} color="#E31E24" />
                <Text style={styles.infoText}>الكود مرتبط بجهازك فقط</Text>
              </View>
            </View>
          </>
        )}
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  deviceIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
  },
  deviceIdText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    letterSpacing: 2,
  },
  eyeButton: {
    padding: 15,
  },
  activateButton: {
    backgroundColor: '#E31E24',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  activatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  activatedIcon: {
    marginBottom: 20,
  },
  activatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  activatedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  subscriptionDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  goToSectionButton: {
    backgroundColor: '#E31E24',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 50,
    width: '100%',
  },
  goToSectionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SubscriptionScreen;

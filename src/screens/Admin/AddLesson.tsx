import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentPickerAsset } from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { api, Subject } from '../../services/api';
import { uploadVideoInChunks } from '../../services/videoApi';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Section = 'scientific' | 'literary' | 'intensive';

const AddLesson = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSection, setSelectedSection] = useState<Section>('scientific');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [video, setVideo] = useState<DocumentPickerAsset | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [preparing, setPreparing] = useState(false);
  const fakeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const progressBarWidth = Math.round(Dimensions.get('window').width * 0.9);
  const progressBarStyles = StyleSheet.create({
    container: {
      marginVertical: 20,
      width: progressBarWidth,
      alignItems: 'center',
    },
    barBackground: {
      width: progressBarWidth,
      height: 10,
      backgroundColor: '#eee',
      borderRadius: 5,
      overflow: 'hidden',
    },
    barFill: {
      height: 10,
      backgroundColor: '#E31E24',
      borderRadius: 5,
    },
    percentText: {
      marginTop: 4,
      fontSize: 14,
      color: '#E31E24',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Filter subjects based on selected section from database
    const filtered = subjects.filter(subject => subject.section === selectedSection);
    setFilteredSubjects(filtered);
    setSelectedSubject('');
    setSelectedUnit('');
  }, [selectedSection, subjects]);

  const fetchSubjects = async () => {
    try {
      const data = await api.subjects.getAll();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء جلب المواد');
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

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الفيديو');
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !selectedSubject || !selectedUnit || !video) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsUploading(true);
    setPreparing(true);
    setUploadProgress(1);
    setUploadStatus('جاري إنشاء الدرس...');

    // Fake progress during preparation
    let fakeProgress = 1;
    fakeIntervalRef.current = setInterval(() => {
      fakeProgress += 1;
      if (fakeProgress <= 5 && preparing) setUploadProgress(fakeProgress);
    }, 200);

    try {
      // First create the lesson
      const lesson = await api.lessons.create(selectedSubject, selectedUnit, {
        name,
        description,
        order: 0,
        isFree,
      });

      setPreparing(false);
      if (fakeIntervalRef.current) clearInterval(fakeIntervalRef.current);
      setUploadStatus('جاري تحميل الفيديو...');
      setUploadProgress(5);

      await uploadVideoInChunks(
        selectedSubject,
        selectedUnit,
        lesson.id,
        video,
        {
          title: name,
          description: description,
          order: 0,
        },
        (percent) => {
          const progress = 5 + percent * 0.95;
          setUploadProgress(progress);
          setUploadStatus(`جاري تحميل الفيديو... (${Math.round(progress)}%)`);
        }
      );

      setUploadStatus('تم التحميل بنجاح!');
      setUploadProgress(100);
      Alert.alert('نجاح', 'تم إضافة الدرس والفيديو بنجاح');
      navigation.goBack();

    } catch (error) {
      setPreparing(false);
      if (fakeIntervalRef.current) clearInterval(fakeIntervalRef.current);
      console.error('Error creating lesson:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      Alert.alert(
        'خطأ',
        error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الدرس. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setPreparing(false);
      if (fakeIntervalRef.current) clearInterval(fakeIntervalRef.current);
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة درس جديد</Text>
      </View>

      <View style={styles.content}>
        {/* Section Selection */}
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

        {/* Subject Selection */}
        <Text style={styles.label}>اختر المادة</Text>
        {filteredSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد مواد في القسم {getSectionName(selectedSection)}</Text>
            <Text style={styles.emptySubText}>قم بإضافة مواد جديدة في هذا القسم أولاً</Text>
          </View>
        ) : (
          <View style={styles.subjectsList}>
            {filteredSubjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.subjectButton,
                  selectedSubject === subject.id && styles.selectedSubject,
                ]}
                onPress={() => {
                  setSelectedSubject(subject.id);
                  setSelectedUnit('');
                }}
              >
                <Text
                  style={[
                    styles.subjectButtonText,
                    selectedSubject === subject.id && styles.selectedSubjectText,
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Unit Selection */}
        {selectedSubject && (
          <>
            <Text style={styles.label}>اختر الوحدة</Text>
            <View style={styles.unitsList}>
              {subjects
                .find((s) => s.id === selectedSubject)
                ?.units.map((unit) => (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.unitButton,
                      selectedUnit === unit.id && styles.selectedUnit,
                    ]}
                    onPress={() => setSelectedUnit(unit.id)}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        selectedUnit === unit.id && styles.selectedUnitText,
                      ]}
                    >
                      {unit.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        {/* Lesson Details */}
        <Text style={styles.label}>اسم الدرس</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="أدخل اسم الدرس"
        />

        <Text style={styles.label}>وصف الدرس</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="أدخل وصف الدرس"
          multiline
          numberOfLines={4}
        />

        {/* Free Lesson Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>درس مجاني</Text>
          <Switch
            value={isFree}
            onValueChange={setIsFree}
            trackColor={{ false: '#767577', true: '#E31E24' }}
            thumbColor={isFree ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Video Selection */}
        <Text style={styles.label}>اختر الفيديو</Text>
        <TouchableOpacity style={styles.videoButton} onPress={pickVideo}>
          <Ionicons name="videocam" size={24} color="#E31E24" />
          <Text style={styles.videoButtonText}>
            {video ? video.name : 'اختر ملف الفيديو'}
          </Text>
        </TouchableOpacity>

        {video && (
          <View style={styles.videoInfo}>
            <Text style={styles.videoInfoText}>تم اختيار: {video.name}</Text>
            <Text style={styles.videoInfoText}>
              الحجم: {video.size ? (video.size / (1024 * 1024)).toFixed(2) : 'غير محدد'} MB
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isUploading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>إضافة الدرس</Text>
          )}
        </TouchableOpacity>

        {/* Upload Progress */}
        {isUploading && (
          <View style={progressBarStyles.container}>
            <Text style={styles.uploadStatus}>{uploadStatus}</Text>
            <View style={progressBarStyles.barBackground}>
              <View
                style={[
                  progressBarStyles.barFill,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </View>
            <Text style={progressBarStyles.percentText}>
              {Math.round(uploadProgress)}%
            </Text>
          </View>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSection: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  sectionButtonText: {
    color: '#333',
    fontSize: 16,
  },
  selectedSectionText: {
    color: '#fff',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  subjectButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSubject: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  subjectButtonText: {
    color: '#333',
    fontSize: 16,
  },
  selectedSubjectText: {
    color: '#fff',
  },
  unitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  unitButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedUnit: {
    backgroundColor: '#E31E24',
    borderColor: '#E31E24',
  },
  unitButtonText: {
    color: '#333',
    fontSize: 16,
  },
  selectedUnitText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  videoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    overflow: 'hidden',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoButtonText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
  },
  videoInfo: {
    marginBottom: 20,
  },
  videoInfoText: {
    color: '#333',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#E31E24',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  emptySubText: {
    color: '#999',
    marginTop: 10,
  },
  uploadStatus: {
    marginBottom: 10,
  },
});

export default AddLesson; 
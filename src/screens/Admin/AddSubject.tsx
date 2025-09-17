import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../services/api';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddSubjectRouteProp = RouteProp<RootStackParamList, 'AddSubject'>;

const AddSubject = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddSubjectRouteProp>();
  const [name, setName] = useState('');
  const [section, setSection] = useState<'scientific' | 'literary' | 'intensive'>('scientific');
  const [image, setImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (route.params?.subject) {
      const subject = route.params.subject;
      setName(subject.name);
      setSection(subject.section as 'scientific' | 'literary' | 'intensive');
      setImage(subject.image || null);
      setIsEditing(true);
    }
  }, [route.params]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم المادة');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('section', section);
      
      if (image) {
        const imageUri = image;
        const imageName = imageUri.split('/').pop() || 'image.jpg';
        const imageType = 'image/jpeg';
        
        console.log('Image details:', {
          uri: imageUri,
          name: imageName,
          type: imageType
        });

        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: imageName,
          type: imageType,
        } as any);
      }

      console.log('Form data being sent:', {
        name,
        section,
        hasImage: !!image,
        formDataKeys: Object.keys(formData)
      });

      if (isEditing && route.params?.subject) {
        console.log('Updating subject:', route.params.subject.id);
        const response = await api.subjects.update(route.params.subject.id, formData);
        console.log('Update response:', response);
        Alert.alert('نجاح', 'تم تحديث المادة بنجاح');
      } else {
        console.log('Creating new subject');
        const response = await api.subjects.create(formData);
        console.log('Create response:', response);
        Alert.alert('نجاح', 'تم إضافة المادة بنجاح');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        response: error?.response?.data
      });
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المادة. يرجى المحاولة مرة أخرى');
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
        <Text style={styles.title}>
          {isEditing ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>اسم المادة</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="أدخل اسم المادة"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>القسم</Text>
        <View style={styles.sectionButtons}>
          <TouchableOpacity
            style={[
              styles.sectionButton,
              section === 'scientific' && styles.selectedSection,
            ]}
            onPress={() => setSection('scientific')}
          >
            <Text
              style={[
                styles.sectionButtonText,
                section === 'scientific' && styles.selectedSectionText,
              ]}
            >
              علمي
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionButton,
              section === 'literary' && styles.selectedSection,
            ]}
            onPress={() => setSection('literary')}
          >
            <Text
              style={[
                styles.sectionButtonText,
                section === 'literary' && styles.selectedSectionText,
              ]}
            >
              أدبي
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sectionButton,
              section === 'intensive' && styles.selectedSection,
            ]}
            onPress={() => setSection('intensive')}
          >
            <Text
              style={[
                styles.sectionButtonText,
                section === 'intensive' && styles.selectedSectionText,
              ]}
            >
              مكثف
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>صورة المادة</Text>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleImagePick}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#999" />
              <Text style={styles.imagePlaceholderText}>
                اضغط لاختيار صورة
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة المادة'}
          </Text>
        </TouchableOpacity>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
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
  imagePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#E31E24',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddSubject; 
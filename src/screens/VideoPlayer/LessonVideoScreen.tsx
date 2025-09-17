import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ScreenCapture from 'expo-screen-capture';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../services/api';

// Define the navigation params type
// You may need to adjust this based on your navigation setup

type LessonVideoScreenRouteProp = RouteProp<{
  params: {
    lesson: {
      id: string;
      name: string;
      description: string;
      subjectId: string;
      unitId: string;
      video?: {
        url: string;
        title?: string;
        description?: string;
      };
    };
  };
}, 'params'>;

const { width } = Dimensions.get('window');

const LessonVideoScreen = ({ navigation }: any) => {
  const route = useRoute<LessonVideoScreenRouteProp>();
  const { lesson } = route.params;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();

    const checkAndPlayOffline = async () => {
      setDownloading(true);
      setError(null);
      const fileUri = FileSystem.cacheDirectory + `lesson_${lesson.id}.mp4`;
      try {
        console.log('Checking file in cache:', fileUri);
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log('File info:', fileInfo);
        if (fileInfo.exists) {
          setLocalUri(fileUri);
          setVideoUrl(null);
          setDownloading(false);
          return;
        }
      } catch (err) {
        console.log('Error checking file in cache:', err);
        setError('خطأ في قراءة الفيديو من الكاش');
        setDownloading(false);
        return;
      }
      // إذا لم يكن موجودًا في الكاش، فقط وقتها حاول جلبه من الإنترنت
      try {
        let url: string | null = null;
        if (lesson.subjectId && lesson.unitId) {
          const videos = await api.videos.getAll(lesson.subjectId, lesson.unitId, lesson.id);
          if (videos && videos.length > 0) {
            let rawUrl = videos[0].url;
            let fullUrl = rawUrl.startsWith('http')
              ? rawUrl
              : `${API_URL}${rawUrl}`;
            url = fullUrl;
          }
        }
        if (!url) {
          setError('لا يوجد فيديو متاح لهذا الدرس');
          setDownloading(false);
          return;
        }
        setVideoUrl(url);
        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          fileUri
        );
        await downloadResumable.downloadAsync();
        setLocalUri(fileUri);
        setVideoUrl(null);
      } catch (err: any) {
        setError('حدث خطأ أثناء تحميل الفيديو من الإنترنت.');
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الفيديو من الإنترنت. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
      } finally {
        setDownloading(false);
      }
    };

    checkAndPlayOffline();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [lesson]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.name}</Text>
      </View>
      <View style={styles.videoContainer}>
        {downloading ? (
          <ActivityIndicator size="large" color="#E31E24" />
        ) : error ? (
          <View style={styles.noVideo}>
            <Ionicons name="videocam" size={64} color="#ccc" />
            <Text style={styles.noVideoText}>{error}</Text>
          </View>
        ) : localUri || videoUrl ? (
          <Video
            source={{ uri: localUri || videoUrl! }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
            style={styles.video}
          />
        ) : (
          <View style={styles.noVideo}>
            <Ionicons name="videocam" size={64} color="#ccc" />
            <Text style={styles.noVideoText}>لا يوجد فيديو متاح لهذا الدرس</Text>
          </View>
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.lessonTitle}>{lesson.name}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
      </View>
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
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    height: width * 0.56, // 16:9 aspect ratio
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  noVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#888',
    fontSize: 18,
    marginTop: 10,
  },
  details: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
    textAlign: 'right',
  },
  lessonDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'right',
  },
});

export default LessonVideoScreen; 
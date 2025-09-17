// @ts-ignore: If you see a type error here, make sure to install react-native-dotenv and configure babel
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from './device'; // Import the device service

// Helper function to get all necessary API headers
export const getApiHeaders = async (isFormData = false) => {
  const token = await AsyncStorage.getItem('token');
  const deviceId = await getDeviceId();

  const headers: { [key: string]: string } = {
    'X-Device-ID': deviceId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Helper function to get auth headers, now includes device ID
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  console.log('Current token:', token);
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export interface Subject {
  id: string;
  name: string;
  section: string;
  image?: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  lessons: Lesson[];
  quizzes: Quiz[];
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  video?: Video;
  videos?: Video[];
  order: number;
  isFree?: boolean;
  subjectId?: string;
  unitId?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export const api = {
  // Subjects
  subjects: {
    getAll: async (): Promise<Subject[]> => {
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects`, { headers });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        // Cache the data
        await AsyncStorage.setItem('subjects', JSON.stringify(data));
        return data;
      } catch (err) {
        // If fetch fails, try to load from cache
        const cached = await AsyncStorage.getItem('subjects');
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },

    getById: async (id: string): Promise<Subject> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${id}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch subject');
      }
      return response.json();
    },

    getBySection: async (section: string): Promise<Subject[]> => {
      const cacheKey = `subjects_section_${section}`;
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects/section/${section}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch subjects by section');
        const data = await response.json();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },

    create: async (formData: FormData): Promise<Subject> => {
      const headers = await getApiHeaders(true);
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        body: formData,
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to create subject');
      }
      return response.json();
    },

    update: async (id: string, formData: FormData): Promise<Subject> => {
      const headers = await getApiHeaders(true);
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'PUT',
        body: formData,
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to update subject');
      }
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }
    },
  },

  // Units
  units: {
    getAll: async (subjectId: string): Promise<Unit[]> => {
      const cacheKey = `units_${subjectId}`;
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects/${subjectId}/units`, { headers });
        if (!response.ok) throw new Error('Failed to fetch units');
        const data = await response.json();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },

    create: async (subjectId: string, data: { name: string; order: number }): Promise<Unit> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating unit:', errorData);
        throw new Error(errorData.message || 'Failed to create unit');
      }
      return response.json();
    },

    update: async (subjectId: string, unitId: string, data: { name: string; order: number }): Promise<Unit> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update unit');
      }
      return response.json();
    },

    delete: async (subjectId: string, unitId: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }
    },
  },

  // Lessons
  lessons: {
    getAll: async (subjectId: string, unitId: string): Promise<Lesson[]> => {
      const cacheKey = `lessons_${subjectId}_${unitId}`;
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons`, { headers });
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },

    create: async (
      subjectId: string,
      unitId: string,
      data: { name: string; description: string; order: number; isFree?: boolean }
    ): Promise<Lesson> => {
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });

        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
          console.error('Failed to create lesson:', {
            status: response.status,
            statusText: response.statusText,
            responseData,
            url: `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons`,
            body: data
          });
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 404) {
            throw new Error('Unit or subject not found. Please check your selection.');
          } else {
            throw new Error(responseData?.message || 'Failed to create lesson');
          }
        }

        return responseData;
      } catch (error) {
        console.error('Error creating lesson:', error);
        throw error;
      }
    },

    update: async (
      subjectId: string,
      unitId: string,
      lessonId: string,
      data: { name: string; description: string; order: number; isFree?: boolean }
    ): Promise<Lesson> => {
      const headers = await getApiHeaders();
      const response = await fetch(
        `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      return response.json();
    },

    delete: async (subjectId: string, unitId: string, lessonId: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(
        `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    },
  },

  // Videos
  videos: {
    getAll: async (subjectId: string, unitId: string, lessonId: string): Promise<Video[]> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/videos`, {
        headers,
      });
      if (!response.ok) {
        // Log the error for better debugging
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch videos' }));
        console.error('Error fetching videos:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch videos');
      }
      return response.json();
    },
    delete: async (subjectId: string, unitId: string, lessonId: string, videoId: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(
        `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
    },
  },

  // Devices
  devices: {
    activate: async (deviceId: string, activationCode: string): Promise<any> => {
      const headers = await getApiHeaders();
      
      if (activationCode) {
        // تفعيل الجهاز
        const response = await fetch(`${API_URL}/devices/activate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ deviceId, activationCode }),
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to activate subscription');
        }
        return responseData;
      } else {
        // فحص حالة الجهاز فقط
        const response = await fetch(`${API_URL}/devices/status/${deviceId}`, {
          method: 'GET',
          headers,
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to check device status');
        }
        return responseData;
      }
    },

    getStatus: async (deviceId: string): Promise<any> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/devices/status/${deviceId}`, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to check device status');
      }
      return responseData;
    },
  },

  // Sessions
  sessions: {
    validate: async (): Promise<any> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/sessions/validate`, { headers });
      if (!response.ok) {
        throw new Error('Session validation failed');
      }
      return response.json();
    },

    logout: async (): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
    },
  },

  // Quizzes
  quizzes: {
    getAll: async (subjectId: string, unitId: string, lessonId: string): Promise<Quiz[]> => {
      const cacheKey = `quizzes_${subjectId}_${unitId}_${lessonId}`;
      try {
        const headers = await getApiHeaders();
        const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/quizzes`, { headers });
        if (!response.ok) throw new Error('Failed to fetch quizzes');
        const data = await response.json();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },

    create: async (
      subjectId: string,
      unitId: string,
      lessonId: string,
      data: { title: string; questions: { question: string; choices: string[]; correctIndex: number }[] }
    ): Promise<Quiz> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/quizzes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }
      return response.json();
    },

    delete: async (subjectId: string, unitId: string, lessonId: string, quizId: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/quizzes/${quizId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
    },
  },

  // Activation Codes
  activationCodes: {
    debug: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/activation-codes/debug`);
      if (!response.ok) {
        throw new Error('Failed to debug activation codes');
      }
      return response.json();
    },

    getAll: async (): Promise<any[]> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/activation-codes`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch activation codes');
      }
      return response.json();
    },

    create: async (data: { deviceUUID: string; section: string }): Promise<any> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/activation-codes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create activation code');
      }
      return response.json();
    },

    delete: async (codeId: string): Promise<void> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/activation-codes/${codeId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete activation code');
      }
    },

    activate: async (code: string, deviceId: string): Promise<any> => {
      const headers = await getApiHeaders();
      const response = await fetch(`${API_URL}/activation-codes/activate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, deviceId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to activate code');
      }
      return response.json();
    },
  },
};
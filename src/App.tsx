import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './store';

// Screens
import AddLesson from './screens/Admin/AddLesson';
import AddQuiz from './screens/Admin/AddQuiz';
import AddSubject from './screens/Admin/AddSubject';
import AddUnit from './screens/Admin/AddUnit';
import AdminDashboard from './screens/Admin/index';
import ManageActivationCodes from './screens/Admin/ManageActivationCodes';
import ManageLessons from './screens/Admin/ManageLessons';
import ManageQuizzes from './screens/Admin/ManageQuizzes';
import SubjectUnits from './screens/Admin/SubjectUnits';
import HomeScreen from './screens/Home/index';
import IntensiveSubjectsScreen from './screens/IntensiveSubjects';
import LessonQuizzesScreen from './screens/LessonQuizzesScreen';
import LiterarySubjectsScreen from './screens/LiterarySubjects';
import LoginScreen from './screens/Login/index';
import QuizResultScreen from './screens/QuizResultScreen';
import QuizStartScreen from './screens/QuizStartScreen';
import ScientificSubjectsScreen from './screens/ScientificSubjects';
import SubjectUnitsView from './screens/SubjectUnitsView';
import SubscriptionScreen from './screens/Subscription';
import UnitLessonsScreen from './screens/UnitLessonsScreen';
import LessonVideoScreen from './screens/VideoPlayer/LessonVideoScreen';

import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('فشل الحصول على إذن الإشعارات!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // Send token to backend
    await fetch(`${API_URL}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  } else {
    alert('يجب استخدام جهاز حقيقي للإشعارات');
  }
  return token;
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }

    // Check login status
    const checkAppState = async () => {
      try {
        // Check token and user data
        const [token, userData] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('userData')
        ]);

        if (token && userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.isLoggedIn) {
            // Check if session is still valid (24 hours)
            const loginTime = new Date(parsedData.loginTime);
            const currentTime = new Date();
            const hoursDiff = (currentTime.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
              setIsLoggedIn(true);
              setUserRole(parsedData.role);
            } else {
              // Session expired, clear storage
              await Promise.all([
                AsyncStorage.removeItem('userData'),
                AsyncStorage.removeItem('token')
              ]);
              setIsLoggedIn(false);
              setUserRole(null);
            }
          }
        }
      } catch (error) {
        console.error('Error checking app state:', error);
        // Clear storage on error
        await Promise.all([
          AsyncStorage.removeItem('userData'),
          AsyncStorage.removeItem('token')
        ]);
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAppState();

    registerForPushNotificationsAsync();
    // Handle notification received in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // يمكنك عرض Toast أو Alert هنا
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === 'ios' ? 'default' : 'fade',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Admin" component={AdminDashboard} />
            <Stack.Screen name="AddSubject" component={AddSubject} />
            <Stack.Screen name="AddUnit" component={AddUnit} />
            <Stack.Screen name="AddLesson" component={AddLesson} />
            <Stack.Screen name="AddQuiz" component={AddQuiz} />
            <Stack.Screen name="ManageLessons" component={ManageLessons} />
            <Stack.Screen name="ManageQuizzes" component={ManageQuizzes} />
            <Stack.Screen name="ManageActivationCodes" component={ManageActivationCodes} />
            <Stack.Screen name="SubjectUnits" component={SubjectUnits} />
            <Stack.Screen name="SubjectUnitsView" component={SubjectUnitsView} />
            <Stack.Screen name="UnitLessons" component={UnitLessonsScreen} />
            <Stack.Screen name="ScientificSubjects" component={ScientificSubjectsScreen} />
            <Stack.Screen name="LiterarySubjects" component={LiterarySubjectsScreen} />
            <Stack.Screen name="IntensiveSubjects" component={IntensiveSubjectsScreen} />
            <Stack.Screen name="LessonVideo" component={LessonVideoScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="QuizStart" component={QuizStartScreen} options={{ headerShown: false }} />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LessonQuizzes" component={LessonQuizzesScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App; 
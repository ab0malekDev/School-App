import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const Drawer = ({ isVisible, onClose }: DrawerProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [logoPressCount, setLogoPressCount] = useState(0);
  const [lastPressTime, setLastPressTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const translateX = new Animated.Value(-width);
  const opacity = new Animated.Value(0);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Check login status when drawer opens
      (async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          setIsLoggedIn(!!userData);
        } catch {
          setIsLoggedIn(false);
        }
      })();
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleLogoPress = async () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastPressTime < 1000) {
      setLogoPressCount(prev => prev + 1);
      if (logoPressCount === 3) {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            navigation.navigate('Admin');
          } else {
            navigation.navigate('Login');
          }
          setLogoPressCount(0);
        } catch (error) {
          console.error('Error checking user data:', error);
          navigation.navigate('Login');
        }
      }
    } else {
      setLogoPressCount(1);
    }
    setLastPressTime(currentTime);
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: opacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.drawerContent,
          {
            transform: [{ translateX }],
          }
        ]}
      >
        <LinearGradient
          colors={['#E31E24', '#FF6B6B']}
          style={styles.headerGradient}
        >
          <TouchableOpacity 
            style={styles.logoContainer} 
            onPress={handleLogoPress}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.menuItems}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Ionicons name="notifications" size={24} color="#E31E24" />
            </View>
            <Text style={styles.menuItemText}>الاشعارات</Text>
            <View style={styles.menuItemBadge}>
              <Text style={styles.menuItemBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('Subscription');
              onClose(); // Close the drawer after navigation
            }}
          >
            <View style={styles.menuItemIconContainer}>
              <Ionicons name="key" size={24} color="#E31E24" />
            </View>
            <Text style={styles.menuItemText}>تفعيل الاشتراك</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Ionicons name="briefcase" size={24} color="#E31E24" />
            </View>
            <Text style={styles.menuItemText}>اعمالنا</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Ionicons name="help-circle" size={24} color="#E31E24" />
            </View>
            <Text style={styles.menuItemText}>المساعدة</Text>
          </TouchableOpacity>

          {isLoggedIn && (
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons name="log-out-outline" size={24} color="#E31E24" />
              </View>
              <Text style={[styles.menuItemText, { color: '#E31E24' }]}>تسجيل الخروج</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>البيروني © 2024</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  menuItems: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  menuItemBadge: {
    backgroundColor: '#E31E24',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  menuItemBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  logoutMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 'auto',
  },
});

export default Drawer; 
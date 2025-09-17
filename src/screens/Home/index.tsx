import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Drawer from '../../components/common/Drawer';
import Footer from '../../components/common/Footer';
import Header from '../../components/common/Header';
import AboutModal from '../../components/modals/AboutModal';
import ContactModal from '../../components/modals/ContactModal';
import PolicyModal from '../../components/modals/PolicyModal';

const HomeScreen = ({ navigation }: any) => {
  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const [isPolicyModalVisible, setPolicyModalVisible] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleContactPress = () => {
    setContactModalVisible(true);
  };

  const handlePolicyPress = () => {
    setPolicyModalVisible(true);
  };

  const handleAboutPress = () => {
    setAboutModalVisible(true);
  };

  const handleScientificPress = () => {
    navigation.navigate('ScientificSubjects');
  };

  const handleLiteraryPress = () => {
    navigation.navigate('LiterarySubjects');
  };

  const handleIntensivePress = () => {
    navigation.navigate('IntensiveSubjects');
  };

  const handleCloseContactModal = () => {
    setContactModalVisible(false);
  };

  const handleClosePolicyModal = () => {
    setPolicyModalVisible(false);
  };

  const handleCloseAboutModal = () => {
    setAboutModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={handleMenuPress} />
      <ScrollView style={styles.content}>
        <View style={styles.middleContent}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <TouchableOpacity style={styles.button} onPress={handleScientificPress}>
            <Text style={styles.buttonText}>علمي</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLiteraryPress}>
            <Text style={styles.buttonText}>ادبي</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleIntensivePress}>
            <Text style={styles.buttonText}>الدورة المكثفة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer
        onContactPress={handleContactPress}
        onPolicyPress={handlePolicyPress}
        onAboutPress={handleAboutPress}
      />
      <ContactModal
        isVisible={isContactModalVisible}
        onClose={handleCloseContactModal}
      />
      <PolicyModal
        isVisible={isPolicyModalVisible}
        onClose={handleClosePolicyModal}
      />
      <AboutModal
        isVisible={isAboutModalVisible}
        onClose={handleCloseAboutModal}
      />
      <Drawer
        isVisible={isDrawerVisible}
        onClose={handleDrawerClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  middleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderColor: '#E31E24',
    borderWidth: 5,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#E31E24',
    borderWidth: 2,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 
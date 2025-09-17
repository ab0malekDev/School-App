import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import config from '../../config/config.json';

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ContactModal = ({ isVisible, onClose }: ContactModalProps) => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>تواصل معنا</Text>

          <TouchableOpacity
            style={styles.contactOption}
            onPress={() => handleLinkPress(config.contactLinks.whatsapp)}
          >
            <Ionicons name="logo-whatsapp" size={30} color="#25D366" />
            <Text style={styles.optionText}>واتساب</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactOption}
            onPress={() => handleLinkPress(config.contactLinks.phone)}
          >
            <Ionicons name="call" size={30} color="#007AFF" />
            <Text style={styles.optionText}>اتصال هاتفي</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactOption}
            onPress={() => handleLinkPress(config.contactLinks.youtube)}
          >
            <Ionicons name="logo-youtube" size={30} color="#FF0000" />
            <Text style={styles.optionText}>يوتيوب</Text>
          </TouchableOpacity>

          {/* يمكنك إضافة المزيد من خيارات التواصل هنا */}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E31E24',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#E31E24',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ContactModal; 
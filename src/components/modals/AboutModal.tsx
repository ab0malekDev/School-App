import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import config from '../../config/config.json';

interface AboutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutModal = ({ isVisible, onClose }: AboutModalProps) => {
  const renderAboutText = () => {
    const sections = config.aboutApp.split('\n\n'); // Split by double newline for main sections
    return sections.map((section, sectionIndex) => {
      const lines = section.split('\n');
      return (
        <View key={sectionIndex} style={styles.sectionContainer}>
          {lines.map((line, lineIndex) => {
            // Check for bullet points and other specific formatting
            if (line.startsWith('* ')) {
              return (
                <Text key={lineIndex} style={styles.bulletText}>
                  {line}
                </Text>
              );
            } else {
              return (
                <Text key={lineIndex} style={styles.aboutText}>
                  {line}
                </Text>
              );
            }
          })}
        </View>
      );
    });
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
          <Text style={styles.modalTitle}>حول التطبيق</Text>
          <ScrollView style={styles.scrollView}>
            {renderAboutText()}
          </ScrollView>
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E31E24',
  },
  scrollView: {
    flexGrow: 1,
    width: '100%',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'justify',
    lineHeight: 24,
  },
  bulletText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 5,
    paddingLeft: 10,
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

export default AboutModal; 
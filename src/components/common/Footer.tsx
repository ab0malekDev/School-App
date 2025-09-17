import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FooterProps {
  onContactPress: () => void;
  onPolicyPress: () => void;
  onAboutPress: () => void;
}

const Footer = ({ onContactPress, onPolicyPress, onAboutPress }: FooterProps) => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerItem}>
        <TouchableOpacity onPress={onContactPress} style={styles.iconButton}>
          <Ionicons name="call" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.footerText}>تواصل معنا</Text>
      </View>
      <View style={styles.footerItem}>
        <TouchableOpacity onPress={onPolicyPress} style={styles.iconButton}>
          <Ionicons name="document-text" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.footerText}>سياسة الاستخدام</Text>
      </View>
      <View style={styles.footerItem}>
        <TouchableOpacity onPress={onAboutPress} style={styles.iconButton}>
          <Ionicons name="information-circle" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.footerText}>حول التطبيق</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#E31E24',
    borderWidth: 2,
  },
  footerText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default Footer; 
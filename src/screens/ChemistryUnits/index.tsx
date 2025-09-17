import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chemistryUnits = [
  {
    id: '1',
    name: 'الكيمياء النووية',
    icon: 'nuclear',
    color: '#FF5722'
  },
  {
    id: '2',
    name: 'الغازات',
    icon: 'cloud',
    color: '#03A9F4'
  },
  {
    id: '3',
    name: 'حركية التفاعلات الكيميائية',
    icon: 'flask',
    color: '#8BC34A'
  },
  {
    id: '4',
    name: 'الكيمياء التحليلية',
    icon: 'analytics',
    color: '#9C27B0'
  },
  {
    id: '5',
    name: 'الكيمياء العضوية',
    icon: 'leaf',
    color: '#4CAF50'
  }
];

const ChemistryUnitsScreen = () => {
  const navigation = useNavigation();

  const handleUnitPress = (unitId: string, unitName: string) => {
    console.log(`Unit pressed: ${unitName}`);
    // Add navigation to unit content here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الكيمياء</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {chemistryUnits.map((unit) => (
          <TouchableOpacity
            key={unit.id}
            style={[styles.unitCard, { borderLeftColor: unit.color }]}
            onPress={() => handleUnitPress(unit.id, unit.name)}
          >
            <View style={[styles.iconContainer, { backgroundColor: unit.color }]}>
              <Ionicons name={unit.icon as any} size={30} color="#fff" />
            </View>
            <Text style={styles.unitName}>{unit.name}</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#E31E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    paddingTop: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  unitName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default ChemistryUnitsScreen; 
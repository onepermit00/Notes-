import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PatientHeader({ patient, onPress, theme }) {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: patient.photo }} 
        style={styles.photo}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{patient.name}</Text>
        <Text style={[styles.details, { color: theme.textSecondary }]}>
          {patient.age} years • {patient.conditions[0]}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
  },
});

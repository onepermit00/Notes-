import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function AICopilotButton({ navigation, theme }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AICopilot');
  };

  return (
    <TouchableOpacity 
      style={[styles.fab, { backgroundColor: theme.primary }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.sparkleContainer}>
        <Ionicons name="sparkles" size={24} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sparkleContainer: {
    transform: [{ rotate: '-15deg' }],
  },
});

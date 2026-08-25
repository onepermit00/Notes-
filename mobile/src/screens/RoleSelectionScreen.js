import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function RoleSelectionScreen({ navigation }) {
  const { theme, setDarkMode } = useTheme();

  const roles = [
    {
      id: 'caregiver',
      title: 'Caregiver',
      description: 'Professional caregivers managing patient care',
      icon: 'heart-circle',
      color: '#25D366',
      darkMode: true,
    },
    {
      id: 'family',
      title: 'Family Member',
      description: 'Family guardians monitoring loved ones',
      icon: 'people',
      color: '#3b82f6',
      darkMode: false,
    },
    {
      id: 'agency',
      title: 'Agency',
      description: 'Healthcare agencies managing staff',
      icon: 'business',
      color: '#8b5cf6',
      darkMode: false,
    },
  ];

  const handleRoleSelect = async (role) => {
    // Set dark mode based on role preference
    await setDarkMode(role.darkMode);
    navigation.navigate('Auth', { role: role.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1c1917" />
        </TouchableOpacity>

        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you'll be using ADLTrack
        </Text>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: `${role.color}15` }]}>
                <Ionicons name={role.icon} size={32} color={role.color} />
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#a8a29e" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can switch roles anytime from settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f5f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#78716c',
    marginTop: 8,
    marginBottom: 40,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1917',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#78716c',
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#a8a29e',
    textAlign: 'center',
  },
});

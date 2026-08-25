import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { mockPatient, mockVitals } from '../../data/mockData';

export default function PatientProfileScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Patient Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Info Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <Image source={{ uri: mockPatient.photo }} style={styles.profilePhoto} />
          <Text style={[styles.profileName, { color: theme.text }]}>{mockPatient.name}</Text>
          <Text style={[styles.profileAge, { color: theme.textSecondary }]}>
            {mockPatient.age} years old
          </Text>
        </View>

        {/* Conditions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Conditions</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            {mockPatient.conditions.map((condition, index) => (
              <View
                key={index}
                style={[
                  styles.listItem,
                  index < mockPatient.conditions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Ionicons name="medical" size={18} color={theme.primary} />
                <Text style={[styles.listItemText, { color: theme.text }]}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Allergies</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            {mockPatient.allergies.map((allergy, index) => (
              <View
                key={index}
                style={[
                  styles.listItem,
                  index < mockPatient.allergies.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Ionicons name="warning" size={18} color={theme.danger} />
                <Text style={[styles.listItemText, { color: theme.text }]}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Medications</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            {mockPatient.medications.map((medication, index) => (
              <View
                key={index}
                style={[
                  styles.listItem,
                  index < mockPatient.medications.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Ionicons name="medkit" size={18} color="#3b82f6" />
                <Text style={[styles.listItemText, { color: theme.text }]}>{medication}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Contact</Text>
          <View style={[styles.emergencyCard, { backgroundColor: `${theme.danger}15` }]}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="call" size={20} color={theme.danger} />
              <Text style={[styles.emergencyName, { color: theme.text }]}>
                {mockPatient.emergencyContact.name}
              </Text>
            </View>
            <Text style={[styles.emergencyRelation, { color: theme.textSecondary }]}>
              {mockPatient.emergencyContact.relationship}
            </Text>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.danger }]}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.callButtonText}>{mockPatient.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 28,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listItemText: {
    fontSize: 15,
    flex: 1,
  },
  emergencyCard: {
    borderRadius: 16,
    padding: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  emergencyName: {
    fontSize: 17,
    fontWeight: '600',
  },
  emergencyRelation: {
    fontSize: 14,
    marginLeft: 30,
    marginBottom: 14,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

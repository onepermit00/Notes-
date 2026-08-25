import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { mockIncidents, incidentTypes, mockPatient } from '../../data/mockData';

export default function IncidentScreen({ navigation }) {
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState(mockIncidents);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notifyEmergency, setNotifyEmergency] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setDescription('');
    setPhotos([]);
    setNotifyEmergency(false);
  };

  const handleCreateIncident = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNewIncident(true);
    resetForm();
  };

  const handleSelectType = (type) => {
    Haptics.selectionAsync();
    setSelectedType(type);
    setStep(2);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const newIncident = {
      id: Date.now(),
      type: selectedType.id,
      title: `${selectedType.label} Incident`,
      description,
      photos,
      status: 'open',
      notifyEmergency,
      createdAt: new Date().toISOString(),
      createdBy: 'Sarah Jenkins',
    };

    setIncidents([newIncident, ...incidents]);
    setShowNewIncident(false);
    
    if (notifyEmergency) {
      Alert.alert(
        'Emergency Contact Notified',
        'The emergency contact has been notified of this incident.',
        [{ text: 'OK' }]
      );
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      fall: 'alert-circle',
      injury: 'bandage',
      behavior: 'brain',
      medication: 'medical',
      health: 'heart',
      other: 'ellipsis-horizontal',
    };
    return icons[type] || 'alert-circle';
  };

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Incidents</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Report and track incidents for {mockPatient.name}
          </Text>
        </View>

        {/* New Incident Button */}
        <TouchableOpacity
          style={[styles.newIncidentCard, { backgroundColor: theme.danger }]}
          onPress={handleCreateIncident}
          activeOpacity={0.8}
        >
          <View style={styles.newIncidentContent}>
            <View style={styles.newIncidentIcon}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.newIncidentTitle}>New Incident Report</Text>
              <Text style={styles.newIncidentSubtitle}>Document and report an incident</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNumber, { color: theme.text }]}>{incidents.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNumber, { color: theme.danger }]}>{openIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Open</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNumber, { color: theme.primary }]}>{resolvedIncidents}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Resolved</Text>
          </View>
        </View>

        {/* Past Reports */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Past Reports</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.danger }]}>
            <Text style={styles.countBadgeText}>{incidents.length}</Text>
          </View>
        </View>

        {incidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={[styles.incidentCard, { backgroundColor: theme.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.incidentHeader}>
              <View style={styles.incidentTypeContainer}>
                <View style={[styles.incidentTypeIcon, { backgroundColor: `${theme.danger}20` }]}>
                  <Ionicons name={getTypeIcon(incident.type)} size={20} color={theme.danger} />
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: incident.status === 'open' ? theme.danger : theme.primary },
                  ]}
                >
                  <Text style={styles.statusText}>{incident.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.incidentTime, { color: theme.textSecondary }]}>
                {new Date(incident.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.incidentTitle, { color: theme.text }]}>{incident.title}</Text>
            <Text style={[styles.incidentDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {incident.description}
            </Text>
            {incident.photos?.length > 0 && (
              <View style={styles.photoIndicator}>
                <Ionicons name="images" size={14} color={theme.textSecondary} />
                <Text style={[styles.photoCount, { color: theme.textSecondary }]}>
                  {incident.photos.length} photo{incident.photos.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New Incident Modal */}
      <Modal visible={showNewIncident} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowNewIncident(false)}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Incident</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Step 1: Select Type */}
          {step === 1 && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>What type of incident?</Text>
              <View style={styles.typeGrid}>
                {incidentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeCard, { backgroundColor: theme.card }]}
                    onPress={() => handleSelectType(type)}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: `${theme.danger}20` }]}>
                      <Ionicons name={getTypeIcon(type.id)} size={28} color={theme.danger} />
                    </View>
                    <Text style={[styles.typeLabel, { color: theme.text }]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Step 2: Add Details */}
          {step === 2 && (
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Describe what happened</Text>
              
              <View style={[styles.selectedTypeChip, { backgroundColor: `${theme.danger}20` }]}>
                <Ionicons name={getTypeIcon(selectedType?.id)} size={16} color={theme.danger} />
                <Text style={[styles.selectedTypeText, { color: theme.danger }]}>
                  {selectedType?.label}
                </Text>
              </View>

              <TextInput
                style={[
                  styles.descriptionInput,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholder="Describe the incident in detail..."
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              {/* Photo Section */}
              <Text style={[styles.photoSectionTitle, { color: theme.text }]}>Attach Photos</Text>
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: theme.card }]}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={24} color={theme.primary} />
                  <Text style={[styles.photoButtonText, { color: theme.text }]}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: theme.card }]}
                  onPress={handlePickImage}
                >
                  <Ionicons name="images" size={24} color={theme.primary} />
                  <Text style={[styles.photoButtonText, { color: theme.text }]}>Gallery</Text>
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <ScrollView horizontal style={styles.photoPreviewRow}>
                  {photos.map((uri, index) => (
                    <View key={index} style={styles.photoPreview}>
                      <Image source={{ uri }} style={styles.photoImage} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close-circle" size={22} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Emergency Toggle */}
              <TouchableOpacity
                style={[styles.emergencyToggle, { backgroundColor: theme.card }]}
                onPress={() => setNotifyEmergency(!notifyEmergency)}
              >
                <View style={styles.emergencyToggleContent}>
                  <Ionicons name="warning" size={24} color={theme.danger} />
                  <View style={styles.emergencyToggleText}>
                    <Text style={[styles.emergencyToggleTitle, { color: theme.text }]}>
                      Notify Emergency Contact
                    </Text>
                    <Text style={[styles.emergencyToggleSubtitle, { color: theme.textSecondary }]}>
                      Send alert to {mockPatient.emergencyContact.name}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.toggle,
                    { backgroundColor: notifyEmergency ? theme.primary : theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      { transform: [{ translateX: notifyEmergency ? 20 : 0 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: description.trim() ? theme.danger : theme.border },
                ]}
                onPress={handleSubmit}
                disabled={!description.trim()}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { marginTop: 16, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 4 },
  newIncidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  newIncidentContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  newIncidentIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newIncidentTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  newIncidentSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryNumber: { fontSize: 28, fontWeight: '700' },
  summaryLabel: { fontSize: 13, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  countBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  incidentCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentTypeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incidentTypeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  incidentTime: { fontSize: 13 },
  incidentTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  incidentDesc: { fontSize: 14, lineHeight: 20 },
  photoIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  photoCount: { fontSize: 13 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalContent: { flex: 1 },
  modalScrollContent: { padding: 20 },
  stepTitle: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '47%', padding: 20, borderRadius: 16, alignItems: 'center' },
  typeIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  typeLabel: { fontSize: 15, fontWeight: '500' },
  selectedTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  selectedTypeText: { fontSize: 14, fontWeight: '600' },
  descriptionInput: { height: 150, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20 },
  photoSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  photoButtonText: { fontSize: 15, fontWeight: '500' },
  photoPreviewRow: { marginTop: 16 },
  photoPreview: { marginRight: 12, position: 'relative' },
  photoImage: { width: 80, height: 80, borderRadius: 12 },
  removePhotoButton: { position: 'absolute', top: -6, right: -6 },
  emergencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  emergencyToggleContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  emergencyToggleText: { flex: 1 },
  emergencyToggleTitle: { fontSize: 16, fontWeight: '500' },
  emergencyToggleSubtitle: { fontSize: 13, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 4 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff' },
  submitButton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
});

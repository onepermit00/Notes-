import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

export default function TaskDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { task } = route.params;
  
  const [status, setStatus] = useState(task.status);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
    }
  };

  const handleCompleteTask = async () => {
    if (task.requires_photo && !photo) {
      Alert.alert('Photo Required', 'Please take a photo to complete this task.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setStatus('completed');
    setIsSubmitting(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'Task Completed!',
      'The task has been marked as complete.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const priorityColors = {
    critical: theme.danger,
    standard: theme.textSecondary,
    low: theme.border,
  };

  const isCompleted = status === 'completed';

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Task Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        {isCompleted && (
          <View style={[styles.completedBanner, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
            <Text style={[styles.completedText, { color: theme.primary }]}>Task Completed</Text>
          </View>
        )}

        {/* Task Header */}
        <View style={[styles.taskHeader, { backgroundColor: theme.card }]}>
          <View style={styles.taskBadges}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[task.priority] },
              ]}
            >
              <Text style={styles.priorityText}>{task.priority?.toUpperCase()}</Text>
            </View>
            {task.requires_photo && (
              <View style={[styles.photoBadge, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="camera" size={14} color={theme.primary} />
                <Text style={[styles.photoBadgeText, { color: theme.primary }]}>Photo Required</Text>
              </View>
            )}
          </View>
          <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.taskTime, { color: theme.textSecondary }]}>
              Scheduled: {task.scheduled_time}
              {task.time_window && ` (${task.time_window} window)`}
            </Text>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.descriptionText, { color: theme.text }]}>
                {task.description}
              </Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        {task.instructions && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.instructionsText, { color: theme.text }]}>
                {task.instructions}
              </Text>
            </View>
          </View>
        )}

        {!isCompleted && (
          <>
            {/* Photo Capture */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {task.requires_photo ? 'Photo Evidence (Required)' : 'Photo Evidence (Optional)'}
              </Text>
              {photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={[styles.retakeButton, { backgroundColor: theme.card }]}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={18} color={theme.text} />
                    <Text style={[styles.retakeText, { color: theme.text }]}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.photoCapture, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={40} color={theme.primary} />
                  <Text style={[styles.photoCaptureText, { color: theme.text }]}>Tap to Take Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Completion Note */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Completion Note</Text>
              <TextInput
                style={[
                  styles.noteInput,
                  { backgroundColor: theme.card, color: theme.text },
                ]}
                placeholder="Add any notes about task completion..."
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: theme.primary }]}
              onPress={handleCompleteTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.completeButtonText}>Completing...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
                  <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskHeader: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  photoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTime: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 24,
  },
  photoCapture: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  photoCaptureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  photoContainer: {
    gap: 12,
  },
  photoPreview: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  retakeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  noteInput: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

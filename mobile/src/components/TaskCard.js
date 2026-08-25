import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TaskCard({ task, theme, onPress }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  const priorityColors = {
    critical: theme.danger,
    standard: theme.textSecondary,
    low: theme.border,
  };

  const isCompleted = task.status === 'completed';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: theme.card },
        isCompleted && styles.completedCard,
      ]}
      onPress={toggleExpand}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View 
            style={[
              styles.priorityBadge, 
              { backgroundColor: priorityColors[task.priority] || theme.textSecondary }
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority?.toUpperCase()}
            </Text>
          </View>
          {task.requires_photo && (
            <View style={[styles.photoBadge, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name="camera" size={12} color={theme.primary} />
            </View>
          )}
        </View>
        <Text style={[styles.time, { color: theme.textSecondary }]}>
          {task.scheduled_time}
        </Text>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        {isCompleted && (
          <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark" size={14} color="#ffffff" />
          </View>
        )}
        <Text 
          style={[
            styles.title, 
            { color: theme.text },
            isCompleted && styles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme.textSecondary} 
        />
      </View>

      {/* Description */}
      {task.description && (
        <Text 
          style={[styles.description, { color: theme.textSecondary }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {task.description}
        </Text>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {task.instructions && (
            <View style={[styles.instructionsBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.instructionsLabel, { color: theme.textSecondary }]}>
                Instructions:
              </Text>
              <Text style={[styles.instructionsText, { color: theme.text }]}>
                {task.instructions}
              </Text>
            </View>
          )}

          {task.time_window && (
            <View style={styles.timeWindow}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.timeWindowText, { color: theme.textSecondary }]}>
                Time window: {task.time_window}
              </Text>
            </View>
          )}

          {!isCompleted && (
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress && onPress();
              }}
            >
              <Text style={styles.startButtonText}>Start Task</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  completedCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  photoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  expandedContent: {
    marginTop: 16,
    gap: 12,
  },
  instructionsBox: {
    borderRadius: 12,
    padding: 14,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  timeWindow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeWindowText: {
    fontSize: 13,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

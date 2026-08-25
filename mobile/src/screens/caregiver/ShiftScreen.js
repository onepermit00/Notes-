import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { mockPatient } from '../../data/mockData';

export default function ShiftScreen({ navigation }) {
  const { theme } = useTheme();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleToggleShift = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (isShiftActive) {
      // End shift
      setIsShiftActive(false);
      setShiftStartTime(null);
      setTasksCompleted(0);
    } else {
      // Start shift
      setIsShiftActive(true);
      setShiftStartTime(new Date());
    }
  };

  const getElapsedTime = () => {
    if (!shiftStartTime) return '0h 0m';
    const now = new Date();
    const diff = now - shiftStartTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const quickActions = [
    { id: 'earnings', label: 'View Earnings', icon: 'cash', color: theme.primary },
    { id: 'history', label: 'Shift History', icon: 'time', color: '#3b82f6' },
    { id: 'schedule', label: 'My Schedule', icon: 'calendar', color: '#8b5cf6' },
  ];

  const recentShifts = [
    { date: 'Today', hours: '4.5h', status: 'In Progress', earnings: '$67.50' },
    { date: 'Yesterday', hours: '8h', status: 'Completed', earnings: '$120.00' },
    { date: 'Jan 15', hours: '6h', status: 'Completed', earnings: '$90.00' },
    { date: 'Jan 14', hours: '8h', status: 'Completed', earnings: '$120.00' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Shifts</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your work schedule
          </Text>
        </View>

        {/* Current Shift Card */}
        <View style={[styles.shiftCard, { backgroundColor: theme.card }]}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftStatus}>
              <View 
                style={[
                  styles.statusDot,
                  { backgroundColor: isShiftActive ? theme.primary : theme.textSecondary }
                ]} 
              />
              <Text style={[styles.statusText, { color: theme.text }]}>
                {isShiftActive ? 'Shift Active' : 'No Active Shift'}
              </Text>
            </View>
            {isShiftActive && (
              <View style={[styles.liveBadge, { backgroundColor: `${theme.primary}20` }]}>
                <View style={[styles.liveIndicator, { backgroundColor: theme.primary }]} />
                <Text style={[styles.liveText, { color: theme.primary }]}>LIVE</Text>
              </View>
            )}
          </View>

          {isShiftActive && (
            <View style={styles.shiftDetails}>
              <View style={styles.shiftDetailItem}>
                <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Started at</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatTime(shiftStartTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.shiftDetailItem}>
                <Ionicons name="hourglass-outline" size={20} color={theme.textSecondary} />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Elapsed</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {getElapsedTime()}
                  </Text>
                </View>
              </View>

              <View style={styles.shiftDetailItem}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Patient</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {mockPatient.name}
                  </Text>
                </View>
              </View>

              <View style={styles.shiftDetailItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.textSecondary} />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tasks Done</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{tasksCompleted}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Toggle Button */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: isShiftActive ? theme.danger : theme.primary }
            ]}
            onPress={handleToggleShift}
          >
            <Ionicons 
              name={isShiftActive ? 'stop' : 'play'} 
              size={22} 
              color="#ffffff" 
            />
            <Text style={styles.toggleButtonText}>
              {isShiftActive ? 'End Shift' : 'Start Shift'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionCard, { backgroundColor: theme.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Shifts */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Shifts</Text>
        <View style={[styles.recentShiftsCard, { backgroundColor: theme.card }]}>
          {recentShifts.map((shift, index) => (
            <View
              key={index}
              style={[
                styles.shiftRow,
                index < recentShifts.length - 1 && { 
                  borderBottomWidth: 1, 
                  borderBottomColor: theme.border 
                }
              ]}
            >
              <View>
                <Text style={[styles.shiftDate, { color: theme.text }]}>{shift.date}</Text>
                <Text style={[styles.shiftHours, { color: theme.textSecondary }]}>
                  {shift.hours} • {shift.status}
                </Text>
              </View>
              <Text style={[styles.shiftEarnings, { color: theme.primary }]}>
                {shift.earnings}
              </Text>
            </View>
          ))}
        </View>

        {/* Earnings Summary */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet" size={24} color={theme.primary} />
            <Text style={[styles.earningsTitle, { color: theme.text }]}>This Week</Text>
          </View>
          <Text style={[styles.earningsAmount, { color: theme.primary }]}>$397.50</Text>
          <Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>
            26.5 hours worked
          </Text>
        </View>
      </ScrollView>
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
  shiftCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  shiftStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 17, fontWeight: '600' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  liveIndicator: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  shiftDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  shiftDetailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  toggleButtonText: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
  quickActionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  recentShiftsCard: { borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  shiftDate: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  shiftHours: { fontSize: 13 },
  shiftEarnings: { fontSize: 16, fontWeight: '600' },
  earningsCard: { borderRadius: 16, padding: 20, alignItems: 'center' },
  earningsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  earningsTitle: { fontSize: 16, fontWeight: '600' },
  earningsAmount: { fontSize: 36, fontWeight: '700' },
  earningsSubtext: { fontSize: 14, marginTop: 4 },
});

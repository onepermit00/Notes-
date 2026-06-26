import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { mockPatient, mockTasks, mockVitals, mockRequests } from '../../data/mockData';
import TaskCard from '../../components/TaskCard';
import VitalsCard from '../../components/VitalsCard';
import PatientHeader from '../../components/PatientHeader';
import AICopilotButton from '../../components/AICopilotButton';

const { width } = Dimensions.get('window');

export default function CaregiverHomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'requests'
  const [tasks, setTasks] = useState(mockTasks);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleTaskPress = (task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TaskDetail', { task });
  };

  const handleVitalPress = (vitalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VitalsModal', { vitalType });
  };

  const handlePatientPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PatientProfile');
  };

  const latestVitals = {
    bp: mockVitals.bloodPressure[0],
    hr: mockVitals.heartRate[0],
    temp: mockVitals.temperature[0],
    pain: mockVitals.pain[0],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Patient Header */}
        <PatientHeader 
          patient={mockPatient} 
          onPress={handlePatientPress}
          theme={theme}
        />

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          <VitalsCard
            icon="heart"
            label="Blood Pressure"
            value={`${latestVitals.bp?.systolic}/${latestVitals.bp?.diastolic}`}
            unit="mmHg"
            theme={theme}
            onPress={() => handleVitalPress('bp')}
          />
          <VitalsCard
            icon="pulse"
            label="Heart Rate"
            value={`${latestVitals.hr?.value}`}
            unit="bpm"
            theme={theme}
            onPress={() => handleVitalPress('hr')}
          />
          <VitalsCard
            icon="thermometer"
            label="Temperature"
            value={`${latestVitals.temp?.value}`}
            unit="°F"
            theme={theme}
            onPress={() => handleVitalPress('temp')}
          />
          <VitalsCard
            icon="fitness"
            label="Pain Level"
            value={`${latestVitals.pain?.value}`}
            unit="/10"
            theme={theme}
            onPress={() => handleVitalPress('pain')}
          />
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: theme.textSecondary }]}>
              {completedTasks}/{totalTasks} tasks
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercent}%`, backgroundColor: theme.primary }
              ]} 
            />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'requests' && { backgroundColor: theme.primary },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab('requests');
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'requests' ? '#ffffff' : theme.textSecondary },
              ]}
            >
              Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'tasks' && { backgroundColor: theme.primary },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab('tasks');
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'tasks' ? '#ffffff' : theme.textSecondary },
              ]}
            >
              Today's Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task/Request List */}
        <View style={styles.listContainer}>
          {activeTab === 'tasks' ? (
            tasks.map((task) => (
              <TaskCard
                key={task.task_id}
                task={task}
                theme={theme}
                onPress={() => handleTaskPress(task)}
              />
            ))
          ) : (
            mockRequests.map((request) => (
              <View
                key={request.id}
                style={[styles.requestCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.requestHeader}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          request.priority === 'critical'
                            ? theme.danger
                            : request.priority === 'standard'
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {request.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.requestTime, { color: theme.textSecondary }]}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.requestTitle, { color: theme.text }]}>
                  {request.title}
                </Text>
                <Text style={[styles.requestDesc, { color: theme.textSecondary }]}>
                  {request.description}
                </Text>
                <Text style={[styles.requestBy, { color: theme.textSecondary }]}>
                  From: {request.createdBy}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* AI Copilot FAB */}
      <AICopilotButton navigation={navigation} theme={theme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: -6,
  },
  progressContainer: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCount: {
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 16,
    gap: 12,
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  requestTime: {
    fontSize: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  requestDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  requestBy: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

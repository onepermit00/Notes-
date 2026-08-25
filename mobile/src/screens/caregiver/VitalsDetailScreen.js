import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { mockVitals } from '../../data/mockData';

export default function VitalsDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { vitalType } = route.params || { vitalType: 'bp' };

  const vitalConfig = {
    bp: {
      title: 'Blood Pressure',
      icon: 'heart',
      unit: 'mmHg',
      data: mockVitals.bloodPressure,
      color: '#ef4444',
    },
    hr: {
      title: 'Heart Rate',
      icon: 'pulse',
      unit: 'bpm',
      data: mockVitals.heartRate,
      color: '#f97316',
    },
    temp: {
      title: 'Temperature',
      icon: 'thermometer',
      unit: '°F',
      data: mockVitals.temperature,
      color: '#3b82f6',
    },
    pain: {
      title: 'Pain Level',
      icon: 'fitness',
      unit: '/10',
      data: mockVitals.pain,
      color: '#8b5cf6',
    },
  };

  const config = vitalConfig[vitalType] || vitalConfig.bp;
  const latestValue = config.data[0];

  const formatValue = (reading) => {
    if (vitalType === 'bp') {
      return `${reading.systolic}/${reading.diastolic}`;
    }
    return `${reading.value}`;
  };

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>{config.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Value Card */}
        <View style={[styles.currentCard, { backgroundColor: theme.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon} size={32} color={config.color} />
          </View>
          <Text style={[styles.currentValue, { color: theme.text }]}>
            {formatValue(latestValue)}
            <Text style={[styles.unit, { color: theme.textSecondary }]}> {config.unit}</Text>
          </Text>
          <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
            Last recorded: {latestValue.time}, {latestValue.date}
          </Text>
          <TouchableOpacity style={[styles.recordButton, { backgroundColor: config.color }]}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.recordButtonText}>Record New</Text>
          </TouchableOpacity>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
          <View style={[styles.historyCard, { backgroundColor: theme.card }]}>
            {config.data.map((reading, index) => (
              <View
                key={index}
                style={[
                  styles.historyItem,
                  index < config.data.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyValue, { color: theme.text }]}>
                    {formatValue(reading)} {config.unit}
                  </Text>
                  <Text style={[styles.historyTime, { color: theme.textSecondary }]}>
                    {reading.time} • {reading.date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color={theme.primary} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Normal Range Info */}
        <View style={[styles.infoCard, { backgroundColor: `${theme.primary}10` }]}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Normal Range</Text>
            <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
              {vitalType === 'bp' && 'Systolic: 90-120 mmHg, Diastolic: 60-80 mmHg'}
              {vitalType === 'hr' && '60-100 beats per minute'}
              {vitalType === 'temp' && '97.8°F - 99.1°F (36.5°C - 37.3°C)'}
              {vitalType === 'pain' && '0 = No pain, 10 = Worst possible pain'}
            </Text>
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
  currentCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  unit: {
    fontSize: 20,
    fontWeight: '400',
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  historyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  historyLeft: {},
  historyValue: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 13,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { mockPatient } from '../../data/mockData';

export default function MessageScreen({ navigation }) {
  const { theme } = useTheme();

  const conversations = [
    {
      id: '1',
      name: 'Mary Doe',
      role: 'Family Guardian',
      lastMessage: 'Thank you for the update on dad!',
      time: '10:30 AM',
      unread: 2,
      avatar: 'MD',
    },
    {
      id: '2',
      name: 'Dr. Smith',
      role: 'Primary Physician',
      lastMessage: 'Please monitor the blood pressure closely',
      time: 'Yesterday',
      unread: 0,
      avatar: 'DS',
    },
    {
      id: '3',
      name: 'CareFirst Agency',
      role: 'Agency',
      lastMessage: 'Your schedule for next week is ready',
      time: 'Jan 15',
      unread: 0,
      avatar: 'CF',
    },
  ];

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: theme.card }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.conversationTime, { color: theme.textSecondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.conversationRole, { color: theme.textSecondary }]}>{item.role}</Text>
        <Text
          style={[styles.lastMessage, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      {item.unread > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
        <TouchableOpacity
          style={[styles.newMessageButton, { backgroundColor: theme.primary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="create-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Patient Context */}
      <View style={[styles.patientContext, { backgroundColor: theme.card }]}>
        <Ionicons name="person" size={16} color={theme.textSecondary} />
        <Text style={[styles.patientContextText, { color: theme.textSecondary }]}>
          Messages regarding {mockPatient.name}
        </Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  patientContextText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationRole: {
    fontSize: 12,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 6,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});

// ADLTrack - Exact Replica Mobile App for Expo Snack
// Caregiver Dashboard + Patient Profile + Care History + Requests + Vital Signs

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COLORS
// ============================================
const COLORS = {
  background: '#000000',
  card: '#1c1c1e',
  cardBorder: '#3a3a3c',
  primary: '#25D366',
  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#8e8e93',
  textMuted: '#636366',
  critical: '#ef4444',
  standard: '#3b82f6',
  low: '#22c55e',
  completed: '#f59e0b',
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.25)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.25)',
  vitalTemp: '#3b82f6',
  vitalTempBg: 'rgba(59, 130, 246, 0.25)',
  vitalPain: '#a855f7',
  vitalPainBg: 'rgba(168, 85, 247, 0.25)',
  careHistoryBg: '#166534',
  careHistoryLight: '#22c55e',
  allergyBg: 'rgba(239, 68, 68, 0.15)',
  allergyBorder: 'rgba(239, 68, 68, 0.4)',
  allergyText: '#f87171',
  allergyTagBg: 'rgba(239, 68, 68, 0.3)',
  conditionIcon: '#f472b6',
  medicationIcon: '#3b82f6',
  codeStatusBg: 'rgba(234, 179, 8, 0.15)',
  codeStatusBorder: 'rgba(234, 179, 8, 0.5)',
  codeStatusText: '#eab308',
  mobilityBg: 'rgba(59, 130, 246, 0.15)',
  mobilityBorder: 'rgba(59, 130, 246, 0.5)',
  mobilityText: '#60a5fa',
  accessIcon: '#10b981',
  emergencyIcon: '#f59e0b',
  shareBtn: '#f43f5e',
  callBtnGreen: '#22c55e',
  callBtnBlue: '#3b82f6',
  badgeRed: '#ef4444',
  historyBannerBg: 'rgba(180, 130, 20, 0.2)',
  historyBannerBorder: 'rgba(234, 179, 8, 0.6)',
  historyIconBg: 'rgba(234, 179, 8, 0.3)',
  historyText: '#eab308',
  historyButtonBg: '#f59e0b',
  requestBorder: '#6366f1',
  acceptBtn: '#22c55e',
  declineBtn: '#3a3a3c',
  declineReasonBg: '#2c2c2e',
  declineReasonSelected: 'rgba(239, 68, 68, 0.2)',
  declineReasonSelectedBorder: '#ef4444',
  declineReasonText: '#ef4444',
  confirmBtn: '#f43f5e',
  confirmBtnDisabled: '#4a4a4c',
  fabBg: '#3a3a3c',
  // Vital Signs colors
  vitalCardBg: '#4a1525',
  vitalCardBgDark: '#3d1120',
  chartBg: '#2c2c2e',
  chartLine: '#3a3a3c',
  systolicColor: '#f43f5e',
  diastolicColor: '#f59e0b',
  inputBg: '#3a3a3c',
  // Heart Rate colors
  heartCardBg: '#5c3d1e',
  heartColor: '#ea580c',
  // Temperature colors
  tempCardBg: '#1e3a5f',
  tempColor: '#3b82f6',
  // Pain colors
  painCardBg: '#3d2963',
  painColor: '#a855f7',
};

// ============================================
// MOCK DATA
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  dob: '1946-03-15',
  photo: 'https://customer-assets.emergentagent.com/job_adlcare-expo/artifacts/0kd0031g_IMG_9932.jpeg',
  allergies: ['Penicillin', 'Shellfish'],
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ],
  codeStatus: 'Full Code',
  mobility: 'Uses walker for ambulation',
  accessInstructions: 'Key under flower pot by front door. Alarm code: 1234.',
  emergencyContacts: [
    { name: 'Mary Smith', relation: 'Daughter' },
    { name: 'Tom Smith', relation: 'Son' },
  ],
  physician: { name: 'Dr. Rebecca Johnson', facility: 'Springfield Medical Center' },
};

const INITIAL_TASKS = [
  { id: 1, title: 'Morning Medication', time: '08:00 AM', priority: 'critical', requiresPhoto: true, instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.', timeWindow: '7:30 AM - 9:00 AM' },
  { id: 2, title: 'Breakfast Assistance', time: '08:30 AM', priority: 'standard', requiresPhoto: false, instructions: 'Assist patient with breakfast. Ensure balanced meal with protein and fiber.', timeWindow: '8:00 AM - 9:30 AM' },
  { id: 3, title: 'Morning Walk', time: '10:00 AM', priority: 'low', requiresPhoto: false, instructions: 'Take patient for a 15-minute walk around the house or garden.', timeWindow: '9:30 AM - 11:00 AM' },
  { id: 4, title: 'Blood Pressure Check', time: '10:30 AM', priority: 'critical', requiresPhoto: true, instructions: 'Check blood pressure using the arm cuff. Record systolic and diastolic values.', timeWindow: '10:00 AM - 11:30 AM' },
  { id: 5, title: 'Hydration Check', time: '11:00 AM', priority: 'low', requiresPhoto: false, instructions: 'Ensure patient has consumed at least 2 glasses of water since morning.', timeWindow: '10:30 AM - 12:00 PM' },
  { id: 6, title: 'Lunch Preparation', time: '12:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Prepare a balanced lunch. Include vegetables and lean protein.', timeWindow: '11:30 AM - 1:00 PM' },
  { id: 7, title: 'Afternoon Medication', time: '12:30 PM', priority: 'critical', requiresPhoto: true, instructions: 'Give afternoon dose of Lisinopril with lunch.', timeWindow: '12:00 PM - 1:30 PM' },
  { id: 8, title: 'Rest Period', time: '2:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Ensure patient rests comfortably. Check on them every 30 minutes.', timeWindow: '1:30 PM - 3:00 PM' },
  { id: 9, title: 'Physical Therapy Exercises', time: '3:30 PM', priority: 'standard', requiresPhoto: false, instructions: 'Guide patient through prescribed physical therapy exercises.', timeWindow: '3:00 PM - 4:30 PM' },
  { id: 10, title: 'Evening Medication', time: '5:00 PM', priority: 'critical', requiresPhoto: true, instructions: 'Give evening dose of Aspirin with a snack.', timeWindow: '4:30 PM - 6:00 PM' },
  { id: 11, title: 'Dinner Service', time: '6:00 PM', priority: 'standard', requiresPhoto: true, instructions: 'Serve dinner and assist patient as needed.', timeWindow: '5:30 PM - 7:00 PM' },
  { id: 12, title: 'Bedtime Routine', time: '8:00 PM', priority: 'low', requiresPhoto: false, instructions: 'Help patient prepare for bed. Ensure comfortable sleeping environment.', timeWindow: '7:30 PM - 9:00 PM' },
];

const CANT_COMPLETE_REASONS = [
  'Schedule Conflict',
  'Patient Refused',
  'Not Certified for This Task',
  'Safety Concern',
  'Need More Information',
  'Other',
];

const INITIAL_REQUESTS = [
  { 
    id: 101, 
    title: 'Extra Walk in Garden', 
    time: '4:00 PM', 
    requester: 'Mary Smith',
    relation: 'Daughter',
    description: 'Take a short walk in the backyard garden',
  },
  { 
    id: 102, 
    title: 'Video Call with Grandchildren', 
    time: '5:30 PM', 
    requester: 'Tom Smith',
    relation: 'Son',
    description: 'Help set up tablet for video call',
  },
];

const DECLINE_REASONS = [
  'Schedule Conflict',
  'Patient Refused',
  'Not Certified for This Task',
  'Safety Concern',
  'Need More Information',
  'Other',
];

const INITIAL_BP_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', systolic: 120, diastolic: 76 },
  { id: 2, day: 'Sat', time: '10:35 AM', systolic: 121, diastolic: 78 },
  { id: 3, day: 'Fri', time: '10:20 AM', systolic: 119, diastolic: 75 },
  { id: 4, day: 'Thu', time: '10:30 AM', systolic: 120, diastolic: 77 },
  { id: 5, day: 'Wed', time: '10:45 AM', systolic: 125, diastolic: 80 },
  { id: 6, day: 'Tue', time: '10:30 AM', systolic: 122, diastolic: 79 },
  { id: 7, day: 'Mon', time: '10:15 AM', systolic: 118, diastolic: 76 },
];

const INITIAL_HEART_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 72 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 69 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 71 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 70 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 75 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 73 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 74 },
];

const INITIAL_TEMP_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 98.6 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 98.4 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 98.7 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 98.5 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 98.2 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 98.3 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 98.4 },
];

const INITIAL_PAIN_HISTORY = [
  { id: 1, day: 'Sun', time: '10:30 AM', value: 1 },
  { id: 2, day: 'Sat', time: '10:35 AM', value: 2 },
  { id: 3, day: 'Fri', time: '10:20 AM', value: 2 },
  { id: 4, day: 'Thu', time: '10:30 AM', value: 1 },
  { id: 5, day: 'Wed', time: '10:45 AM', value: 2 },
  { id: 6, day: 'Tue', time: '10:30 AM', value: 3 },
  { id: 7, day: 'Mon', time: '10:15 AM', value: 2 },
];

const HISTORY_TASKS = {
  '2026-01-16': [
    { id: 1, title: 'Morning Medication', completedTime: '8:15 AM', notes: 'Took all medications with breakfast', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
    { id: 2, title: 'Breakfast Assistance', completedTime: '8:45 AM', notes: 'Had oatmeal and fruit', photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200' },
    { id: 3, title: 'Blood Pressure Check', completedTime: '10:30 AM', notes: 'BP: 128/82', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
  ],
  '2026-01-15': [
    { id: 1, title: 'Morning Medication', completedTime: '8:00 AM', notes: 'All meds taken', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
    { id: 2, title: 'Lunch Preparation', completedTime: '12:00 PM', notes: 'Chicken salad', photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200' },
  ],
  '2026-01-14': [
    { id: 1, title: 'Morning Medication', completedTime: '8:10 AM', notes: 'Completed with juice', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
  ],
  '2026-01-13': [
    { id: 1, title: 'Blood Pressure Check', completedTime: '10:00 AM', notes: 'BP: 125/80', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
    { id: 2, title: 'Evening Medication', completedTime: '5:30 PM', notes: 'All evening meds', photo: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
  ],
  '2026-01-10': [
    { id: 1, title: 'Morning Walk', completedTime: '10:00 AM', notes: '15 min walk completed', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' },
  ],
};

const CARE_ACTIVITY_DATES = [10, 13, 14, 15, 16];

// ============================================
// AUTH STYLES
// ============================================
const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 30 },
  
  // Logo
  logoContainer: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, marginBottom: 20 },
  logoIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#22c55e', marginLeft: 10 },
  
  // Header
  headerDivider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 30 },
  
  // Account Type Badge
  typeBadge: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 24 },
  typeBadgeText: { fontSize: 16, fontWeight: '600' },
  
  // Account Cards
  accountCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  accountCardSelected: { borderWidth: 2 },
  accountIconBg: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  accountInfo: { flex: 1 },
  accountTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  accountSubtitle: { fontSize: 15, color: '#6b7280', lineHeight: 20 },
  accountArrow: { marginLeft: 8 },
  
  // Social Buttons
  socialBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  socialBtnText: { fontSize: 17, fontWeight: '600', color: '#1f2937', marginLeft: 12 },
  googleIcon: { width: 24, height: 24 },
  
  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 16, fontSize: 15, color: '#9ca3af' },
  
  // Form
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f3f4f6', 
    borderRadius: 16, 
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, paddingVertical: 18, fontSize: 16, color: '#1f2937' },
  eyeBtn: { padding: 8 },
  
  // Submit Button
  submitBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  submitBtnText: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginRight: 8 },
  
  // Links
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  linkText: { fontSize: 16, color: '#6b7280' },
  linkBtn: { fontSize: 16, fontWeight: '600' },
  
  // Terms
  termsText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 24, lineHeight: 20 },
  termsLink: { textDecorationLine: 'underline' },
  
  // Footer
  footer: { marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  footerText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 16 },
});

// Account type configurations
const ACCOUNT_TYPES = {
  caregiver: {
    title: "I'm a Caregiver",
    subtitle: 'Manage shifts, tasks & documentation',
    badgeTitle: 'Caregiver Account',
    formSubtitle: 'Manage shifts, tasks & care documentation',
    icon: 'heart',
    iconBg: '#d1fae5',
    iconColor: '#10b981',
    borderColor: '#10b981',
    buttonColor: '#10b981',
    badgeBg: '#d1fae5',
    badgeText: '#10b981',
  },
  family: {
    title: "I'm a Family Member",
    subtitle: 'Monitor care & stay connected',
    badgeTitle: 'Family Member Account',
    formSubtitle: 'Monitor care & stay connected with your loved ones',
    icon: 'people',
    iconBg: '#fce7f3',
    iconColor: '#ec4899',
    borderColor: '#ec4899',
    buttonColor: '#ec4899',
    badgeBg: '#fce7f3',
    badgeText: '#ec4899',
  },
  agency: {
    title: "I'm an Agency",
    subtitle: 'Manage staff & compliance',
    badgeTitle: 'Care Agency Account',
    formSubtitle: 'Manage staff, compliance & care operations',
    icon: 'briefcase',
    iconBg: '#e0e7ff',
    iconColor: '#6366f1',
    borderColor: '#6366f1',
    buttonColor: '#6366f1',
    badgeBg: '#e0e7ff',
    badgeText: '#6366f1',
  },
};

// ============================================
// AUTH SCREENS
// ============================================
const AccountTypeScreen = ({ onSelectType, onSignIn }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelect = (type) => {
    setSelectedType(type);
    setTimeout(() => onSelectType(type), 200);
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.scrollContent}>
        {/* Logo */}
        <View style={authStyles.logoContainer}>
          <View style={authStyles.logoIcon}>
            <Ionicons name="pulse" size={24} color="#ffffff" />
          </View>
          <Text style={authStyles.logoText}>Adltrack</Text>
        </View>
        
        <View style={authStyles.headerDivider} />
        
        {/* Header */}
        <Text style={authStyles.title}>Create your account</Text>
        <Text style={authStyles.subtitle}>Select your account type to get started</Text>
        
        {/* Account Type Cards */}
        {Object.entries(ACCOUNT_TYPES).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[
              authStyles.accountCard,
              selectedType === key && { borderColor: config.borderColor },
            ]}
            onPress={() => handleSelect(key)}
          >
            <View style={[authStyles.accountIconBg, { backgroundColor: config.iconBg }]}>
              <Ionicons name={config.icon} size={32} color={config.iconColor} />
            </View>
            <View style={authStyles.accountInfo}>
              <Text style={authStyles.accountTitle}>{config.title}</Text>
              <Text style={authStyles.accountSubtitle}>{config.subtitle}</Text>
            </View>
            <Ionicons 
              name="arrow-forward" 
              size={24} 
              color={selectedType === key ? config.iconColor : '#9ca3af'} 
              style={authStyles.accountArrow}
            />
          </TouchableOpacity>
        ))}
        
        {/* Sign In Link */}
        <View style={authStyles.linkRow}>
          <Text style={authStyles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={[authStyles.linkBtn, { color: '#10b981' }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={authStyles.footer}>
          <Text style={authStyles.footerText}>© 2026 Adltrack. Secure care coordination.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SignUpScreen = ({ accountType, onBack, onSignIn, onCreateAccount }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const config = ACCOUNT_TYPES[accountType];

  const handleCreateAccount = () => {
    if (fullName && email && password) {
      onCreateAccount(accountType);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={authStyles.logoContainer}>
            <View style={authStyles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={authStyles.logoText}>Adltrack</Text>
          </View>
          
          <View style={authStyles.headerDivider} />
          
          {/* Account Type Badge */}
          <View style={[authStyles.typeBadge, { backgroundColor: config.badgeBg }]}>
            <Text style={[authStyles.typeBadgeText, { color: config.badgeText }]}>{config.badgeTitle}</Text>
          </View>
          
          {/* Header */}
          <Text style={authStyles.title}>Create your account</Text>
          <Text style={authStyles.subtitle}>{config.formSubtitle}</Text>
          
          {/* Social Buttons */}
          <TouchableOpacity style={authStyles.socialBtn}>
            <Text style={{ fontSize: 20 }}>G</Text>
            <Text style={authStyles.socialBtnText}>Sign up with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={authStyles.socialBtn}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
            <Text style={authStyles.socialBtnText}>Sign up with Apple</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={authStyles.dividerRow}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>or continue with email</Text>
            <View style={authStyles.dividerLine} />
          </View>
          
          {/* Form */}
          <Text style={authStyles.inputLabel}>Full Name</Text>
          <View style={authStyles.inputContainer}>
            <Ionicons name="person-outline" size={22} color="#9ca3af" style={authStyles.inputIcon} />
            <TextInput
              style={authStyles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          <Text style={authStyles.inputLabel}>Email</Text>
          <View style={authStyles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color="#9ca3af" style={authStyles.inputIcon} />
            <TextInput
              style={authStyles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <Text style={authStyles.inputLabel}>Password</Text>
          <View style={authStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#9ca3af" style={authStyles.inputIcon} />
            <TextInput
              style={authStyles.textInput}
              placeholder="Create a password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={authStyles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[authStyles.submitBtn, { backgroundColor: config.buttonColor }]}
            onPress={handleCreateAccount}
          >
            <Text style={authStyles.submitBtnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          {/* Sign In Link */}
          <View style={authStyles.linkRow}>
            <Text style={authStyles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text style={[authStyles.linkBtn, { color: config.buttonColor }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
          
          {/* Terms */}
          <Text style={authStyles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={authStyles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={authStyles.termsLink}>Privacy Policy</Text>
          </Text>
          
          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>© 2026 Adltrack. Secure care coordination.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SignInScreen = ({ onBack, onSignUp, onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={authStyles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={authStyles.logoContainer}>
            <View style={authStyles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={authStyles.logoText}>Adltrack</Text>
          </View>
          
          <View style={authStyles.headerDivider} />
          
          {/* Header */}
          <Text style={authStyles.title}>Welcome back</Text>
          <Text style={authStyles.subtitle}>Sign in to continue to your account</Text>
          
          {/* Social Buttons */}
          <TouchableOpacity style={authStyles.socialBtn}>
            <Text style={{ fontSize: 20 }}>G</Text>
            <Text style={authStyles.socialBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={authStyles.socialBtn}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
            <Text style={authStyles.socialBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={authStyles.dividerRow}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>or continue with email</Text>
            <View style={authStyles.dividerLine} />
          </View>
          
          {/* Form */}
          <Text style={authStyles.inputLabel}>Email</Text>
          <View style={authStyles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color="#9ca3af" style={authStyles.inputIcon} />
            <TextInput
              style={authStyles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <Text style={authStyles.inputLabel}>Password</Text>
          <View style={authStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#9ca3af" style={authStyles.inputIcon} />
            <TextInput
              style={authStyles.textInput}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={authStyles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {/* Forgot Password */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={{ color: '#10b981', fontSize: 15, fontWeight: '600' }}>Forgot password?</Text>
          </TouchableOpacity>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[authStyles.submitBtn, { backgroundColor: '#10b981' }]}
            onPress={() => onSignIn('caregiver')}
          >
            <Text style={authStyles.submitBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          {/* Sign Up Link */}
          <View style={authStyles.linkRow}>
            <Text style={authStyles.linkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={[authStyles.linkBtn, { color: '#10b981' }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={authStyles.footer}>
            <Text style={authStyles.footerText}>© 2026 Adltrack. Secure care coordination.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ============================================
// AUTH CONTEXT
// ============================================
const AuthContext = React.createContext(null);
const SignOutContext = React.createContext(null);

// ============================================
// SHARED DATA CONTEXT (Connects Caregiver & Family Dashboards)
// ============================================
const SharedDataContext = React.createContext(null);

const SharedDataProvider = ({ children }) => {
  // Shared Tasks (completed by caregivers, viewed by family)
  const [sharedTasks, setSharedTasks] = useState([]);
  
  // Shared Requests (created by family, managed by caregivers)
  const [sharedRequests, setSharedRequests] = useState([]);
  
  // Shared Incidents (created by caregivers, viewed by family)
  const [sharedIncidents, setSharedIncidents] = useState([]);
  
  // Medication Logs (separate from tasks for compliance tracking)
  const [medicationLogs, setMedicationLogs] = useState([]);
  
  // Shift/Clock Data
  const [shiftData, setShiftData] = useState({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    location: null,
    totalHoursToday: 0,
    weeklyHours: 32.5,
  });
  
  // Caregiver Performance Metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    taskCompletionRate: 94,
    onTimeRate: 98,
    medicationAccuracy: 100,
    incidentFrequency: 0.5,
    familyRating: 4.8,
    monthlyScore: 96,
    punctualityScore: 97,
  });
  
  // Care Plan
  const [carePlan, setCarePlan] = useState({
    id: 1,
    clientName: 'David Smith',
    startDate: 'Jan 15, 2026',
    reviewDate: 'Apr 15, 2026',
    primaryGoals: [
      'Maintain independence in daily activities',
      'Manage chronic conditions effectively',
      'Prevent falls and injuries',
      'Ensure medication compliance',
    ],
    adlSchedule: [
      { time: '7:00 AM', task: 'Morning Medication', type: 'medication', required: true },
      { time: '7:30 AM', task: 'Breakfast Assistance', type: 'adl', required: true },
      { time: '8:30 AM', task: 'Personal Hygiene', type: 'adl', required: true },
      { time: '10:00 AM', task: 'Physical Therapy Exercises', type: 'exercise', required: true },
      { time: '12:00 PM', task: 'Lunch & Midday Medication', type: 'medication', required: true },
      { time: '2:00 PM', task: 'Vital Signs Check', type: 'vitals', required: true },
      { time: '3:00 PM', task: 'Afternoon Activity', type: 'adl', required: false },
      { time: '5:00 PM', task: 'Dinner Preparation', type: 'adl', required: true },
      { time: '6:00 PM', task: 'Evening Medication', type: 'medication', required: true },
      { time: '8:00 PM', task: 'Bedtime Routine', type: 'adl', required: true },
    ],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '7:00 AM', purpose: 'Blood Pressure' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '7:00 AM, 6:00 PM', purpose: 'Diabetes' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', time: '7:00 AM', purpose: 'Heart Health' },
      { name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily', time: '12:00 PM', purpose: 'Bone Health' },
    ],
    restrictions: [
      'Low sodium diet',
      'No grapefruit (medication interaction)',
      'Limited sugar intake',
    ],
    emergencyProtocol: 'Call 911 for chest pain, difficulty breathing, or falls with injury. Notify family immediately.',
  });
  
  // Multiple Clients (for caregiver)
  const [clients, setClients] = useState([
    { 
      id: 1, 
      name: 'David Smith', 
      age: 78, 
      condition: 'Diabetes, Hypertension',
      address: '123 Oak Street',
      active: true,
      riskLevel: 'moderate',
      tasksToday: 8,
      tasksCompleted: 3,
    },
    { 
      id: 2, 
      name: 'Margaret Johnson', 
      age: 82, 
      condition: 'Alzheimer\'s, Mobility Issues',
      address: '456 Maple Avenue',
      active: false,
      riskLevel: 'high',
      tasksToday: 10,
      tasksCompleted: 0,
    },
    { 
      id: 3, 
      name: 'Robert Williams', 
      age: 71, 
      condition: 'Post-stroke Recovery',
      address: '789 Pine Road',
      active: false,
      riskLevel: 'low',
      tasksToday: 6,
      tasksCompleted: 0,
    },
  ]);
  
  const [activeClientId, setActiveClientId] = useState(1);
  
  // Daily Summary Data
  const [dailySummary, setDailySummary] = useState({
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    tasksCompleted: 0,
    totalTasks: 12,
    medicationsGiven: 0,
    totalMedications: 4,
    vitalsRecorded: 0,
    incidentsReported: 0,
    caregiverArrival: null,
    caregiverDeparture: null,
    highlights: [],
    concerns: [],
  });
  
  // Weekly Report Data
  const [weeklyReport, setWeeklyReport] = useState({
    weekOf: 'Dec 9 - Dec 15, 2025',
    overallCompliance: 94,
    taskCompletion: { completed: 78, total: 84 },
    medicationAdherence: { onTime: 26, total: 28 },
    vitalsRecorded: 14,
    incidents: 1,
    missedTasks: ['Physical Therapy - Dec 11', 'Afternoon Activity - Dec 13'],
    performanceTrend: 'improving',
    caregiverNotes: 'Patient showing good progress with mobility exercises.',
  });
  
  // Emergency Alerts
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  
  // Add a completed task
  const addCompletedTask = (task) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    const newTask = {
      id: Date.now(),
      title: task.title,
      description: task.description || '',
      note: task.note || '',
      completedAt: timeStr,
      completedTimestamp: now.toISOString(),
      image: task.image || null,
      photos: task.photos || [],
      video: task.video || null,
      audio: task.audio || null,
      gpsLocation: task.gpsLocation || null,
      gpsVerified: task.gpsVerified || false,
      caregiver: {
        name: 'Julia Martinez',
        role: 'Certified Nursing Assistant',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        verified: true,
      },
    };
    
    setSharedTasks(prev => [newTask, ...prev]);
    
    // Update daily summary
    setDailySummary(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1,
      highlights: [...prev.highlights, `${task.title} completed at ${timeStr}`],
    }));
    
    return newTask;
  };
  
  // Add medication log
  const addMedicationLog = (medication) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    const newLog = {
      id: Date.now(),
      medicationName: medication.name,
      dosage: medication.dosage,
      scheduledTime: medication.scheduledTime,
      actualTime: timeStr,
      status: medication.status || 'administered',
      notes: medication.notes || '',
      photo: medication.photo || null,
      gpsVerified: medication.gpsVerified || false,
      caregiver: 'Julia Martinez',
    };
    
    setMedicationLogs(prev => [newLog, ...prev]);
    
    // Update daily summary
    setDailySummary(prev => ({
      ...prev,
      medicationsGiven: prev.medicationsGiven + 1,
    }));
    
    return newLog;
  };
  
  // Clock In/Out
  const clockIn = (location) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    setShiftData(prev => ({
      ...prev,
      isClockedIn: true,
      clockInTime: timeStr,
      clockInTimestamp: now.toISOString(),
      location: location,
    }));
    
    setDailySummary(prev => ({
      ...prev,
      caregiverArrival: timeStr,
    }));
  };
  
  const clockOut = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    setShiftData(prev => ({
      ...prev,
      isClockedIn: false,
      clockOutTime: timeStr,
      clockOutTimestamp: now.toISOString(),
    }));
    
    setDailySummary(prev => ({
      ...prev,
      caregiverDeparture: timeStr,
    }));
  };
  
  // Add a family request
  const addFamilyRequest = (request) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    const newRequest = {
      id: Date.now(),
      title: request.title,
      details: request.details || '',
      priority: request.priority || 'standard',
      status: 'pending',
      time: timeStr,
      declineReason: null,
      acceptedNote: null,
      familyMember: {
        name: 'Robert Smith',
        relation: 'Son',
      },
    };
    
    setSharedRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };
  
  // Update request status
  const updateRequestStatus = (requestId, status, reason = null) => {
    setSharedRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status, 
            declineReason: status === 'declined' ? reason : null,
            acceptedNote: status === 'accepted' ? reason : null,
          }
        : req
    ));
  };
  
  // Add an incident report
  const addIncidentReport = (incident) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const dateTimeStr = `${month} ${day}, ${year} at ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    const newIncident = {
      id: Date.now(),
      title: incident.title || incident.type,
      type: incident.type || 'other',
      severity: incident.severity || 'high',
      status: 'open',
      description: incident.description || '',
      actionsTaken: incident.actionsTaken || '',
      dateTime: dateTimeStr,
      photos: incident.photos || [],
      video: incident.video || null,
      reporter: {
        name: 'Julia Martinez',
        role: 'Certified Nursing Assistant',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        verified: true,
      },
    };
    
    setSharedIncidents(prev => [newIncident, ...prev]);
    
    // Update daily summary
    setDailySummary(prev => ({
      ...prev,
      incidentsReported: prev.incidentsReported + 1,
      concerns: [...prev.concerns, `${incident.type} incident reported`],
    }));
    
    // Create emergency alert if critical
    if (incident.severity === 'critical') {
      addEmergencyAlert({
        type: 'incident',
        title: `Critical Incident: ${incident.title}`,
        message: incident.description,
      });
    }
    
    return newIncident;
  };
  
  // Add emergency alert
  const addEmergencyAlert = (alert) => {
    const newAlert = {
      id: Date.now(),
      ...alert,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    setEmergencyAlerts(prev => [newAlert, ...prev]);
  };
  
  // Acknowledge emergency alert
  const acknowledgeAlert = (alertId) => {
    setEmergencyAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };
  
  // Get counts
  const getPendingRequestsCount = () => sharedRequests.filter(r => r.status === 'pending').length;
  const getOpenIncidentsCount = () => sharedIncidents.filter(i => i.status === 'open').length;
  const getUnacknowledgedAlertsCount = () => emergencyAlerts.filter(a => !a.acknowledged).length;
  
  // Get missed tasks (tasks that should have been done by now)
  const getMissedTasks = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return carePlan.adlSchedule.filter(task => {
      const taskHour = parseInt(task.time.split(':')[0]);
      const isPM = task.time.includes('PM');
      const taskHour24 = isPM && taskHour !== 12 ? taskHour + 12 : taskHour;
      return taskHour24 < currentHour && task.required;
    });
  };
  
  return (
    <SharedDataContext.Provider value={{
      // Data
      sharedTasks,
      sharedRequests,
      sharedIncidents,
      medicationLogs,
      shiftData,
      performanceMetrics,
      carePlan,
      clients,
      activeClientId,
      dailySummary,
      weeklyReport,
      emergencyAlerts,
      // Actions
      addCompletedTask,
      addMedicationLog,
      clockIn,
      clockOut,
      addFamilyRequest,
      updateRequestStatus,
      addIncidentReport,
      addEmergencyAlert,
      acknowledgeAlert,
      setActiveClientId,
      // Getters
      getPendingRequestsCount,
      getOpenIncidentsCount,
      getUnacknowledgedAlertsCount,
      getMissedTasks,
    }}>
      {children}
    </SharedDataContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('selectType'); // 'selectType', 'signUp', 'signIn'
  const [selectedAccountType, setSelectedAccountType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedAccountType(type);
    setAuthScreen('signUp');
  };

  const handleSignUp = () => {
    setAuthScreen('selectType');
  };

  const handleSignIn = () => {
    setAuthScreen('signIn');
  };

  const handleCreateAccount = (accountType) => {
    setUser({ role: accountType, name: 'User' });
  };

  const handleLogin = (accountType) => {
    setUser({ role: accountType || 'caregiver', name: 'Sarah Johnson' });
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthScreen('selectType');
    setSelectedAccountType(null);
  };

  if (!user) {
    if (authScreen === 'selectType') {
      return (
        <AccountTypeScreen 
          onSelectType={handleSelectType}
          onSignIn={handleSignIn}
        />
      );
    } else if (authScreen === 'signUp') {
      return (
        <SignUpScreen 
          accountType={selectedAccountType}
          onBack={handleSignUp}
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
        />
      );
    } else if (authScreen === 'signIn') {
      return (
        <SignInScreen 
          onBack={handleSignUp}
          onSignUp={handleSignUp}
          onSignIn={handleLogin}
        />
      );
    }
  }

  return (
    <AuthContext.Provider value={{ user, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const Tab = createBottomTabNavigator();

// ============================================
// BLOOD PRESSURE CHART COMPONENT
// ============================================
const BPChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [160, 135, 110, 85, 60];
  const minY = 60;
  const maxY = 160;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  // Get data for each day
  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label, index) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label, index) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Systolic line (pink) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.systolic) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.systolic) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`systolic-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.systolicColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Diastolic line (orange) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.diastolic) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.diastolic) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`diastolic-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.diastolicColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Systolic point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.systolicColor,
                    borderColor: COLORS.systolicColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.systolic) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              {/* Diastolic point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.diastolicColor,
                    borderColor: COLORS.diastolicColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.diastolic) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.systolic) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={styles.tooltipDiastolic}>diastolic : {reading.diastolic}</Text>
                    <Text style={styles.tooltipSystolic}>systolic : {reading.systolic}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// VITAL SIGNS MODAL (Blood Pressure)
// ============================================
const VitalSignsModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [bpHistory, setBpHistory] = useState(INITIAL_BP_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Fri');

  const handleSave = () => {
    if (systolicInput && diastolicInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        systolic: parseInt(systolicInput),
        diastolic: parseInt(diastolicInput),
      };
      
      setBpHistory([newReading, ...bpHistory]);
      onUpdateVitals({
        ...vitals,
        bp: { systolic: parseInt(systolicInput), diastolic: parseInt(diastolicInput) }
      });
      
      setSystolicInput('');
      setDiastolicInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setSystolicInput('');
    setDiastolicInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={styles.currentReadingCard}>
            <View style={styles.currentReadingIconBg}>
              <Ionicons name="heart-outline" size={32} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.bp.systolic}/{vitals.bp.diastolic}
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <BPChart 
              data={bpHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <View style={styles.logFormInputs}>
                <TextInput
                  style={styles.logFormInput}
                  placeholder="Systolic"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={systolicInput}
                  onChangeText={setSystolicInput}
                />
                <TextInput
                  style={styles.logFormInput}
                  placeholder="Diastolic"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={diastolicInput}
                  onChangeText={setDiastolicInput}
                />
              </View>
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {bpHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.systolic}/{reading.diastolic}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// HEART RATE CHART COMPONENT
// ============================================
const HeartRateChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [80, 60, 40, 20, 0];
  const minY = 0;
  const maxY = 80;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Heart rate line (orange) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`heart-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.heartColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Heart rate point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.heartColor,
                    borderColor: COLORS.heartColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.heartColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// HEART RATE MODAL
// ============================================
const HeartRateModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [heartInput, setHeartInput] = useState('');
  const [heartHistory, setHeartHistory] = useState(INITIAL_HEART_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Thu');

  const handleSave = () => {
    if (heartInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseInt(heartInput),
      };
      
      setHeartHistory([newReading, ...heartHistory]);
      onUpdateVitals({
        ...vitals,
        heart: parseInt(heartInput)
      });
      
      setHeartInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setHeartInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.heartCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(234, 88, 12, 0.4)' }]}>
              <Ionicons name="pulse" size={32} color={COLORS.heartColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.heart} bpm
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <HeartRateChart 
              data={heartHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Heart Rate (BPM)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={heartInput}
                onChangeText={setHeartInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {heartHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// TEMPERATURE CHART COMPONENT
// ============================================
const TemperatureChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [100, 75, 50, 25, 0];
  const minY = 0;
  const maxY = 100;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={styles.chartGrid}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Temperature line (blue) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`temp-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.tempColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Temperature point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.tempColor,
                    borderColor: COLORS.tempColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.tempColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// TEMPERATURE MODAL
// ============================================
const TemperatureModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [tempInput, setTempInput] = useState('');
  const [tempHistory, setTempHistory] = useState(INITIAL_TEMP_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Sat');

  const handleSave = () => {
    if (tempInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseFloat(tempInput),
      };
      
      setTempHistory([newReading, ...tempHistory]);
      onUpdateVitals({
        ...vitals,
        temp: parseFloat(tempInput)
      });
      
      setTempInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setTempInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.tempCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.4)' }]}>
              <Ionicons name="thermometer" size={32} color={COLORS.tempColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.temp}°F
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <TemperatureChart 
              data={tempHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Temperature (°F)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={tempInput}
                onChangeText={setTempInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {tempHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}°F</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// PAIN CHART COMPONENT
// ============================================
const PainChart = ({ data, selectedDay, onSelectDay }) => {
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const yLabels = [3, 2.25, 1.5, 0.75, 0];
  const minY = 0;
  const maxY = 3;
  
  const getY = (value) => {
    const ratio = (value - minY) / (maxY - minY);
    return paddingTop + graphHeight - (ratio * graphHeight);
  };
  
  const getX = (index) => {
    return paddingLeft + (index * (graphWidth / 6));
  };

  const getDataForDay = (day) => {
    const reading = data.find(d => d.day === day);
    return reading || null;
  };

  return (
    <View style={styles.chartContainer}>
      {/* Y-axis labels */}
      {yLabels.map((label) => (
        <Text key={label} style={[styles.yAxisLabel, { top: getY(label) - 8 }]}>
          {label}
        </Text>
      ))}
      
      {/* Grid lines */}
      <View style={[styles.chartGrid, { left: paddingLeft }]}>
        {yLabels.map((label) => (
          <View 
            key={label} 
            style={[styles.gridLine, { top: getY(label) - paddingTop }]} 
          />
        ))}
        {days.map((day, index) => (
          <View 
            key={day} 
            style={[styles.verticalGridLine, { left: getX(index) - paddingLeft }]} 
          />
        ))}
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { marginLeft: paddingLeft }]}>
        {/* Pain line (purple) */}
        <View style={styles.lineContainer}>
          {days.map((day, index) => {
            const reading = getDataForDay(day);
            if (!reading) return null;
            const nextDay = days[index + 1];
            const nextReading = getDataForDay(nextDay);
            
            if (nextReading) {
              const x1 = getX(index) - paddingLeft;
              const y1 = getY(reading.value) - paddingTop;
              const x2 = getX(index + 1) - paddingLeft;
              const y2 = getY(nextReading.value) - paddingTop;
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`pain-line-${index}`}
                  style={[
                    styles.chartLine,
                    {
                      width: length,
                      left: x1,
                      top: y1,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS.painColor,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
        </View>

        {/* Data points */}
        {days.map((day, index) => {
          const reading = getDataForDay(day);
          if (!reading) return null;
          
          const isSelected = selectedDay === day;
          
          return (
            <TouchableOpacity
              key={`point-${day}`}
              style={[styles.dataPointTouchable, { left: getX(index) - paddingLeft - 15, top: 0, height: graphHeight }]}
              onPress={() => onSelectDay(day)}
            >
              {/* Pain point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    backgroundColor: isSelected ? COLORS.background : COLORS.painColor,
                    borderColor: COLORS.painColor,
                    borderWidth: isSelected ? 2 : 0,
                    top: getY(reading.value) - paddingTop - 5,
                    left: 10,
                  },
                ]}
              />
              
              {/* Tooltip */}
              {isSelected && (
                <View style={[styles.tooltip, { top: getY(reading.value) - paddingTop - 70 }]}>
                  <View style={styles.tooltipVerticalLine} />
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipDay}>{day}</Text>
                    <Text style={[styles.tooltipSystolic, { color: COLORS.painColor }]}>value : {reading.value}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {days.map((day, index) => (
          <Text key={day} style={[styles.xAxisLabel, { left: getX(index) - 12 }]}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ============================================
// PAIN MODAL
// ============================================
const PainModal = ({ visible, onClose, vitals, onUpdateVitals }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [painInput, setPainInput] = useState('');
  const [painHistory, setPainHistory] = useState(INITIAL_PAIN_HISTORY);
  const [selectedDay, setSelectedDay] = useState('Sat');

  const handleSave = () => {
    if (painInput) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days[now.getDay()];
      
      const newReading = {
        id: Date.now(),
        day: dayStr,
        time: timeStr,
        value: parseInt(painInput),
      };
      
      setPainHistory([newReading, ...painHistory]);
      onUpdateVitals({
        ...vitals,
        pain: parseInt(painInput)
      });
      
      setPainInput('');
      setShowLogForm(false);
    }
  };

  const handleCancel = () => {
    setPainInput('');
    setShowLogForm(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.vitalModalContainer}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.vitalModalHeader}>
          <Text style={styles.vitalModalTitle}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose} style={styles.vitalModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Reading Card */}
          <View style={[styles.currentReadingCard, { backgroundColor: COLORS.painCardBg }]}>
            <View style={[styles.currentReadingIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.4)' }]}>
              <Ionicons name="sad-outline" size={32} color={COLORS.painColor} />
            </View>
            <Text style={styles.currentReadingValue}>
              {vitals.pain}/10
            </Text>
            <Text style={styles.currentReadingLabel}>Current Reading</Text>
          </View>

          {/* Weekly Trend Chart */}
          <View style={styles.chartWrapper}>
            <PainChart 
              data={painHistory} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </View>
          <Text style={styles.weeklyTrendLabel}>Weekly trend</Text>

          {/* Log New Reading Button/Form */}
          {!showLogForm ? (
            <TouchableOpacity 
              style={styles.logNewReadingBtn}
              onPress={() => setShowLogForm(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={styles.logNewReadingText}>Log New Reading</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logFormContainer}>
              <Text style={styles.logFormTitle}>Log New Reading</Text>
              <TextInput
                style={[styles.logFormInput, { marginBottom: 16 }]}
                placeholder="Pain Level (0-10)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={painInput}
                onChangeText={setPainInput}
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity style={styles.logFormCancelBtn} onPress={handleCancel}>
                  <Text style={styles.logFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logFormSaveBtn} onPress={handleSave}>
                  <Text style={styles.logFormSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recent History */}
          <Text style={styles.recentHistoryTitle}>RECENT HISTORY</Text>
          <View style={styles.recentHistoryList}>
            {painHistory.slice(0, 5).map((reading) => (
              <View key={reading.id} style={styles.historyItem}>
                <Text style={styles.historyItemTime}>{reading.day} at {reading.time}</Text>
                <Text style={styles.historyItemValue}>{reading.value}/10</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// TASK DETAIL MODAL
// ============================================
const TaskDetailModal = ({ visible, onClose, task, onComplete, onCantComplete }) => {
  const [mode, setMode] = useState('complete'); // 'complete' or 'cantComplete'
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [notesFocused, setNotesFocused] = useState(false);

  const handleTakePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera access to take photos for task documentation.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Launch camera (no library access - camera only)
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleComplete = () => {
    if (task) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const completedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      
      onComplete(task.id, {
        completedTime,
        notes: notes || 'Task completed successfully',
        photo: photo,
      });
      
      // Reset state
      setNotes('');
      setPhoto(null);
      setMode('complete');
      onClose();
    }
  };

  const handleCantComplete = () => {
    if (task && selectedReason) {
      onCantComplete(task.id, {
        reason: selectedReason,
        notes,
        photo,
      });
      
      // Reset state
      setNotes('');
      setPhoto(null);
      setSelectedReason(null);
      setMode('complete');
      onClose();
    }
  };

  const handleClose = () => {
    setNotes('');
    setPhoto(null);
    setSelectedReason(null);
    setMode('complete');
    onClose();
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView 
        style={styles.taskModalContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.taskModalHeader}>
          <Text style={styles.taskModalTitle}>{task.title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.taskModalClose}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Mode Toggle */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                mode === 'complete' && styles.modeToggleBtnActive,
              ]}
              onPress={() => setMode('complete')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={mode === 'complete' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.modeToggleText,
                mode === 'complete' && styles.modeToggleTextActive,
              ]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                mode === 'cantComplete' && styles.modeToggleBtnCantComplete,
              ]}
              onPress={() => setMode('cantComplete')}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={mode === 'cantComplete' ? COLORS.white : COLORS.textSecondary} 
              />
              <Text style={[
                styles.modeToggleText,
                mode === 'cantComplete' && styles.modeToggleTextActive,
              ]}>Can't Complete</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions Card */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsLabel}>INSTRUCTIONS</Text>
            <Text style={styles.instructionsText}>{task.instructions}</Text>
          </View>

          {/* Photo Evidence Section */}
          <View style={styles.photoEvidenceSection}>
            <Text style={styles.photoEvidenceLabel}>
              PHOTO EVIDENCE {task.requiresPhoto ? '(REQUIRED)' : '(OPTIONAL)'}
            </Text>
            {!photo ? (
              <TouchableOpacity style={styles.photoUploadBox} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={40} color={COLORS.textMuted} />
                <Text style={styles.photoUploadText}>Tap to add photo</Text>
                <Text style={styles.photoUploadSubtext}>Take a photo for documentation</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.photoRemoveBtn} onPress={handleRemovePhoto}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <TextInput
              style={[
                styles.notesInput,
                notesFocused && mode === 'complete' && styles.notesInputComplete,
                notesFocused && mode === 'cantComplete' && styles.notesInputCantComplete,
              ]}
              placeholder="Add any relevant notes here..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
              textAlignVertical="top"
            />
          </View>

          {/* Can't Complete Reason Section */}
          {mode === 'cantComplete' && (
            <View style={styles.cantCompleteSection}>
              <View style={styles.cantCompleteHeader}>
                <Ionicons name="warning" size={20} color={COLORS.confirmBtn} />
                <Text style={styles.cantCompleteLabel}>REASON FOR NOT COMPLETING</Text>
              </View>
              {CANT_COMPLETE_REASONS.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cantCompleteOption,
                    selectedReason === reason && styles.cantCompleteOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text style={[
                    styles.cantCompleteOptionText,
                    selectedReason === reason && styles.cantCompleteOptionTextSelected,
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.taskModalBottom}>
          {mode === 'complete' ? (
            <TouchableOpacity 
              style={[
                styles.completeTaskBtn,
                (!photo && task.requiresPhoto) && styles.completeTaskBtnDisabled,
              ]} 
              onPress={handleComplete}
              disabled={!photo && task.requiresPhoto}
            >
              <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
              <Text style={styles.completeTaskBtnText}>Mark as Complete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.submitReportBtn,
                !selectedReason && styles.submitReportBtnDisabled,
              ]} 
              onPress={handleCantComplete}
              disabled={!selectedReason}
            >
              <Text style={[
                styles.submitReportBtnText,
                !selectedReason && styles.submitReportBtnTextDisabled,
              ]}>Submit Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const CareHistoryModal = ({ visible, onClose, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 17));
  const today = 17;
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <View key={`prev-${i}`} style={styles.calendarDay}>
          <Text style={styles.calendarDayTextMuted}>{daysInPrevMonth - i}</Text>
        </View>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && month === 0 && year === 2026;
      const hasActivity = CARE_ACTIVITY_DATES.includes(day);
      const isFuture = day > today;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isToday && styles.calendarDayToday]}
          onPress={() => {
            if (!isFuture) {
              const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
              onSelectDate(dateStr, day);
              onClose();
            }
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isFuture && styles.calendarDayTextFuture,
          ]}>{day}</Text>
          {hasActivity && !isToday && (
            <View style={styles.activityDot} />
          )}
        </TouchableOpacity>
      );
    }
    
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingDays = totalCells - (firstDayOfMonth + daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <View key={`next-${i}`} style={styles.calendarDay}>
          <Text style={styles.calendarDayTextMuted}>{i}</Text>
        </View>
      );
    }
    
    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Care History</Text>
            <TouchableOpacity onPress={onClose} style={styles.calendarCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.calendarSubtitle}>Select a date to view all care activities</Text>
          
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarDivider} />
          
          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
          
          <Text style={styles.calendarFooter}>Tap a date to view that day's care timeline</Text>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// PATIENT PROFILE MODAL
// ============================================
const PatientProfileModal = ({ visible, onClose, onOpenCareHistory }) => {
  const today = new Date();
  const formattedDate = `Jan ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.profileContainer}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileHero}>
            <Image source={{ uri: PATIENT.photo }} style={styles.profileHeroImage} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.profileHeroOverlay}>
              <Text style={styles.profileName}>{PATIENT.name}</Text>
              <Text style={styles.profileMeta}>Age {PATIENT.age} • DOB: {PATIENT.dob}</Text>
            </View>
          </View>

          <View style={styles.profileContent}>
            <TouchableOpacity style={styles.careHistoryCard} onPress={onOpenCareHistory}>
              <View style={styles.careHistoryIconBg}>
                <Ionicons name="calendar" size={24} color={COLORS.white} />
              </View>
              <View style={styles.careHistoryInfo}>
                <Text style={styles.careHistoryLabel}>CARE HISTORY</Text>
                <Text style={styles.careHistoryDate}>{formattedDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.careHistoryLight} />
            </TouchableOpacity>

            <View style={styles.allergiesCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={20} color={COLORS.allergyText} />
                <Text style={styles.allergiesTitle}>Allergies</Text>
              </View>
              <View style={styles.allergyTags}>
                {PATIENT.allergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color={COLORS.conditionIcon} />
                <Text style={styles.sectionTitle}>Medical Conditions</Text>
              </View>
              {PATIENT.conditions.map((condition, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{condition}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bandage" size={20} color={COLORS.medicationIcon} />
                <Text style={styles.sectionTitle}>Current Medications</Text>
              </View>
              {PATIENT.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationDetails}> - {med.dosage}, {med.frequency}</Text>
                </View>
              ))}
            </View>

            <View style={styles.statusRow}>
              <View style={styles.codeStatusCard}>
                <Ionicons name="shield-outline" size={28} color={COLORS.codeStatusText} />
                <Text style={styles.codeStatusLabel}>CODE STATUS</Text>
                <Text style={styles.codeStatusValue}>{PATIENT.codeStatus}</Text>
              </View>
              <View style={styles.mobilityCard}>
                <Ionicons name="pulse" size={28} color={COLORS.mobilityText} />
                <Text style={styles.mobilityLabel}>MOBILITY</Text>
                <Text style={styles.mobilityValue}>{PATIENT.mobility}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color={COLORS.accessIcon} />
                <Text style={styles.sectionTitle}>Access Instructions</Text>
              </View>
              <Text style={styles.accessText}>{PATIENT.accessInstructions}</Text>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="call" size={20} color={COLORS.emergencyIcon} />
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              </View>
              {PATIENT.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                  </View>
                  <TouchableOpacity style={styles.callButtonGreen}>
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.contactDivider} />
              <Text style={styles.physicianLabel}>PRIMARY CARE PHYSICIAN</Text>
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{PATIENT.physician.name}</Text>
                  <Text style={styles.contactRelation}>{PATIENT.physician.facility}</Text>
                </View>
                <TouchableOpacity style={styles.callButtonBlue}>
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social" size={22} color={COLORS.white} />
              <Text style={styles.shareButtonText}>Share Medical ID for EMS</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ============================================
// REQUEST CARD COMPONENT
// ============================================
const RequestCard = ({ request, onAccept, onDecline }) => {
  const [showDeclineReasons, setShowDeclineReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleDeclinePress = () => {
    setShowDeclineReasons(true);
  };

  const handleCancelDecline = () => {
    setShowDeclineReasons(false);
    setSelectedReason(null);
  };

  const handleConfirmDecline = () => {
    if (selectedReason) {
      onDecline(request.id, selectedReason);
      setShowDeclineReasons(false);
      setSelectedReason(null);
    }
  };

  const handleAccept = () => {
    onAccept(request);
  };

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestBorder} />
      <View style={styles.requestContent}>
        <Text style={styles.requestTitle}>{request.title}</Text>
        <View style={styles.requestMeta}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.requestTime}>{request.time}</Text>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} style={{ marginLeft: 16 }} />
          <Text style={styles.requestRequester}>{request.requester} ({request.relation})</Text>
        </View>
        <Text style={styles.requestDescription}>{request.description}</Text>

        {!showDeclineReasons ? (
          <View style={styles.requestButtons}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={handleDeclinePress}>
              <Ionicons name="close" size={20} color={COLORS.white} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.declineReasonsContainer}>
            <Text style={styles.selectReasonLabel}>SELECT REASON:</Text>
            {DECLINE_REASONS.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.declineReasonOption,
                  selectedReason === reason && styles.declineReasonSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[
                  styles.declineReasonText,
                  selectedReason === reason && styles.declineReasonTextSelected,
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.declineActionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDecline}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !selectedReason && styles.confirmButtonDisabled,
                ]} 
                onPress={handleConfirmDecline}
                disabled={!selectedReason}
              >
                <Text style={[
                  styles.confirmButtonText,
                  !selectedReason && styles.confirmButtonTextDisabled,
                ]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================
// AI COPILOT STYLES (defined before CaregiverHomeScreen)
// ============================================
const aiStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowAI: { justifyContent: 'flex-start' },
  messageRowUser: { justifyContent: 'flex-end' },
  avatarBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarBgAI: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  avatarBgUser: { backgroundColor: COLORS.primary, marginLeft: 10, marginRight: 0 },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  messageText: { fontSize: 16, color: COLORS.white, lineHeight: 24 },
  typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  typingBubble: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 3,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  textInputActive: { borderColor: COLORS.primary },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: COLORS.primary },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: { fontSize: 13, color: COLORS.textMuted },
});

// ============================================
// CAREGIVER HOME SCREEN
// ============================================
const CaregiverHomeScreen = () => {
  const sharedData = React.useContext(SharedDataContext);
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTask, setExpandedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showCareHistory, setShowCareHistory] = useState(false);
  const [showVitalSigns, setShowVitalSigns] = useState(false);
  const [showHeartRate, setShowHeartRate] = useState(false);
  const [showTemperature, setShowTemperature] = useState(false);
  const [showPain, setShowPain] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [vitals, setVitals] = useState({ bp: { systolic: 120, diastolic: 76 }, heart: 72, temp: 98.6, pain: 1 });
  
  // Use shared requests from context (requests from family members)
  const requests = sharedData?.sharedRequests?.filter(r => r.status === 'pending') || [];
  
  // AI Copilot state
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Care Assistant. I'm here to help you provide the best care for David Smith.\n\nI can answer questions about care procedures, help with documentation, and provide guidance on tasks.\n\nHow can I assist you today?",
      isAI: true,
    },
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiInputFocused, setAiInputFocused] = useState(false);
  const [aiIsTyping, setAiIsTyping] = useState(false);

  const completedTasks = tasks.filter(t => t.completed || t.cantComplete);
  const completedCount = viewingHistory ? (HISTORY_TASKS[viewingHistory]?.length || 0) : completedTasks.length;
  const totalCount = viewingHistory ? (HISTORY_TASKS[viewingHistory]?.length || 0) : tasks.length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return COLORS.critical;
      case 'standard': return COLORS.standard;
      case 'low': return COLORS.low;
      default: return COLORS.standard;
    }
  };

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const handleSelectDate = (dateStr, day) => {
    if (day === 17) {
      setViewingHistory(null);
    } else {
      setViewingHistory(dateStr);
    }
  };

  const handleBackToToday = () => {
    setViewingHistory(null);
  };

  // AI Copilot functions
  const getAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('fall') || lowerMsg.includes('fell')) {
      return `I understand this is an urgent situation. Here's what to do for a patient fall:

**Immediate Steps:**
1. **Stay calm** and assess the situation
2. **Do not move** the patient unless there's immediate danger
3. **Check for injuries** - look for bleeding, swelling, or deformity
4. **Ask about pain** - can they tell you where it hurts?

**If patient is conscious:**
• Keep them still and comfortable
• Apply ice to any bumps or bruises
• Monitor for signs of head injury

**Document immediately:**
• Time of fall
• Location and circumstances
• Any injuries observed
• Patient's statements

**When to call 911:**
• Loss of consciousness
• Severe bleeding
• Suspected fractures
• Head injury

Would you like help documenting this incident?`;
    } else if (lowerMsg.includes('medication') || lowerMsg.includes('medicine') || lowerMsg.includes('drug')) {
      return `Here's guidance on medication management:

**Before administering:**
• Verify the 5 Rights: Right patient, drug, dose, route, time
• Check for allergies
• Review recent vitals if applicable

**Documentation tips:**
• Record exact time given
• Note patient's condition
• Document any side effects

Need help with a specific medication question?`;
    }
    return `I'm happy to help! I can assist with:

• **Care procedures** - Step-by-step guidance
• **Documentation** - Help recording tasks and incidents  
• **Vital signs** - Recording and interpreting
• **Communication** - Tips for family updates

What would you like to know more about?`;
  };

  const handleAISend = () => {
    if (aiInputText.trim()) {
      const userMessage = {
        id: Date.now(),
        text: aiInputText.trim(),
        isAI: false,
      };
      setAiMessages([...aiMessages, userMessage]);
      const userInput = aiInputText;
      setAiInputText('');
      setAiIsTyping(true);

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: getAIResponse(userInput),
          isAI: true,
        };
        setAiMessages(prev => [...prev, aiResponse]);
        setAiIsTyping(false);
      }, 1500);
    }
  };

  const resetAIChat = () => {
    setAiMessages([
      {
        id: 1,
        text: "Hello! I'm your AI Care Assistant. I'm here to help you provide the best care for David Smith.\n\nI can answer questions about care procedures, help with documentation, and provide guidance on tasks.\n\nHow can I assist you today?",
        isAI: true,
      },
    ]);
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleCompleteTask = (taskId, data) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Add to shared data so Family can see it
    if (sharedData && task) {
      sharedData.addCompletedTask({
        title: task.title,
        description: task.description || '',
        note: data.note || '',
        image: data.photo || null,
        photos: data.photos || [],
      });
    }
    
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, ...data }
        : t
    ));
  };

  const handleCantCompleteTask = (taskId, data) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, cantComplete: true, cantCompleteReason: data.reason, ...data }
        : t
    ));
  };

  const handleOpenCareHistory = () => {
    setShowPatientProfile(false);
    setShowCareHistory(true);
  };

  const handleAcceptRequest = (request) => {
    // Update shared data to mark request as accepted
    if (sharedData) {
      sharedData.updateRequestStatus(request.id, 'accepted', 'Request accepted and added to tasks');
    }
    
    // Add request as a new task
    const newTask = {
      id: Date.now(),
      title: request.title,
      time: request.time,
      priority: request.priority || 'standard',
      requiresPhoto: false,
      fromRequest: true,
      description: request.details || '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeclineRequest = (requestId, reason) => {
    // Update shared data to mark request as declined with reason
    if (sharedData) {
      sharedData.updateRequestStatus(requestId, 'declined', reason);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Patient Card */}
        <TouchableOpacity style={styles.patientCard} activeOpacity={0.8} onPress={() => setShowPatientProfile(true)}>
          <Image source={{ uri: PATIENT.photo }} style={styles.patientImage} />
          <View style={styles.patientOverlay}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{PATIENT.name}</Text>
              <Text style={styles.patientAge}>{PATIENT.age} years old</Text>
            </View>
            <View style={styles.patientChevron}>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Vitals Grid */}
        <View style={styles.vitalsContainer}>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowVitalSigns(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalBPBg }]}>
              <Ionicons name="heart" size={22} color={COLORS.vitalBP} />
            </View>
            <Text style={styles.vitalValue}>{vitals.bp.systolic}/{vitals.bp.diastolic}</Text>
            <Text style={styles.vitalLabel}>BP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowHeartRate(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalHeartBg }]}>
              <Ionicons name="pulse" size={22} color={COLORS.vitalHeart} />
            </View>
            <Text style={styles.vitalValue}>{vitals.heart}</Text>
            <Text style={styles.vitalLabel}>Heart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowTemperature(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalTempBg }]}>
              <Ionicons name="thermometer" size={22} color={COLORS.vitalTemp} />
            </View>
            <Text style={styles.vitalValue}>{vitals.temp}°</Text>
            <Text style={styles.vitalLabel}>Temp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vitalCard} onPress={() => setShowPain(true)}>
            <View style={[styles.vitalIconBg, { backgroundColor: COLORS.vitalPainBg }]}>
              <Ionicons name="sad-outline" size={22} color={COLORS.vitalPain} />
            </View>
            <Text style={styles.vitalValue}>{vitals.pain}/10</Text>
            <Text style={styles.vitalLabel}>Pain</Text>
          </TouchableOpacity>
        </View>

        {/* Viewing History Banner */}
        {viewingHistory && (
          <View style={styles.historyBanner}>
            <View style={styles.historyBannerLeft}>
              <View style={styles.historyIconCircle}>
                <Ionicons name="time-outline" size={24} color={COLORS.historyText} />
              </View>
              <View>
                <Text style={styles.historyBannerLabel}>VIEWING HISTORY</Text>
                <Text style={styles.historyBannerDate}>{formatHistoryDate(viewingHistory)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.backToTodayBtn} onPress={handleBackToToday}>
              <Text style={styles.backToTodayText}>Back to Today</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {viewingHistory ? `${formatHistoryDate(viewingHistory)}'s Progress` : "Today's Progress"}
            </Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }]} />
          </View>
        </View>

        {/* Tab Switcher or Completed Tasks Header */}
        {viewingHistory ? (
          <View style={styles.completedTasksHeader}>
            <Text style={styles.completedTasksTitle}>Completed Tasks</Text>
          </View>
        ) : (
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('requests')}
              activeOpacity={0.6}
            >
              {requests.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{requests.length}</Text>
                </View>
              )}
              <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>Requests</Text>
            </TouchableOpacity>
            <View style={styles.tabDivider} />
            <TouchableOpacity 
              style={styles.tabItem} 
              onPress={() => setActiveTab('tasks')}
              activeOpacity={0.6}
            >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Today's Tasks</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content List */}
        <View style={styles.taskList}>
          {viewingHistory ? (
            (HISTORY_TASKS[viewingHistory] || []).map((task) => (
              <View key={task.id} style={styles.completedTaskCard}>
                <View style={styles.completedTaskBar} />
                <View style={styles.completedTaskContent}>
                  <Text style={styles.completedTaskTitle}>{task.title}</Text>
                  <View style={styles.completedTaskMeta}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.completedTaskTime}>{task.completedTime}</Text>
                  </View>
                  <Text style={styles.completedTaskNotes}>"{task.notes}"</Text>
                </View>
                <View style={styles.completedTaskPhotoContainer}>
                  <Image source={{ uri: task.photo }} style={styles.completedTaskPhoto} />
                  <TouchableOpacity style={styles.galleryIconBtn}>
                    <Ionicons name="albums-outline" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : activeTab === 'requests' ? (
            requests.length > 0 ? (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyStateText}>No pending requests</Text>
              </View>
            )
          ) : (
            tasks.map((task) => (
              <View key={task.id}>
                {/* Completed Task */}
                {task.completed ? (
                  <View style={styles.taskCardCompleted}>
                    <View style={[styles.taskPriorityBar, { backgroundColor: COLORS.primary }]} />
                    <View style={styles.taskContentCompleted}>
                      <Text style={styles.taskTitleCompleted}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.taskTime}>{task.completedTime}</Text>
                      </View>
                      <Text style={styles.taskNotesPreview}>"{task.notes}"</Text>
                    </View>
                    <View style={styles.completedPhotoContainer}>
                      <Image source={{ uri: task.photo }} style={styles.completedPhotoThumb} />
                      <View style={styles.completedPhotoOverlay}>
                        <Ionicons name="images" size={14} color={COLORS.white} />
                      </View>
                    </View>
                  </View>
                ) : task.cantComplete ? (
                  /* Can't Complete Task */
                  <View style={styles.taskCardCantComplete}>
                    <View style={[styles.taskPriorityBar, { backgroundColor: COLORS.critical }]} />
                    <View style={styles.taskContentCantComplete}>
                      <Text style={styles.taskTitleCantComplete}>{task.title}</Text>
                      <View style={styles.cantCompleteReasonRow}>
                        <Ionicons name="warning" size={16} color={COLORS.critical} />
                        <Text style={styles.cantCompleteReasonText}>{task.cantCompleteReason}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cantCompleteCloseBtn}>
                      <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Regular Task */
                  <TouchableOpacity 
                    style={[styles.taskCard, expandedTask === task.id && styles.taskCardExpanded]}
                    activeOpacity={0.7}
                    onPress={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <View style={[styles.taskPriorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.taskTime}>{task.time}</Text>
                        {task.requiresPhoto && (
                          <View style={styles.photoBadge}>
                            <Ionicons name="camera-outline" size={12} color={COLORS.textSecondary} />
                            <Text style={styles.photoBadgeText}>Photo</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Expanded Content */}
                      {expandedTask === task.id && (
                        <View style={styles.taskExpandedContent}>
                          <View style={styles.taskInstructionsBox}>
                            <Text style={styles.taskInstructionsLabel}>INSTRUCTIONS</Text>
                            <Text style={styles.taskInstructionsText}>{task.instructions}</Text>
                          </View>
                          <View style={styles.taskTimeWindowRow}>
                            <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.taskTimeWindowLabel}>TIME WINDOW</Text>
                            <Text style={styles.taskTimeWindowValue}>{task.timeWindow}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.startTaskBtn}
                            onPress={() => handleStartTask(task)}
                          >
                            <Text style={styles.startTaskBtnText}>Start Task</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {expandedTask !== task.id && (
                      <View style={styles.taskChevronContainer}>
                        <View style={styles.taskChevronCircle}>
                          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* AI Copilot FAB */}
      <TouchableOpacity 
        style={styles.calendarFab} 
        onPress={() => setShowAICopilot(true)}
      >
        <Ionicons name="hardware-chip-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* AI Copilot Modal */}
      <Modal visible={showAICopilot} animationType="slide" transparent>
        <View style={aiStyles.modalOverlay}>
          <KeyboardAvoidingView 
            style={aiStyles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={aiStyles.header}>
              <View style={aiStyles.headerIconBg}>
                <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
              </View>
              <View style={aiStyles.headerInfo}>
                <Text style={aiStyles.headerTitle}>Care Assistant</Text>
                <Text style={aiStyles.headerSubtitle}>Powered by AI</Text>
              </View>
              <TouchableOpacity 
                style={aiStyles.closeBtn}
                onPress={() => {
                  setShowAICopilot(false);
                  resetAIChat();
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView 
              style={aiStyles.messagesContainer}
              contentContainerStyle={aiStyles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {aiMessages.map((message) => (
                <View 
                  key={message.id} 
                  style={[
                    aiStyles.messageRow,
                    message.isAI ? aiStyles.messageRowAI : aiStyles.messageRowUser,
                  ]}
                >
                  {message.isAI && (
                    <View style={[aiStyles.avatarBg, aiStyles.avatarBgAI]}>
                      <Ionicons name="hardware-chip" size={18} color={COLORS.primary} />
                    </View>
                  )}
                  <View style={[
                    aiStyles.messageBubble,
                    message.isAI ? aiStyles.aiBubble : aiStyles.userBubble,
                  ]}>
                    <Text style={aiStyles.messageText}>{message.text}</Text>
                  </View>
                  {!message.isAI && (
                    <View style={[aiStyles.avatarBg, aiStyles.avatarBgUser]}>
                      <Ionicons name="person" size={18} color={COLORS.white} />
                    </View>
                  )}
                </View>
              ))}
              
              {/* Typing Indicator */}
              {aiIsTyping && (
                <View style={aiStyles.typingRow}>
                  <View style={[aiStyles.avatarBg, aiStyles.avatarBgAI]}>
                    <Ionicons name="hardware-chip" size={18} color={COLORS.primary} />
                  </View>
                  <View style={aiStyles.typingBubble}>
                    <View style={aiStyles.typingDot} />
                    <View style={aiStyles.typingDot} />
                    <View style={aiStyles.typingDot} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={aiStyles.inputContainer}>
              <View style={aiStyles.inputRow}>
                <TextInput
                  style={[
                    aiStyles.textInput,
                    aiInputFocused && aiStyles.textInputActive,
                  ]}
                  placeholder="Ask about care..."
                  placeholderTextColor={COLORS.textMuted}
                  value={aiInputText}
                  onChangeText={setAiInputText}
                  onFocus={() => setAiInputFocused(true)}
                  onBlur={() => setAiInputFocused(false)}
                />
                <TouchableOpacity 
                  style={[
                    aiStyles.sendBtn,
                    aiInputText.trim() && aiStyles.sendBtnActive,
                  ]}
                  onPress={handleAISend}
                >
                  <Ionicons name="send" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={aiStyles.footer}>
                <Text style={aiStyles.footerText}>AI care guidance • Not medical advice</Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modals */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)}
        onOpenCareHistory={handleOpenCareHistory}
      />
      <CareHistoryModal
        visible={showCareHistory}
        onClose={() => setShowCareHistory(false)}
        onSelectDate={handleSelectDate}
      />
      <VitalSignsModal
        visible={showVitalSigns}
        onClose={() => setShowVitalSigns(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <HeartRateModal
        visible={showHeartRate}
        onClose={() => setShowHeartRate(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <TemperatureModal
        visible={showTemperature}
        onClose={() => setShowTemperature(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <PainModal
        visible={showPain}
        onClose={() => setShowPain(false)}
        vitals={vitals}
        onUpdateVitals={setVitals}
      />
      <TaskDetailModal
        visible={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
        task={selectedTask}
        onComplete={handleCompleteTask}
        onCantComplete={handleCantCompleteTask}
      />
    </View>
  );
};

// Placeholder Screens
const PlaceholderScreen = ({ icon, title }) => (
  <View style={styles.placeholderScreen}>
    <Ionicons name={icon} size={48} color={COLORS.textSecondary} />
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

// ============================================
// INCIDENT TYPES DATA
// ============================================
const INCIDENT_TYPES = [
  { id: 'fall', title: 'Fall', description: 'Patient fall or near-fall', icon: 'warning' },
  { id: 'medication', title: 'Medication Issue', description: 'Missed dose, wrong medication, or reaction', icon: 'medical' },
  { id: 'behavioral', title: 'Behavioral Change', description: 'Confusion, agitation, or mood changes', icon: 'fitness' },
  { id: 'injury', title: 'Injury', description: 'Cut, bruise, or other physical injury', icon: 'bandage' },
  { id: 'vital', title: 'Vital Sign Concern', description: 'Abnormal vital signs', icon: 'thermometer' },
  { id: 'other', title: 'Other', description: 'Other incident type', icon: 'help-circle' },
];

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const INITIAL_PAST_REPORTS = [];

// ============================================
// INCIDENT STYLES (must be defined before IncidentScreen)
// ============================================
const incStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  
  // Header
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary },
  
  // New Report Button
  newReportBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#be185d',
    marginHorizontal: 20, 
    borderRadius: 20, 
    padding: 16,
    marginBottom: 28,
  },
  newReportIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  newReportTextContainer: { flex: 1 },
  newReportTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  newReportSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' },
  
  // Past Reports Header
  pastReportsHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    marginBottom: 14,
  },
  pastReportsHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  pastReportsTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginLeft: 8 },
  pastReportsCount: { 
    backgroundColor: COLORS.textMuted, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  pastReportsCountText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  
  // Empty State
  emptyState: { 
    backgroundColor: COLORS.card, 
    marginHorizontal: 20, 
    borderRadius: 20, 
    paddingVertical: 50, 
    alignItems: 'center',
  },
  emptyIconBg: { 
    width: 70, 
    height: 70, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  
  // Past Reports List
  pastReportsList: { marginHorizontal: 20 },
  pastReportCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 10,
  },
  pastReportLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  typeIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
  },
  pastReportInfo: { flex: 1 },
  pastReportType: { fontSize: 16, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  pastReportDate: { fontSize: 13, color: COLORS.textSecondary },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  severityBadgeText: { fontSize: 11, fontWeight: '700' },
  
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 10,
    marginBottom: 16,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  modalWarningIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: 'rgba(239, 68, 68, 0.15)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  modalStep: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  cancelBtn: { backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  
  // Progress Bar
  progressBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 6 },
  progressSegment: { flex: 1, height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 2 },
  progressSegmentActive: { backgroundColor: '#f43f5e' },
  
  // Step Container
  stepContainer: { flex: 1, paddingHorizontal: 20 },
  stepQuestion: { fontSize: 22, fontWeight: '600', color: COLORS.white, marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  stepSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  
  // Type Cards
  typesList: { flex: 1 },
  typeCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    borderColor: COLORS.critical,
  },
  typeIconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  typeIconContainerSelected: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  typeTextContainer: { flex: 1 },
  typeTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  typeDescription: { fontSize: 14, color: COLORS.textSecondary },
  
  // Step 2 - Details
  fieldLabel: { fontSize: 15, fontWeight: '600', color: COLORS.white, marginBottom: 12, marginTop: 20 },
  severityRow: { flexDirection: 'row', gap: 10 },
  severityBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  severityBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  textArea: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: COLORS.white, 
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textAreaActive: { borderColor: '#f43f5e' },
  
  // Step 3 - Photos
  photoUploadArea: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: COLORS.cardBorder, 
    borderRadius: 16, 
    paddingVertical: 40, 
    alignItems: 'center',
    marginBottom: 20,
  },
  photoUploadIconBg: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: COLORS.card, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoUploadText: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  photoUploadHint: { fontSize: 14, color: COLORS.textMuted },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbContainer: { position: 'relative' },
  photoThumb: { width: (SCREEN_WIDTH - 60) / 3, height: (SCREEN_WIDTH - 60) / 3, borderRadius: 12 },
  photoRemove: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Photo Options Modal
  photoOptionsOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'flex-end',
  },
  photoOptionsModal: { 
    backgroundColor: COLORS.card, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    paddingBottom: 34,
  },
  photoOptionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  photoOptionText: { fontSize: 18, color: COLORS.white, marginLeft: 12 },
  photoOptionCancelText: { fontSize: 18, fontWeight: '600', color: COLORS.critical },
  photoOptionDivider: { height: 1, backgroundColor: COLORS.cardBorder },
  photosCountText: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginBottom: 12, marginTop: 20 },
  addMorePhotosBtn: { 
    width: (SCREEN_WIDTH - 60) / 3, 
    height: (SCREEN_WIDTH - 60) / 3, 
    borderRadius: 12, 
    backgroundColor: COLORS.card, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: COLORS.textMuted,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Step 3 - Witness
  witnessNote: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(59, 130, 246, 0.15)', 
    borderRadius: 12, 
    padding: 14, 
    marginTop: 16,
    alignItems: 'flex-start',
  },
  witnessNoteText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 10, flex: 1, lineHeight: 20 },
  witnessCheckRow: { marginTop: 20 },
  witnessCheckbox: { flexDirection: 'row', alignItems: 'center' },
  witnessCheckText: { fontSize: 16, color: COLORS.white, marginLeft: 10 },
  
  // Step 5 - Review
  reviewTitle: { fontSize: 22, fontWeight: '600', color: COLORS.white, marginBottom: 20 },
  summaryCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  summaryTypeRow: { flexDirection: 'row', alignItems: 'center' },
  summaryIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryType: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  summarySeverityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  summarySeverityText: { fontSize: 12, fontWeight: '700' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: 6, marginTop: 16 },
  summaryText: { fontSize: 16, color: COLORS.white, lineHeight: 22 },
  summaryPhotosRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  summaryPhotoThumb: { width: 50, height: 50, borderRadius: 25 },
  summaryPhotoMore: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: COLORS.card, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryPhotoMoreText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  summaryNoPhotos: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  
  // Toggles
  toggleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 10,
  },
  toggleRowActive: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center' },
  toggleIconBg: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  toggleText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  checkbox: { 
    width: 24, 
    height: 24, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: COLORS.textMuted, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  
  // Footer Buttons
  modalFooter: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center',
  },
  backBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  continueBtn: { 
    flex: 2, 
    backgroundColor: '#f43f5e', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center',
  },
  continueBtnDisabled: { backgroundColor: COLORS.cardBorder },
  continueBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  submitBtn: { 
    flex: 2, 
    backgroundColor: '#f43f5e', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center',
  },
  submitBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
});

// ============================================
// INCIDENT SCREEN
// ============================================
const IncidentScreen = () => {
  const sharedData = React.useContext(SharedDataContext);
  const [showNewReport, setShowNewReport] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [pastReports, setPastReports] = useState(INITIAL_PAST_REPORTS);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedType(null);
    setSeverity('High');
    setDescription('');
    setActionsTaken('');
    setWitnesses('');
    setPhotos([]);
    setNotifyFamily(true);
    setFollowUpRequired(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowNewReport(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const canContinue = () => {
    if (currentStep === 1) return selectedType !== null;
    if (currentStep === 2) return description.trim().length > 0;
    return true;
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setPhotos([...photos, { id: Date.now(), uri: result.assets[0].uri }]);
      // Ask if user wants to take another photo
      Alert.alert(
        'Photo Added',
        'Would you like to take another photo?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => handleTakePhoto() },
        ]
      );
    }
  };

  const handleChooseFromLibrary = async () => {
    setShowPhotoOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset, index) => ({
        id: Date.now() + index,
        uri: asset.uri,
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  const handleSubmit = () => {
    const typeObj = INCIDENT_TYPES.find(t => t.id === selectedType);
    const typeName = typeObj ? typeObj.title : selectedType;
    
    // Add to shared data so Family can see it
    if (sharedData) {
      sharedData.addIncidentReport({
        title: typeName,
        type: selectedType,
        severity: severity.toLowerCase(),
        description,
        actionsTaken,
        photos: photos, // Use actual photo URIs
      });
    }
    
    const newReport = {
      id: Date.now(),
      type: selectedType,
      severity,
      description,
      actionsTaken,
      photos: photos.length,
      notifyFamily,
      followUpRequired,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patient: PATIENT.name,
    };
    setPastReports([newReport, ...pastReports]);
    resetForm();
    setShowNewReport(false);
    Alert.alert('Success', 'Incident report submitted successfully. Family has been notified.');
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'Low': return '#22c55e';
      case 'Medium': return '#eab308';
      case 'High': return '#f97316';
      case 'Critical': return '#ef4444';
      default: return COLORS.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found ? found.icon : 'warning';
  };

  const getTypeTitle = (type) => {
    const found = INCIDENT_TYPES.find(t => t.id === type);
    return found ? found.title : 'Unknown';
  };

  // Main Incidents Screen
  const renderMainScreen = () => (
    <View style={incStyles.container}>
      <ScrollView style={incStyles.scrollView} contentContainerStyle={incStyles.scrollContent}>
        {/* Header */}
        <View style={incStyles.header}>
          <Text style={incStyles.title}>Incidents</Text>
          <Text style={incStyles.subtitle}>Report and track incidents for {PATIENT.name}</Text>
        </View>

        {/* New Incident Report Button */}
        <TouchableOpacity 
          style={incStyles.newReportBtn}
          onPress={() => setShowNewReport(true)}
        >
          <View style={incStyles.newReportIconBg}>
            <Ionicons name="add" size={28} color={COLORS.white} />
          </View>
          <View style={incStyles.newReportTextContainer}>
            <Text style={incStyles.newReportTitle}>New Incident Report</Text>
            <Text style={incStyles.newReportSubtitle}>Document an incident now</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Past Reports Section */}
        <View style={incStyles.pastReportsHeader}>
          <View style={incStyles.pastReportsHeaderLeft}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={incStyles.pastReportsTitle}>Past Reports</Text>
          </View>
          <View style={incStyles.pastReportsCount}>
            <Text style={incStyles.pastReportsCountText}>{pastReports.length}</Text>
          </View>
        </View>

        {/* Past Reports List or Empty State */}
        {pastReports.length === 0 ? (
          <View style={incStyles.emptyState}>
            <View style={incStyles.emptyIconBg}>
              <Ionicons name="warning" size={40} color={COLORS.textSecondary} />
            </View>
            <Text style={incStyles.emptyTitle}>No incidents reported</Text>
            <Text style={incStyles.emptySubtitle}>Tap the button above to report a new incident</Text>
          </View>
        ) : (
          <View style={incStyles.pastReportsList}>
            {pastReports.map((report) => (
              <View key={report.id} style={incStyles.pastReportCard}>
                <View style={incStyles.pastReportLeft}>
                  <View style={[incStyles.typeIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Ionicons name={getTypeIcon(report.type)} size={20} color={COLORS.critical} />
                  </View>
                  <View style={incStyles.pastReportInfo}>
                    <Text style={incStyles.pastReportType}>{getTypeTitle(report.type)}</Text>
                    <Text style={incStyles.pastReportDate}>{report.date} • {report.time}</Text>
                  </View>
                </View>
                <View style={[incStyles.severityBadge, { backgroundColor: `${getSeverityColor(report.severity)}30` }]}>
                  <Text style={[incStyles.severityBadgeText, { color: getSeverityColor(report.severity) }]}>
                    {report.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  // Step 1: Incident Type Selection
  const renderStep1 = () => (
    <View style={incStyles.stepContainer}>
      <Text style={incStyles.stepQuestion}>What type of incident occurred?</Text>
      <ScrollView style={incStyles.typesList} showsVerticalScrollIndicator={false}>
        {INCIDENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              incStyles.typeCard,
              selectedType === type.id && incStyles.typeCardSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <View style={[
              incStyles.typeIconContainer,
              selectedType === type.id && incStyles.typeIconContainerSelected,
            ]}>
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={selectedType === type.id ? COLORS.critical : COLORS.textSecondary} 
              />
            </View>
            <View style={incStyles.typeTextContainer}>
              <Text style={incStyles.typeTitle}>{type.title}</Text>
              <Text style={incStyles.typeDescription}>{type.description}</Text>
            </View>
            {selectedType === type.id && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Step 2: Incident Details
  const renderStep2 = () => (
    <ScrollView 
      style={incStyles.stepContainer} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Severity Level */}
      <Text style={incStyles.fieldLabel}>Severity Level</Text>
      <View style={incStyles.severityRow}>
        {SEVERITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              incStyles.severityBtn,
              severity === level && { 
                backgroundColor: `${getSeverityColor(level)}30`,
                borderColor: getSeverityColor(level),
              },
            ]}
            onPress={() => setSeverity(level)}
          >
            <Text style={[
              incStyles.severityBtnText,
              severity === level && { color: getSeverityColor(level) },
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* What happened? */}
      <Text style={incStyles.fieldLabel}>What happened?</Text>
      <TextInput
        style={[incStyles.textArea, description && incStyles.textAreaActive]}
        placeholder="Describe the incident in detail..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Actions Taken */}
      <Text style={incStyles.fieldLabel}>Actions Taken</Text>
      <TextInput
        style={[incStyles.textArea, actionsTaken && incStyles.textAreaActive]}
        placeholder="What steps did you take to address this?"
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={4}
        value={actionsTaken}
        onChangeText={setActionsTaken}
      />
    </ScrollView>
  );

  // Step 3: Witness Information
  const renderStep3 = () => (
    <ScrollView style={incStyles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={incStyles.stepTitle}>Witness Information</Text>
      <Text style={incStyles.stepSubtitle}>Document any witnesses present during the incident for legal and record-keeping purposes.</Text>

      <Text style={incStyles.fieldLabel}>Witness Name(s)</Text>
      <TextInput
        style={incStyles.textArea}
        placeholder="Enter the names of any witnesses present..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={4}
        value={witnesses}
        onChangeText={setWitnesses}
        textAlignVertical="top"
      />
      
      <View style={incStyles.witnessNote}>
        <Ionicons name="information-circle" size={20} color={COLORS.textSecondary} />
        <Text style={incStyles.witnessNoteText}>
          Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor", "Jane Doe - Nurse on duty")
        </Text>
      </View>

      <View style={incStyles.witnessCheckRow}>
        <TouchableOpacity 
          style={incStyles.witnessCheckbox}
          onPress={() => setWitnesses(witnesses ? witnesses : 'No witnesses present')}
        >
          <Ionicons 
            name={witnesses === 'No witnesses present' ? "checkbox" : "square-outline"} 
            size={24} 
            color={witnesses === 'No witnesses present' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={incStyles.witnessCheckText}>No witnesses were present</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Step 4: Add Photos
  const renderStep4 = () => (
    <ScrollView style={incStyles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={incStyles.stepTitle}>Add Photos (Optional)</Text>
      <Text style={incStyles.stepSubtitle}>Document the incident visually for records.</Text>

      {/* Photo Upload Area */}
      <TouchableOpacity 
        style={incStyles.photoUploadArea}
        onPress={() => setShowPhotoOptions(true)}
      >
        <Ionicons name="camera" size={40} color={COLORS.textMuted} />
        <Text style={incStyles.photoUploadText}>Tap to add photo</Text>
        <Text style={incStyles.photoUploadHint}>Take a photo for documentation</Text>
      </TouchableOpacity>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <>
          <Text style={incStyles.photosCountText}>{photos.length} photo{photos.length > 1 ? 's' : ''} added</Text>
          <View style={incStyles.photosGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={incStyles.photoThumbContainer}>
                <Image source={{ uri: photo.uri }} style={incStyles.photoThumb} />
                <TouchableOpacity 
                  style={incStyles.photoRemove}
                  onPress={() => handleRemovePhoto(photo.id)}
                >
                  <Ionicons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            {/* Add More Photos Button */}
            <TouchableOpacity 
              style={incStyles.addMorePhotosBtn}
              onPress={() => setShowPhotoOptions(true)}
            >
              <Ionicons name="add" size={32} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Photo Options Modal */}
      <Modal visible={showPhotoOptions} transparent animationType="fade">
        <TouchableOpacity 
          style={incStyles.photoOptionsOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoOptions(false)}
        >
          <View style={incStyles.photoOptionsModal}>
            <TouchableOpacity style={incStyles.photoOptionBtn} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={incStyles.photoOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={incStyles.photoOptionDivider} />
            <TouchableOpacity style={incStyles.photoOptionBtn} onPress={handleChooseFromLibrary}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={incStyles.photoOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <View style={incStyles.photoOptionDivider} />
            <TouchableOpacity 
              style={incStyles.photoOptionBtn} 
              onPress={() => setShowPhotoOptions(false)}
            >
              <Text style={incStyles.photoOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );

  // Step 5: Review & Submit
  const renderStep5 = () => (
    <ScrollView style={incStyles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={incStyles.reviewTitle}>Review & Submit</Text>

      {/* Report Summary Card */}
      <View style={incStyles.summaryCard}>
        <View style={incStyles.summaryHeader}>
          <View style={incStyles.summaryTypeRow}>
            <View style={[incStyles.summaryIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Ionicons name={getTypeIcon(selectedType)} size={24} color={COLORS.critical} />
            </View>
            <Text style={incStyles.summaryType}>{getTypeTitle(selectedType)}</Text>
          </View>
          <View style={[incStyles.summarySeverityBadge, { backgroundColor: `${getSeverityColor(severity)}30` }]}>
            <Text style={[incStyles.summarySeverityText, { color: getSeverityColor(severity) }]}>
              {severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={incStyles.summaryLabel}>DESCRIPTION</Text>
        <Text style={incStyles.summaryText}>{description || 'No description provided'}</Text>

        <Text style={incStyles.summaryLabel}>ACTIONS TAKEN</Text>
        <Text style={incStyles.summaryText}>{actionsTaken || 'No actions documented'}</Text>

        <Text style={incStyles.summaryLabel}>WITNESSES</Text>
        <Text style={incStyles.summaryText}>{witnesses || 'No witnesses documented'}</Text>

        <Text style={incStyles.summaryLabel}>PHOTOS ({photos.length})</Text>
        {photos.length > 0 ? (
          <View style={incStyles.summaryPhotosRow}>
            {photos.slice(0, 4).map((photo) => (
              <Image key={photo.id} source={{ uri: photo.uri }} style={incStyles.summaryPhotoThumb} />
            ))}
            {photos.length > 4 && (
              <View style={incStyles.summaryPhotoMore}>
                <Text style={incStyles.summaryPhotoMoreText}>+{photos.length - 4}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={incStyles.summaryNoPhotos}>No photos attached</Text>
        )}
      </View>

      {/* Notify Family Toggle */}
      <TouchableOpacity 
        style={[incStyles.toggleRow, notifyFamily && incStyles.toggleRowActive]}
        onPress={() => setNotifyFamily(!notifyFamily)}
      >
        <View style={incStyles.toggleLeft}>
          <View style={[incStyles.toggleIconBg, notifyFamily && { backgroundColor: 'rgba(34, 197, 94, 0.3)' }]}>
            <Ionicons name="shield-checkmark" size={20} color={notifyFamily ? COLORS.primary : COLORS.textSecondary} />
          </View>
          <Text style={incStyles.toggleText}>Notify Family Member</Text>
        </View>
        <Ionicons 
          name={notifyFamily ? "checkmark-circle" : "ellipse-outline"} 
          size={26} 
          color={notifyFamily ? COLORS.primary : COLORS.textMuted} 
        />
      </TouchableOpacity>

      {/* Follow-up Required Toggle */}
      <TouchableOpacity 
        style={incStyles.toggleRow}
        onPress={() => setFollowUpRequired(!followUpRequired)}
      >
        <View style={incStyles.toggleLeft}>
          <View style={incStyles.toggleIconBg}>
            <Ionicons name="time" size={20} color={COLORS.textSecondary} />
          </View>
          <Text style={incStyles.toggleText}>Follow-up Required</Text>
        </View>
        <View style={[incStyles.checkbox, followUpRequired && incStyles.checkboxChecked]}>
          {followUpRequired && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  // New Incident Report Modal
  const renderNewReportModal = () => (
    <Modal visible={showNewReport} animationType="slide">
      <SafeAreaView style={incStyles.modalContainer}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Modal Header */}
          <View style={incStyles.modalHeader}>
            <View style={incStyles.modalHeaderLeft}>
              <View style={incStyles.modalWarningIcon}>
                <Ionicons name="warning" size={20} color={COLORS.critical} />
              </View>
              <View>
                <Text style={incStyles.modalTitle}>New Incident Report</Text>
                <Text style={incStyles.modalStep}>Step {currentStep} of 5</Text>
              </View>
            </View>
            <TouchableOpacity style={incStyles.cancelBtn} onPress={handleCancel}>
              <Text style={incStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={incStyles.progressBar}>
            {[1, 2, 3, 4, 5].map((step) => (
              <View 
                key={step} 
                style={[
                  incStyles.progressSegment,
                  step <= currentStep && incStyles.progressSegmentActive,
                ]} 
              />
            ))}
          </View>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Bottom Navigation */}
          <View style={incStyles.modalFooter}>
            {currentStep > 1 && (
              <TouchableOpacity style={incStyles.backBtn} onPress={handleBack}>
                <Text style={incStyles.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}
            {currentStep < 5 ? (
              <TouchableOpacity 
                style={[
                  incStyles.continueBtn,
                  currentStep === 1 && { flex: 1 },
                  !canContinue() && incStyles.continueBtnDisabled,
                ]} 
                onPress={handleContinue}
                disabled={!canContinue()}
              >
                <Text style={incStyles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={incStyles.submitBtn} onPress={handleSubmit}>
                <Text style={incStyles.submitBtnText}>Submit Incident Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={incStyles.container}>
      <StatusBar style="light" />
      {renderMainScreen()}
      {renderNewReportModal()}
    </View>
  );
};

// ============================================
// MESSAGES DATA
// ============================================
const CONVERSATIONS = [
  {
    id: 1,
    name: 'Mary Smith',
    role: 'POA',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'Thank you for the update!',
    time: '2:30 PM',
    unread: 0,
    online: true,
    isGroup: false,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Supervisor',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    lastMessage: 'Please submit your timesheet',
    time: '1:15 PM',
    unread: 1,
    online: true,
    isGroup: false,
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Weekend Caregiver',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Handoff notes are ready',
    time: 'Yesterday',
    unread: 0,
    online: false,
    isGroup: false,
  },
  {
    id: 4,
    name: 'Care Team Handoff',
    role: '',
    avatar: null,
    lastMessage: 'Weekend schedule updated',
    time: 'Yesterday',
    unread: 2,
    online: false,
    isGroup: true,
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: 'Hi! How is everything going with Dad today?',
    time: '9:30 AM',
    sent: false,
    hasPhoto: false,
  },
  {
    id: 2,
    text: 'Great! He had a wonderful breakfast and we just finished his morning walk.',
    time: '9:32 AM',
    sent: true,
    hasPhoto: false,
  },
  {
    id: 3,
    text: "That's wonderful to hear! Did he take his medication?",
    time: '9:33 AM',
    sent: false,
    hasPhoto: false,
  },
  {
    id: 4,
    text: "Yes, all medications given on time. I've uploaded the photo evidence.",
    time: '9:35 AM',
    sent: true,
    hasPhoto: true,
  },
  {
    id: 5,
    text: 'Thank you for the update!',
    time: '9:36 AM',
    sent: false,
    hasPhoto: false,
  },
];

// ============================================
// MESSAGE STYLES
// ============================================
const msgStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 16,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  
  // Search Bar
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 14,
  },
  searchPlaceholder: { fontSize: 16, color: COLORS.textMuted, marginLeft: 12 },
  
  // Conversation List
  conversationList: { flex: 1 },
  conversationItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
  },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  groupAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#7c3aed', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  conversationInfo: { flex: 1 },
  conversationName: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  conversationPreview: { fontSize: 15, color: COLORS.textSecondary },
  conversationMeta: { alignItems: 'flex-end' },
  conversationTime: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  unreadBadge: { 
    backgroundColor: COLORS.primary, 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  unreadText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  
  // Chat Header
  chatHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  chatHeaderStatus: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  
  // Messages Area
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 20, paddingVertical: 16 },
  
  // Message Bubbles
  messageBubble: { 
    maxWidth: '80%', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginBottom: 12,
  },
  receivedBubble: { 
    backgroundColor: COLORS.card, 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  sentBubble: { 
    backgroundColor: COLORS.primary, 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  messageText: { fontSize: 16, color: COLORS.white, lineHeight: 22 },
  messageTime: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6, alignSelf: 'flex-end' },
  sentMessageTime: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-end', 
    marginTop: 6,
  },
  sentTimeText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginRight: 4 },
  
  // Photo Attachment
  photoAttachment: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 10,
    marginBottom: 10,
  },
  photoAttachmentText: { fontSize: 15, color: COLORS.white, marginLeft: 10 },
  
  // Input Area
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  textInput: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    borderRadius: 24, 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: COLORS.white,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 12,
  },
  textInputActive: { borderColor: COLORS.primary },
  sendBtn: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    backgroundColor: COLORS.card, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: COLORS.primary },
});

// ============================================
// MESSAGE SCREEN
// ============================================
const MessageScreen = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sent: true,
        hasPhoto: false,
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  // Conversation List View
  const renderConversationList = () => (
    <SafeAreaView style={msgStyles.container}>
      {/* Header */}
      <View style={msgStyles.header}>
        <TouchableOpacity style={msgStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={msgStyles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={msgStyles.searchContainer}>
        <View style={msgStyles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <Text style={msgStyles.searchPlaceholder}>Search conversations...</Text>
        </View>
      </View>

      {/* Conversation List */}
      <ScrollView style={msgStyles.conversationList} showsVerticalScrollIndicator={false}>
        {CONVERSATIONS.map((conversation) => (
          <TouchableOpacity 
            key={conversation.id} 
            style={msgStyles.conversationItem}
            onPress={() => setSelectedConversation(conversation)}
          >
            <View style={msgStyles.avatarContainer}>
              {conversation.isGroup ? (
                <View style={msgStyles.groupAvatar}>
                  <Ionicons name="people" size={28} color={COLORS.white} />
                </View>
              ) : (
                <Image source={{ uri: conversation.avatar }} style={msgStyles.avatar} />
              )}
            </View>
            <View style={msgStyles.conversationInfo}>
              <Text style={msgStyles.conversationName}>
                {conversation.name}{conversation.role ? ` (${conversation.role})` : ''}
              </Text>
              <Text style={msgStyles.conversationPreview} numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            </View>
            <View style={msgStyles.conversationMeta}>
              <Text style={msgStyles.conversationTime}>{conversation.time}</Text>
              {conversation.unread > 0 && (
                <View style={msgStyles.unreadBadge}>
                  <Text style={msgStyles.unreadText}>{conversation.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // Chat Detail View
  const renderChatDetail = () => (
    <SafeAreaView style={msgStyles.container}>
      {/* Chat Header */}
      <View style={msgStyles.chatHeader}>
        <TouchableOpacity 
          style={msgStyles.backBtn}
          onPress={() => setSelectedConversation(null)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        {selectedConversation.isGroup ? (
          <View style={[msgStyles.groupAvatar, { width: 48, height: 48, marginRight: 12 }]}>
            <Ionicons name="people" size={24} color={COLORS.white} />
          </View>
        ) : (
          <Image source={{ uri: selectedConversation.avatar }} style={msgStyles.chatAvatar} />
        )}
        <View style={msgStyles.chatHeaderInfo}>
          <Text style={msgStyles.chatHeaderName}>
            {selectedConversation.name}{selectedConversation.role ? ` (${selectedConversation.role})` : ''}
          </Text>
          {selectedConversation.online && (
            <Text style={msgStyles.chatHeaderStatus}>Online</Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={msgStyles.messagesContainer}
          contentContainerStyle={msgStyles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                msgStyles.messageBubble,
                message.sent ? msgStyles.sentBubble : msgStyles.receivedBubble,
              ]}
            >
              {message.hasPhoto && (
                <View style={msgStyles.photoAttachment}>
                  <Ionicons name="image-outline" size={20} color={COLORS.white} />
                  <Text style={msgStyles.photoAttachmentText}>Photo attached</Text>
                </View>
              )}
              <Text style={msgStyles.messageText}>{message.text}</Text>
              {message.sent ? (
                <View style={msgStyles.sentMessageTime}>
                  <Text style={msgStyles.sentTimeText}>{message.time}</Text>
                  <Ionicons name="checkmark-done" size={16} color="rgba(255, 255, 255, 0.7)" />
                </View>
              ) : (
                <Text style={msgStyles.messageTime}>{message.time}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={msgStyles.inputContainer}>
          <TextInput
            style={[
              msgStyles.textInput,
              inputFocused && msgStyles.textInputActive,
            ]}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          <TouchableOpacity 
            style={[
              msgStyles.sendBtn,
              inputText.trim() && msgStyles.sendBtnActive,
            ]}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return selectedConversation ? renderChatDetail() : renderConversationList();
};
// ============================================
// SHIFTS DATA
// ============================================
const SHIFT_HISTORY = [
  {
    id: 1,
    date: 'Dec 15, 2024',
    startTime: '8:00 AM',
    endTime: '4:00 PM',
    tasksCompleted: 12,
    totalTasks: 12,
    status: 'completed',
  },
  {
    id: 2,
    date: 'Dec 14, 2024',
    startTime: '8:00 AM',
    endTime: '4:00 PM',
    tasksCompleted: 10,
    totalTasks: 10,
    status: 'completed',
  },
  {
    id: 3,
    date: 'Dec 13, 2024',
    startTime: '8:00 AM',
    endTime: '12:00 PM',
    tasksCompleted: 5,
    totalTasks: 6,
    status: 'completed',
  },
  {
    id: 4,
    date: 'Dec 12, 2024',
    startTime: '12:00 PM',
    endTime: '8:00 PM',
    tasksCompleted: 8,
    totalTasks: 8,
    status: 'completed',
  },
  {
    id: 5,
    date: 'Dec 11, 2024',
    startTime: '8:00 AM',
    endTime: '4:00 PM',
    tasksCompleted: 0,
    totalTasks: 0,
    status: 'cancelled',
  },
];

// ============================================
// SHIFTS STYLES
// ============================================
const shiftStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  
  // Current Shift Card - Inactive
  shiftCardInactive: { 
    backgroundColor: COLORS.card, 
    borderRadius: 24, 
    padding: 24,
    marginBottom: 20,
  },
  shiftCardActive: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 24, 
    padding: 24,
    marginBottom: 20,
  },
  shiftCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
  },
  shiftCardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  inactiveBadge: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: COLORS.textMuted, 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  inactiveBadgeText: { fontSize: 14, color: COLORS.textMuted },
  activeBadge: { 
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  activeBadgeText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  
  // Active Shift Details
  shiftDetailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12,
  },
  shiftDetailLabel: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' },
  shiftDetailValue: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  
  // Buttons
  startShiftBtn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
  },
  startShiftBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  endShiftBtn: { 
    backgroundColor: COLORS.white, 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    marginTop: 8,
  },
  endShiftBtnText: { fontSize: 18, fontWeight: '600', color: '#ef4444' },
  
  // Quick Actions
  quickActionsCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 24, 
    padding: 24,
  },
  quickActionsTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 20 },
  quickActionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
  },
  quickActionIcon: { fontSize: 24, marginRight: 16 },
  quickActionText: { flex: 1, fontSize: 18, color: COLORS.white },
  
  // Shift History Screen
  historyHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 16,
  },
  historyBackBtn: { marginRight: 16 },
  historyTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  
  // Filter Tabs
  filterContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 16,
  },
  filterTab: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 24, 
    marginRight: 10,
    backgroundColor: COLORS.card,
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: COLORS.white },
  
  // Shift History List
  historyList: { paddingHorizontal: 20 },
  historyCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  historyCardCancelled: { borderColor: COLORS.textMuted },
  historyCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  historyDateRow: { flexDirection: 'row', alignItems: 'center' },
  historyDate: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 8 },
  completedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(34, 197, 94, 0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  completedBadgeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginLeft: 4 },
  cancelledBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
  },
  cancelledBadgeText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 4 },
  historyDetailsRow: { flexDirection: 'row', alignItems: 'center' },
  historyTime: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 20,
  },
  historyTimeText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 6 },
  historyTasks: { flexDirection: 'row', alignItems: 'center' },
  historyTasksText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 6 },
});

// ============================================
// SHIFTS SCREEN
// ============================================
const ShiftsScreen = () => {
  const sharedData = React.useContext(SharedDataContext);
  const [showClientList, setShowClientList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  const getFilteredHistory = () => {
    if (historyFilter === 'all') return SHIFT_HISTORY;
    return SHIFT_HISTORY.filter(shift => shift.status === historyFilter);
  };

  // Shift History View
  const renderShiftHistory = () => (
    <SafeAreaView style={shiftStyles.container}>
      {/* Header */}
      <View style={shiftStyles.historyHeader}>
        <TouchableOpacity 
          style={shiftStyles.historyBackBtn}
          onPress={() => setShowHistory(false)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={shiftStyles.historyTitle}>Shift History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={shiftStyles.filterContainer}>
        {['all', 'completed', 'cancelled'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              shiftStyles.filterTab,
              historyFilter === filter && shiftStyles.filterTabActive,
            ]}
            onPress={() => setHistoryFilter(filter)}
          >
            <Text style={[
              shiftStyles.filterTabText,
              historyFilter === filter && shiftStyles.filterTabTextActive,
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History List */}
      <ScrollView style={shiftStyles.historyList} showsVerticalScrollIndicator={false}>
        {getFilteredHistory().map((shift) => (
          <View 
            key={shift.id} 
            style={[
              shiftStyles.historyCard,
              shift.status === 'cancelled' && shiftStyles.historyCardCancelled,
            ]}
          >
            <View style={shiftStyles.historyCardHeader}>
              <View style={shiftStyles.historyDateRow}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
                <Text style={shiftStyles.historyDate}>{shift.date}</Text>
              </View>
              {shift.status === 'completed' ? (
                <View style={shiftStyles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={shiftStyles.completedBadgeText}>Completed</Text>
                </View>
              ) : (
                <View style={shiftStyles.cancelledBadge}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                  <Text style={shiftStyles.cancelledBadgeText}>Cancelled</Text>
                </View>
              )}
            </View>
            <View style={shiftStyles.historyDetailsRow}>
              <View style={shiftStyles.historyTime}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={shiftStyles.historyTimeText}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
              {shift.status === 'completed' && (
                <View style={shiftStyles.historyTasks}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={shiftStyles.historyTasksText}>
                    {shift.tasksCompleted}/{shift.totalTasks} tasks
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // Main Shifts View
  const renderMainView = () => (
    <SafeAreaView style={shiftStyles.container}>
      <ScrollView contentContainerStyle={shiftStyles.scrollContent}>
        {/* Shift Status Card */}
        <View style={[newFeatureStyles.clockCard, { marginHorizontal: 0, marginTop: 0 }]}>
          <View style={newFeatureStyles.clockHeader}>
            <Text style={newFeatureStyles.clockTitle}>Shift Status</Text>
            <View style={newFeatureStyles.clockStatus}>
              <View style={[newFeatureStyles.clockStatusDot, { backgroundColor: sharedData?.shiftData?.isClockedIn ? COLORS.primary : '#ef4444' }]} />
              <Text style={newFeatureStyles.clockStatusText}>
                {sharedData?.shiftData?.isClockedIn ? 'On Shift' : 'Off Shift'}
              </Text>
            </View>
          </View>
          <View style={newFeatureStyles.clockTimeRow}>
            <View style={newFeatureStyles.clockTimeItem}>
              <Text style={newFeatureStyles.clockTimeLabel}>Clock In</Text>
              <Text style={newFeatureStyles.clockTimeValue}>{sharedData?.shiftData?.clockInTime || '--:--'}</Text>
            </View>
            <View style={newFeatureStyles.clockTimeItem}>
              <Text style={newFeatureStyles.clockTimeLabel}>Clock Out</Text>
              <Text style={newFeatureStyles.clockTimeValue}>{sharedData?.shiftData?.clockOutTime || '--:--'}</Text>
            </View>
            <View style={newFeatureStyles.clockTimeItem}>
              <Text style={newFeatureStyles.clockTimeLabel}>Weekly Hours</Text>
              <Text style={newFeatureStyles.clockTimeValue}>{sharedData?.shiftData?.weeklyHours || 0}h</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[newFeatureStyles.clockBtn, sharedData?.shiftData?.isClockedIn ? newFeatureStyles.clockBtnOut : newFeatureStyles.clockBtnIn]}
            onPress={() => {
              if (sharedData?.shiftData?.isClockedIn) {
                sharedData.clockOut();
                Alert.alert('Clocked Out', 'You have successfully clocked out.');
              } else {
                sharedData.clockIn({ lat: 40.7128, lng: -74.0060 });
                Alert.alert('Clocked In', 'You have successfully clocked in. GPS location verified.');
              }
            }}
          >
            <Text style={newFeatureStyles.clockBtnText}>
              {sharedData?.shiftData?.isClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          </TouchableOpacity>
          <View style={newFeatureStyles.clockGpsRow}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={newFeatureStyles.clockGpsText}>GPS verification enabled</Text>
          </View>
        </View>

        {/* Active Client Selector */}
        <TouchableOpacity style={[newFeatureStyles.clientSelector, { marginHorizontal: 0, marginTop: 16 }]} onPress={() => setShowClientList(true)}>
          <View style={newFeatureStyles.clientSelectorHeader}>
            <View>
              <Text style={newFeatureStyles.clientSelectorTitle}>ACTIVE CLIENT</Text>
              <Text style={newFeatureStyles.clientSelectorName}>{sharedData?.clients?.find(c => c.id === sharedData?.activeClientId)?.name || PATIENT.name}</Text>
            </View>
            <View style={newFeatureStyles.clientSelectorChevron}>
              <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={[shiftStyles.quickActionsCard, { marginTop: 16 }]}>
          <Text style={shiftStyles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={shiftStyles.quickActionItem}>
            <Text style={shiftStyles.quickActionIcon}>💰</Text>
            <Text style={shiftStyles.quickActionText}>View Earnings</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={shiftStyles.quickActionItem}
            onPress={() => setShowHistory(true)}
          >
            <Text style={shiftStyles.quickActionIcon}>📋</Text>
            <Text style={shiftStyles.quickActionText}>Shift History</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Client List Modal */}
      <Modal visible={showClientList} animationType="slide" transparent>
        <View style={newFeatureStyles.clientListModal}>
          <SafeAreaView style={newFeatureStyles.clientListContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={newFeatureStyles.clientListTitle}>Your Clients</Text>
              <TouchableOpacity onPress={() => setShowClientList(false)}>
                <Ionicons name="close" size={28} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(sharedData?.clients || []).map((client) => (
                <TouchableOpacity 
                  key={client.id}
                  style={[
                    newFeatureStyles.clientCard,
                    client.id === sharedData?.activeClientId && newFeatureStyles.clientCardActive
                  ]}
                  onPress={() => {
                    sharedData?.setActiveClientId(client.id);
                    setShowClientList(false);
                  }}
                >
                  <View style={newFeatureStyles.clientAvatar}>
                    <Ionicons name="person" size={28} color={COLORS.textSecondary} />
                  </View>
                  <View style={newFeatureStyles.clientInfo}>
                    <Text style={newFeatureStyles.clientName}>{client.name}</Text>
                    <Text style={newFeatureStyles.clientCondition}>{client.condition}</Text>
                    <View style={newFeatureStyles.clientTasksRow}>
                      <Text style={newFeatureStyles.clientTasksText}>
                        {client.tasksCompleted}/{client.tasksToday} tasks today
                      </Text>
                      <View style={[
                        newFeatureStyles.clientRiskBadge,
                        client.riskLevel === 'low' && newFeatureStyles.clientRiskLow,
                        client.riskLevel === 'moderate' && newFeatureStyles.clientRiskModerate,
                        client.riskLevel === 'high' && newFeatureStyles.clientRiskHigh,
                      ]}>
                        <Text style={[
                          newFeatureStyles.clientRiskText,
                          { color: client.riskLevel === 'low' ? '#22c55e' : client.riskLevel === 'moderate' ? '#eab308' : '#ef4444' }
                        ]}>
                          {client.riskLevel.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {client.id === sharedData?.activeClientId && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );

  return showHistory ? renderShiftHistory() : renderMainView();
};
// ============================================
// MENU DATA
// ============================================
const CAREGIVER_PROFILE = {
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  email: 'julia.martinez@careagency.com',
  phone: '(555) 567-8901',
  rating: 4.9,
  years: 5,
  shifts: 234,
  certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
};

const FAQ_ITEMS = [
  'How do I complete a task?',
  'How do I report an incident?',
  'How do I update patient vitals?',
  'How do I contact family members?',
  'How do I end my shift?',
];

// ============================================
// MENU STYLES
// ============================================
const menuStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  
  // Profile Card (Main Menu)
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 16,
    marginBottom: 16,
  },
  profileAvatar: { width: 70, height: 70, borderRadius: 12, marginRight: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  profileRole: { fontSize: 15, color: COLORS.textSecondary },
  
  // Menu Items
  menuCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 6,
    marginBottom: 16,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  menuIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: { flex: 1, fontSize: 18, color: COLORS.white },
  
  // Sign Out Card
  signOutCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(239, 68, 68, 0.15)', 
    borderRadius: 20, 
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  signOutText: { fontSize: 18, color: '#ef4444' },
  
  // Profile Screen
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 16,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  
  profileAvatarLarge: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: COLORS.textMuted,
  },
  cameraBtn: { 
    position: 'absolute', 
    bottom: 0, 
    right: '50%', 
    marginRight: -70,
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  profileNameLarge: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginTop: 16 },
  profileRoleLarge: { fontSize: 17, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  
  // Stats Row
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statCard: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginTop: 8 },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  // Contact Info Card
  contactCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 16 },
  contactLabel: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 },
  contactValue: { fontSize: 17, color: COLORS.white, marginBottom: 16 },
  
  // Certifications
  certCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  certTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 16 },
  certBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  certBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(34, 197, 94, 0.15)', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 20,
  },
  certBadgeText: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginLeft: 6 },
  
  // Settings Screen
  settingsCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  settingsItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  settingsItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  settingsIconBg: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsText: { flex: 1, fontSize: 17, color: COLORS.white },
  settingsValue: { fontSize: 15, color: COLORS.textSecondary, marginRight: 8 },
  toggleTrack: { 
    width: 52, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackOn: { backgroundColor: COLORS.primary },
  toggleTrackOff: { backgroundColor: COLORS.textMuted },
  toggleThumb: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: COLORS.white,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleThumbOff: { alignSelf: 'flex-start' },
  
  appVersion: { textAlign: 'center', fontSize: 15, color: COLORS.textSecondary, marginTop: 30 },
  appCopyright: { textAlign: 'center', fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  
  // Support Screen
  sectionLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: COLORS.textSecondary, 
    letterSpacing: 1, 
    marginBottom: 12,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  supportCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  supportIconBg: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 14,
  },
  supportInfo: { flex: 1 },
  supportTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  supportSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  supportAction: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  
  faqCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  faqItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  faqText: { flex: 1, fontSize: 16, color: COLORS.white },
  
  resourceCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  resourceText: { flex: 1, fontSize: 17, color: COLORS.white, marginLeft: 14 },
});

// ============================================
// MENU SCREEN
// ============================================
const MenuScreen = () => {
  const sharedData = React.useContext(SharedDataContext);
  const [currentView, setCurrentView] = useState('menu');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showMedications, setShowMedications] = useState(false);
  const signOut = React.useContext(SignOutContext);

  // Medication Screen
  if (showMedications) {
    const medications = sharedData?.carePlan?.medications || [];
    const givenToday = sharedData?.medicationLogs?.length || 0;
    
    const handleGiveMedication = (med) => {
      if (sharedData) {
        sharedData.addMedicationLog({
          name: med.name,
          dosage: med.dosage,
          scheduledTime: med.time,
          status: 'administered',
          notes: '',
        });
      }
      Alert.alert('Medication Logged', `${med.name} has been logged as administered.`);
    };
    
    return (
      <SafeAreaView style={newFeatureStyles.medContainer}>
        <ScrollView contentContainerStyle={newFeatureStyles.medScrollContent}>
          {/* Back Button */}
          <TouchableOpacity style={familyStyles.detailBackBtn} onPress={() => setShowMedications(false)}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
            <Text style={familyStyles.detailBackText}>Back</Text>
          </TouchableOpacity>
          
          {/* Header */}
          <View style={newFeatureStyles.medHeader}>
            <Text style={newFeatureStyles.medTitle}>Medications</Text>
            <Text style={newFeatureStyles.medSubtitle}>For {PATIENT.name}</Text>
          </View>
          
          {/* Summary Card */}
          <View style={newFeatureStyles.medSummaryCard}>
            <View style={newFeatureStyles.medSummaryRow}>
              <View style={newFeatureStyles.medSummaryStat}>
                <Text style={newFeatureStyles.medSummaryValue}>{medications.length}</Text>
                <Text style={newFeatureStyles.medSummaryLabel}>Total Meds</Text>
              </View>
              <View style={newFeatureStyles.medSummaryStat}>
                <Text style={newFeatureStyles.medSummaryValueGreen}>{givenToday}</Text>
                <Text style={newFeatureStyles.medSummaryLabel}>Given Today</Text>
              </View>
              <View style={newFeatureStyles.medSummaryStat}>
                <Text style={newFeatureStyles.medSummaryValue}>{medications.length - givenToday}</Text>
                <Text style={newFeatureStyles.medSummaryLabel}>Remaining</Text>
              </View>
            </View>
          </View>
          
          {/* Medication Schedule Header */}
          <View style={newFeatureStyles.medScheduleHeader}>
            <Ionicons name="medical" size={20} color={COLORS.primary} />
            <Text style={newFeatureStyles.medScheduleTitle}>Today's Schedule</Text>
          </View>
          
          {/* Medication Cards */}
          {medications.map((med, idx) => {
            const isGiven = sharedData?.medicationLogs?.some(log => log.medicationName === med.name);
            
            return (
              <View key={idx} style={newFeatureStyles.medCard}>
                <View style={newFeatureStyles.medCardHeader}>
                  <View style={newFeatureStyles.medCardLeft}>
                    <View style={newFeatureStyles.medIconBg}>
                      <Ionicons name="medical" size={24} color="#3b82f6" />
                    </View>
                    <View style={newFeatureStyles.medCardInfo}>
                      <Text style={newFeatureStyles.medCardName}>{med.name}</Text>
                      <Text style={newFeatureStyles.medCardDosage}>{med.dosage} - {med.frequency}</Text>
                      <View style={newFeatureStyles.medCardTime}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                        <Text style={newFeatureStyles.medCardTimeText}>{med.time}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[
                    newFeatureStyles.medCardStatus,
                    isGiven ? newFeatureStyles.medStatusGiven : newFeatureStyles.medStatusPending
                  ]}>
                    <Text style={[
                      newFeatureStyles.medStatusText,
                      { color: isGiven ? '#22c55e' : '#eab308' }
                    ]}>
                      {isGiven ? 'Given' : 'Pending'}
                    </Text>
                  </View>
                </View>
                
                {!isGiven && (
                  <TouchableOpacity 
                    style={newFeatureStyles.medGiveBtn}
                    onPress={() => handleGiveMedication(med)}
                  >
                    <Text style={newFeatureStyles.medGiveBtnText}>Mark as Administered</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Custom Toggle Component
  const Toggle = ({ value, onToggle }) => (
    <TouchableOpacity 
      style={[menuStyles.toggleTrack, value ? menuStyles.toggleTrackOn : menuStyles.toggleTrackOff]}
      onPress={onToggle}
    >
      <View style={[menuStyles.toggleThumb, value ? menuStyles.toggleThumbOn : menuStyles.toggleThumbOff]} />
    </TouchableOpacity>
  );

  // Main Menu View
  const renderMainMenu = () => (
    <SafeAreaView style={menuStyles.container}>
      <ScrollView contentContainerStyle={menuStyles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity 
          style={menuStyles.profileCard}
          onPress={() => setCurrentView('profile')}
        >
          <Image source={{ uri: CAREGIVER_PROFILE.avatar }} style={menuStyles.profileAvatar} />
          <View style={menuStyles.profileInfo}>
            <Text style={menuStyles.profileName}>{CAREGIVER_PROFILE.name}</Text>
            <Text style={menuStyles.profileRole}>{CAREGIVER_PROFILE.role}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={menuStyles.menuCard}>
          <TouchableOpacity style={menuStyles.menuItem} onPress={() => setShowMedications(true)}>
            <View style={[menuStyles.menuIconBg, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="medical" size={24} color={COLORS.white} />
            </View>
            <Text style={menuStyles.menuText}>Medications</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={menuStyles.menuCard}>
          <TouchableOpacity style={menuStyles.menuItem}>
            <View style={menuStyles.menuIconBg}>
              <Ionicons name="trending-up" size={24} color={COLORS.white} />
            </View>
            <Text style={menuStyles.menuText}>Earnings</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={menuStyles.menuCard}>
          <TouchableOpacity style={menuStyles.menuItem}>
            <View style={menuStyles.menuIconBg}>
              <Ionicons name="time-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={menuStyles.menuText}>Shift History</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={menuStyles.menuCard}>
          <TouchableOpacity 
            style={menuStyles.menuItem}
            onPress={() => setCurrentView('settings')}
          >
            <View style={menuStyles.menuIconBg}>
              <Ionicons name="settings-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={menuStyles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={menuStyles.menuCard}>
          <TouchableOpacity 
            style={menuStyles.menuItem}
            onPress={() => setCurrentView('support')}
          >
            <View style={menuStyles.menuIconBg}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={menuStyles.menuText}>Support</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={menuStyles.signOutCard} onPress={signOut}>
          <View style={menuStyles.signOutIconBg}>
            <Ionicons name="person-outline" size={24} color="#ef4444" />
          </View>
          <Text style={menuStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // Profile View
  const renderProfile = () => (
    <SafeAreaView style={menuStyles.container}>
      {/* Header */}
      <View style={menuStyles.profileHeader}>
        <TouchableOpacity 
          style={menuStyles.backBtn}
          onPress={() => setCurrentView('menu')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={menuStyles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: CAREGIVER_PROFILE.avatar }} style={menuStyles.profileAvatarLarge} />
            <TouchableOpacity style={menuStyles.cameraBtn}>
              <Ionicons name="camera" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={menuStyles.profileNameLarge}>{CAREGIVER_PROFILE.name}</Text>
        <Text style={menuStyles.profileRoleLarge}>{CAREGIVER_PROFILE.role}</Text>

        {/* Stats Row */}
        <View style={menuStyles.statsRow}>
          <View style={menuStyles.statCard}>
            <Ionicons name="star" size={24} color="#eab308" />
            <Text style={menuStyles.statValue}>{CAREGIVER_PROFILE.rating}</Text>
            <Text style={menuStyles.statLabel}>Rating</Text>
          </View>
          <View style={menuStyles.statCard}>
            <Ionicons name="ribbon" size={24} color="#3b82f6" />
            <Text style={menuStyles.statValue}>{CAREGIVER_PROFILE.years}</Text>
            <Text style={menuStyles.statLabel}>Years</Text>
          </View>
          <View style={menuStyles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            <Text style={menuStyles.statValue}>{CAREGIVER_PROFILE.shifts}</Text>
            <Text style={menuStyles.statLabel}>Shifts</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={menuStyles.contactCard}>
          <Text style={menuStyles.contactTitle}>Contact Information</Text>
          <Text style={menuStyles.contactLabel}>EMAIL</Text>
          <Text style={menuStyles.contactValue}>{CAREGIVER_PROFILE.email}</Text>
          <Text style={menuStyles.contactLabel}>PHONE</Text>
          <Text style={[menuStyles.contactValue, { marginBottom: 0 }]}>{CAREGIVER_PROFILE.phone}</Text>
        </View>

        {/* Certifications */}
        <View style={menuStyles.certCard}>
          <Text style={menuStyles.certTitle}>Certifications</Text>
          <View style={menuStyles.certBadgesRow}>
            {CAREGIVER_PROFILE.certifications.map((cert, index) => (
              <View key={index} style={menuStyles.certBadge}>
                <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                <Text style={menuStyles.certBadgeText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Settings View
  const renderSettings = () => (
    <SafeAreaView style={menuStyles.container}>
      {/* Header */}
      <View style={menuStyles.profileHeader}>
        <TouchableOpacity 
          style={menuStyles.backBtn}
          onPress={() => setCurrentView('menu')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={menuStyles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Toggles Card */}
        <View style={menuStyles.settingsCard}>
          <View style={[menuStyles.settingsItem, menuStyles.settingsItemBorder]}>
            <View style={menuStyles.settingsIconBg}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={menuStyles.settingsText}>Push Notifications</Text>
            <Toggle value={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
          </View>
          <View style={menuStyles.settingsItem}>
            <View style={menuStyles.settingsIconBg}>
              <Ionicons name="moon-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={menuStyles.settingsText}>Dark Mode</Text>
            <Toggle value={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </View>
        </View>

        {/* Options Card */}
        <View style={menuStyles.settingsCard}>
          <TouchableOpacity style={[menuStyles.settingsItem, menuStyles.settingsItemBorder]}>
            <View style={menuStyles.settingsIconBg}>
              <Ionicons name="shield-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={menuStyles.settingsText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[menuStyles.settingsItem, menuStyles.settingsItemBorder]}>
            <View style={menuStyles.settingsIconBg}>
              <Ionicons name="globe-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={menuStyles.settingsText}>Language</Text>
            <Text style={menuStyles.settingsValue}>English</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={menuStyles.settingsItem}
            onPress={() => setCurrentView('support')}
          >
            <View style={menuStyles.settingsIconBg}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={menuStyles.settingsText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={menuStyles.appVersion}>ADLTrack v1.0.0</Text>
        <Text style={menuStyles.appCopyright}>© 2026 ADLTrack Inc.</Text>
      </ScrollView>
    </SafeAreaView>
  );

  // Support View
  const renderSupport = () => (
    <SafeAreaView style={menuStyles.container}>
      {/* Header */}
      <View style={menuStyles.profileHeader}>
        <TouchableOpacity 
          style={menuStyles.backBtn}
          onPress={() => setCurrentView('menu')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={menuStyles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Us */}
        <Text style={menuStyles.sectionLabel}>CONTACT US</Text>
        
        <View style={menuStyles.supportCard}>
          <View style={menuStyles.supportIconBg}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.white} />
          </View>
          <View style={menuStyles.supportInfo}>
            <Text style={menuStyles.supportTitle}>Live Chat</Text>
            <Text style={menuStyles.supportSubtitle}>Chat with our support team</Text>
          </View>
          <Text style={menuStyles.supportAction}>Start Chat</Text>
        </View>

        <View style={menuStyles.supportCard}>
          <View style={menuStyles.supportIconBg}>
            <Ionicons name="call-outline" size={22} color={COLORS.white} />
          </View>
          <View style={menuStyles.supportInfo}>
            <Text style={menuStyles.supportTitle}>Call Support</Text>
            <Text style={menuStyles.supportSubtitle}>1-888-555-0123</Text>
          </View>
          <Text style={menuStyles.supportAction}>Call Now</Text>
        </View>

        <View style={menuStyles.supportCard}>
          <View style={menuStyles.supportIconBg}>
            <Ionicons name="mail-outline" size={22} color={COLORS.white} />
          </View>
          <View style={menuStyles.supportInfo}>
            <Text style={menuStyles.supportTitle}>Email Support</Text>
            <Text style={menuStyles.supportSubtitle}>support@adltrack.com</Text>
          </View>
          <Text style={menuStyles.supportAction}>Send Email</Text>
        </View>

        {/* FAQ */}
        <Text style={menuStyles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        
        <View style={menuStyles.faqCard}>
          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                menuStyles.faqItem, 
                index < FAQ_ITEMS.length - 1 && menuStyles.faqItemBorder
              ]}
            >
              <Text style={menuStyles.faqText}>{item}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Resources */}
        <Text style={menuStyles.sectionLabel}>RESOURCES</Text>
        
        <TouchableOpacity style={menuStyles.resourceCard}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.textSecondary} />
          <Text style={menuStyles.resourceText}>User Guide</Text>
          <Ionicons name="open-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={menuStyles.resourceCard}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.textSecondary} />
          <Text style={menuStyles.resourceText}>Privacy Policy</Text>
          <Ionicons name="open-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={menuStyles.resourceCard}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.textSecondary} />
          <Text style={menuStyles.resourceText}>Terms of Service</Text>
          <Ionicons name="open-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // Render based on current view
  switch (currentView) {
    case 'profile':
      return renderProfile();
    case 'settings':
      return renderSettings();
    case 'support':
      return renderSupport();
    default:
      return renderMainMenu();
  }
};

const ShiftsTabIcon = ({ focused, color }) => (
  <View style={styles.shiftsIconContainer}>
    <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
    <View style={styles.shiftsDot} />
  </View>
);

// ============================================
// CAREGIVER REQUESTS TAB ICON WITH BADGE
// ============================================
const CaregiverRequestsTabIcon = ({ focused, color }) => {
  const sharedData = React.useContext(SharedDataContext);
  const pendingCount = sharedData?.getPendingRequestsCount() || 0;
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={focused ? "list" : "list-outline"} size={24} color={color} />
      {pendingCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -6,
          right: -10,
          backgroundColor: '#ef4444',
          borderRadius: 10,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{pendingCount}</Text>
        </View>
      )}
    </View>
  );
};

const CaregiverTabs = ({ onSignOut }) => (
  <SignOutContext.Provider value={onSignOut}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen name="Home" component={CaregiverHomeScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} /> }} />
      <Tab.Screen name="Incident" component={IncidentScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "warning" : "warning-outline"} size={24} color={color} /> }} />
      <Tab.Screen name="Message" component={MessageScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} /> }} />
      <Tab.Screen name="Shifts" component={ShiftsScreen}
        options={{ tabBarIcon: ({ focused, color }) => <ShiftsTabIcon focused={focused} color={color} /> }} />
      <Tab.Screen name="Menu" component={MenuScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} /> }} />
    </Tab.Navigator>
  </SignOutContext.Provider>
);

// ============================================
// FAMILY MEMBER DATA
// ============================================
const FAMILY_MEMBER = {
  name: 'Mary Smith',
  role: 'Family Guardian',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  email: 'mary.smith@email.com',
  phone: '(555) 234-5678',
};

const FAMILY_CONVERSATIONS = [
  {
    id: 1,
    name: 'Family Group',
    role: '',
    avatar: null,
    lastMessage: 'Can someone cover Sunday?',
    time: '10:30 AM',
    unread: 3,
    online: false,
    isGroup: true,
  },
  {
    id: 2,
    name: 'Julia Martinez',
    role: 'Caregiver',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMessage: 'David had a great morning!',
    time: '9:32 AM',
    unread: 0,
    online: true,
    isGroup: false,
  },
  {
    id: 3,
    name: 'Tom Smith',
    role: 'Brother',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    lastMessage: "I'll bring the puzzle",
    time: 'Yesterday',
    unread: 0,
    online: false,
    isGroup: false,
  },
];

const FAMILY_ALERTS = {
  upcoming: [
    { id: 1, title: 'Physical Therapy', time: '10:00 AM Tomorrow', icon: 'pulse', iconBg: '#1e3a5f' },
    { id: 2, title: 'Doctor Visit', time: 'Dec 20, 2:30 PM', icon: 'calendar', iconBg: '#1e3a5f' },
    { id: 3, title: 'Medication Refill Due', time: 'Dec 22', icon: 'bandage', iconBg: '#1e3a5f' },
  ],
  recent: [
    { id: 1, title: 'Care Plan Updated', subtitle: 'New evening routine added', time: '2 hours ago', highlight: false },
    { id: 2, title: 'Medication Schedule Change', subtitle: 'Evening meds moved to 6 PM', time: 'Yesterday', highlight: true },
    { id: 3, title: 'Caregiver Assignment', subtitle: 'Julia will cover weekend shifts', time: '2 days ago', highlight: false },
  ],
};

// ============================================
// CARE TIMELINE DATA
// ============================================
const CAREGIVER_JULIA = {
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  verified: true,
};

const CARE_TIMELINE_ITEMS = [
  {
    id: 1,
    title: 'Morning Medication',
    completedAt: '11:10 AM',
    description: 'Administer prescribed medications with breakfast',
    note: 'Patient took all medications without issue',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    caregiver: CAREGIVER_JULIA,
  },
  {
    id: 2,
    title: 'Breakfast Assistance',
    completedAt: '11:11 AM',
    description: 'Assist patient with breakfast meal',
    note: 'Patient had oatmeal and fruit. Good appetite today.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    caregiver: CAREGIVER_JULIA,
  },
  {
    id: 3,
    title: 'Lunch Preparation',
    completedAt: '11:12 AM',
    description: 'Prepare and serve balanced lunch',
    note: 'Patient just ate',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    caregiver: CAREGIVER_JULIA,
  },
  {
    id: 4,
    title: 'Afternoon Medication',
    completedAt: '11:13 AM',
    description: 'Give afternoon dose of Lisinopril with lunch',
    note: 'Patient is asleep',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
    caregiver: CAREGIVER_JULIA,
  },
  {
    id: 5,
    title: 'Rest Period',
    completedAt: '11:13 AM',
    description: 'Ensure patient rests comfortably',
    note: 'Patient resting peacefully',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
    caregiver: CAREGIVER_JULIA,
  },
  {
    id: 6,
    title: 'Physical Therapy Exercises',
    completedAt: '11:13 AM',
    description: 'Guide through prescribed exercises',
    note: 'Completed all exercises successfully',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    caregiver: CAREGIVER_JULIA,
  },
];

// ============================================
// FAMILY INCIDENT REPORTS DATA
// ============================================
const FAMILY_INCIDENTS = [
  {
    id: 1,
    title: 'Behavioral Change',
    type: 'behavioral',
    severity: 'critical',
    status: 'open',
    description: 'The patient refused food',
    actionsTaken: 'I tried but to no avail',
    dateTime: 'Feb 8, 2026 at 12:02 PM',
    reporter: CAREGIVER_JULIA,
    photos: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
      'https://images.unsplash.com/photo-1568702846914-96b305d2uj40?w=400',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400',
      'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
    ],
  },
  {
    id: 2,
    title: 'Fall',
    type: 'fall',
    severity: 'high',
    status: 'open',
    description: 'The patient fell in the siting room',
    actionsTaken: 'I picked him up and. Called 911',
    dateTime: 'Feb 8, 2026 at 12:00 PM',
    reporter: CAREGIVER_JULIA,
    photos: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
      'https://images.unsplash.com/photo-1568702846914-96b305d2uj40?w=400',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400',
      'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400',
    ],
  },
];

// ============================================
// FAMILY STYLES
// ============================================
const familyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30 },
  
  // Header
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  
  // Vitals Row
  vitalsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  vitalCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' },
  vitalIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  vitalValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  vitalLabel: { fontSize: 13, color: COLORS.textSecondary },
  
  // Progress Section
  progressSection: { marginHorizontal: 16, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  progressCount: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  progressBar: { height: 8, backgroundColor: COLORS.card, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  
  // Tabs
  tabsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 28 },
  tabBtn: { marginRight: 24 },
  tabText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  tabDivider: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder, marginRight: 16 },
  
  // Empty State
  emptyCard: { backgroundColor: COLORS.card, borderRadius: 24, marginHorizontal: 16, marginTop: 20, paddingVertical: 60, alignItems: 'center' },
  emptyIconBg: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  
  // Alerts
  sectionLabel: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionIcon: { marginRight: 8 },
  sectionText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1 },
  
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginBottom: 12, padding: 16 },
  alertIconBg: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  alertTime: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  recentAlertCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: 'transparent' },
  recentAlertHighlight: { borderColor: '#92400e', backgroundColor: 'rgba(146, 64, 14, 0.2)' },
  recentAlertTitle: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  recentAlertSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 },
  recentAlertTime: { fontSize: 13, color: COLORS.textMuted },
  
  // Menu
  menuScrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  menuAvatar: { width: 70, height: 70, borderRadius: 12, marginRight: 14 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 20, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  menuRole: { fontSize: 15, color: COLORS.textSecondary },
  
  menuIconBg: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuText: { flex: 1, fontSize: 18, color: COLORS.white },
  
  signOutCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 20, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  signOutIconBg: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(239, 68, 68, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  signOutText: { fontSize: 18, color: '#ef4444' },
  
  // Profile
  profileAvatar: { width: 140, height: 140, borderRadius: 70, alignSelf: 'center', borderWidth: 3, borderColor: COLORS.textMuted },
  profileCameraBtn: { position: 'absolute', bottom: 0, right: '50%', marginRight: -70, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginTop: 16 },
  profileRole: { fontSize: 17, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 30 },
  contactCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, padding: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 16 },
  contactLabel: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 4 },
  contactValue: { fontSize: 17, color: COLORS.white, marginBottom: 16 },
  
  // Care Timeline Styles
  timelineContainer: { marginTop: 16, paddingHorizontal: 16 },
  timelineCard: { backgroundColor: COLORS.card, borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  timelineImage: { width: '100%', height: 180, backgroundColor: COLORS.cardBorder },
  timelineImageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', padding: 16, justifyContent: 'flex-end' },
  timelineTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  timelineTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timelineTimeText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginLeft: 6 },
  timelineNoteSection: { padding: 16 },
  timelineNoteText: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginBottom: 12 },
  timelineCaregiverRow: { flexDirection: 'row', alignItems: 'center' },
  timelineCaregiverAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  timelineCaregiverInfo: { flex: 1 },
  timelineCaregiverName: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  timelineCaregiverRole: { fontSize: 14, color: COLORS.textSecondary },
  timelineDetailBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  
  // Timeline Detail Modal Styles
  detailModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  detailModalContent: { flex: 1 },
  detailModalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
  detailModalHeaderInfo: { flex: 1, marginLeft: 12 },
  detailModalCaregiverAvatar: { width: 48, height: 48, borderRadius: 24 },
  detailModalCaregiverName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  detailModalCaregiverRole: { fontSize: 14, color: COLORS.textSecondary },
  detailModalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  detailModalTitleSection: { paddingHorizontal: 16, paddingBottom: 16 },
  detailModalTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  detailModalTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  detailModalTimeText: { fontSize: 15, color: COLORS.textSecondary, marginLeft: 6 },
  detailModalImage: { width: SCREEN_WIDTH - 32, height: 280, borderRadius: 16, alignSelf: 'center', backgroundColor: COLORS.cardBorder },
  detailModalDescSection: { padding: 16, marginTop: 8 },
  detailModalDescLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 },
  detailModalDescText: { fontSize: 18, fontWeight: '500', color: COLORS.white },
  detailModalDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16, marginVertical: 16 },
  detailModalCaregiverSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  detailModalCaregiverAvatarLg: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  detailModalCaregiverInfoLg: { flex: 1 },
  detailModalCaregiverNameLg: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  detailModalCaregiverRoleLg: { fontSize: 15, color: COLORS.textSecondary },
  detailModalVerifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  detailModalVerifiedText: { fontSize: 14, color: COLORS.primary, marginLeft: 4 },
  
  // Family Incident Report Styles
  incidentContainer: { flex: 1, backgroundColor: COLORS.background },
  incidentScrollContent: { paddingBottom: 30 },
  incidentHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  incidentTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  incidentSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  
  // Summary Card
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, marginTop: 20, padding: 20 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  summaryPeriod: { fontSize: 14, color: COLORS.textSecondary },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  summaryStatValueGreen: { fontSize: 28, fontWeight: 'bold', color: '#22c55e' },
  summaryStatValueRed: { fontSize: 28, fontWeight: 'bold', color: '#ef4444' },
  summaryStatLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  // Recent Incidents Section
  recentHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 28, marginBottom: 16 },
  recentIcon: { marginRight: 10 },
  recentTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  
  // Incident Card
  incidentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginBottom: 12, padding: 16 },
  incidentIconBg: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  incidentInfo: { flex: 1 },
  incidentCardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  incidentCardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginRight: 8 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  severityBadgeCritical: { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
  severityBadgeHigh: { backgroundColor: 'rgba(234, 179, 8, 0.25)' },
  severityBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  severityTextCritical: { color: '#ef4444' },
  severityTextHigh: { color: '#eab308' },
  incidentCardDesc: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 },
  incidentCardTime: { fontSize: 13, color: COLORS.textMuted },
  
  // Incident Detail Screen
  detailBackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  detailBackText: { fontSize: 17, color: COLORS.textSecondary, marginLeft: 6 },
  detailHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  detailIconBg: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  detailTitleSection: {},
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  detailDateTime: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  
  // Severity/Status Badges Row
  badgesRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 10 },
  statusBadgeCritical: { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
  statusBadgeHigh: { backgroundColor: 'rgba(234, 179, 8, 0.25)' },
  statusBadgeOpen: { backgroundColor: 'rgba(101, 84, 35, 0.8)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  statusBadgeText: { fontSize: 15, fontWeight: '600' },
  statusTextCritical: { color: '#f87171' },
  statusTextHigh: { color: '#f59e0b' },
  statusTextOpen: { color: '#eab308' },
  
  // Detail Cards
  detailCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginTop: 20, padding: 16 },
  detailCardLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 8 },
  detailCardText: { fontSize: 17, color: COLORS.white, lineHeight: 24 },
  
  // Evidence Photos Section
  evidenceCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginTop: 20, padding: 16 },
  evidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  evidenceTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1 },
  evidenceTapView: { flexDirection: 'row', alignItems: 'center' },
  evidenceTapIcon: { marginRight: 6 },
  evidenceTapText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  evidencePhotoWrapper: { width: '48%', aspectRatio: 1, borderRadius: 12, marginBottom: 10, position: 'relative', overflow: 'hidden' },
  evidencePhotoImage: { width: '100%', height: '100%', borderRadius: 12, backgroundColor: COLORS.cardBorder },
  evidencePhotoZoom: { position: 'absolute', right: 8, top: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  
  // Reported By Section
  reportedByCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginTop: 20, padding: 16 },
  reportedByLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 12 },
  reportedByRow: { flexDirection: 'row', alignItems: 'center' },
  reportedByAvatar: { width: 64, height: 64, borderRadius: 12, marginRight: 14 },
  reportedByInfo: { flex: 1 },
  reportedByName: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  reportedByVerified: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  reportedByVerifiedText: { fontSize: 15, color: COLORS.primary, marginLeft: 6 },
  
  // Notification Banner
  notificationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.15)', borderRadius: 16, marginHorizontal: 20, marginTop: 20, marginBottom: 30, padding: 16, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  notificationIcon: { marginRight: 12 },
  notificationText: { flex: 1, fontSize: 15, color: COLORS.white, lineHeight: 22 },
  
  // Photo Viewer Modal
  photoViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  photoViewerHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  photoViewerCounter: { fontSize: 17, color: COLORS.white, fontWeight: '600' },
  photoViewerCloseBtn: { position: 'absolute', right: 20, top: 50, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  photoViewerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoViewerImage: { width: SCREEN_WIDTH - 40, height: SCREEN_WIDTH, borderRadius: 16 },
  photoViewerNavBtn: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  photoViewerNavLeft: { left: 10 },
  photoViewerNavRight: { right: 10 },
  photoViewerFooter: { paddingVertical: 20, alignItems: 'center' },
  photoViewerFilename: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  photoViewerHint: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  // Family Request Styles
  requestTabBadge: { position: 'absolute', top: -8, right: -12, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  requestTabBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  addRequestBtn: { borderWidth: 2, borderColor: COLORS.textMuted, borderStyle: 'dashed', borderRadius: 16, marginHorizontal: 16, marginTop: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addRequestText: { fontSize: 17, color: COLORS.textSecondary, marginLeft: 8 },
  
  requestEmptyCard: { backgroundColor: COLORS.card, borderRadius: 24, marginHorizontal: 16, marginTop: 20, paddingVertical: 60, paddingHorizontal: 30, alignItems: 'center' },
  requestEmptyIconBg: { width: 100, height: 100, borderRadius: 24, backgroundColor: 'rgba(60,60,60,0.6)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  requestEmptyTitle: { fontSize: 22, fontWeight: '600', color: COLORS.white, marginBottom: 12 },
  requestEmptySubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  
  // Request Card
  requestCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 16 },
  requestCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  requestPriorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  requestPriorityHigh: { backgroundColor: 'rgba(234, 179, 8, 0.25)' },
  requestPriorityUrgent: { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
  requestPriorityStandard: { backgroundColor: 'rgba(59, 130, 246, 0.25)' },
  requestPriorityText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  requestPriorityTextHigh: { color: '#eab308' },
  requestPriorityTextUrgent: { color: '#ef4444' },
  requestPriorityTextStandard: { color: '#3b82f6' },
  requestStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  requestStatusPending: { borderColor: '#f59e0b', backgroundColor: 'transparent' },
  requestStatusAccepted: { borderColor: '#22c55e', backgroundColor: 'transparent' },
  requestStatusDeclined: { borderColor: '#ef4444', backgroundColor: 'transparent' },
  requestStatusText: { fontSize: 11, fontWeight: '600' },
  requestStatusTextPending: { color: '#f59e0b' },
  requestStatusTextAccepted: { color: '#22c55e' },
  requestStatusTextDeclined: { color: '#ef4444' },
  requestCardTime: { fontSize: 13, color: COLORS.textMuted, marginLeft: 'auto' },
  requestCardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  requestCardDetails: { fontSize: 15, color: COLORS.textSecondary },
  requestDeclineReason: { fontSize: 14, color: '#f87171', marginTop: 8, fontStyle: 'italic' },
  
  // New Request Modal
  newRequestModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  newRequestModalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingBottom: 30, maxHeight: '85%' },
  newRequestModalHandle: { width: 40, height: 4, backgroundColor: COLORS.textMuted, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  newRequestModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  newRequestModalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  newRequestModalCloseBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  newRequestLabel: { fontSize: 16, color: COLORS.white, marginBottom: 10, paddingHorizontal: 20 },
  newRequestInput: { backgroundColor: COLORS.cardBorder, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: COLORS.white, marginBottom: 20, borderWidth: 2, borderColor: 'transparent' },
  newRequestTextArea: { backgroundColor: COLORS.cardBorder, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: COLORS.white, marginBottom: 20, minHeight: 100, textAlignVertical: 'top', borderWidth: 2, borderColor: 'transparent' },
  newRequestInputFocused: { borderColor: COLORS.primary },
  newRequestPriorityRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  newRequestPriorityBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.cardBorder, alignItems: 'center', marginRight: 10 },
  newRequestPriorityBtnLast: { marginRight: 0 },
  newRequestPriorityBtnSelected: { backgroundColor: COLORS.primary },
  newRequestPriorityBtnHigh: { backgroundColor: '#f59e0b' },
  newRequestPriorityBtnUrgent: { backgroundColor: '#ef4444' },
  newRequestPriorityBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  newRequestPriorityBtnTextSelected: { color: COLORS.white },
  newRequestSubmitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, marginHorizontal: 20, paddingVertical: 18, alignItems: 'center' },
  newRequestSubmitText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  
  // Calendar FAB
  calendarFab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  
  // Caregiver Profile Styles (for Family Members)
  caregiverProfileAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.primary },
  caregiverProfileName: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginTop: 16 },
  caregiverProfileRole: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  caregiverStatsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingHorizontal: 20 },
  caregiverStatItem: { alignItems: 'center', paddingHorizontal: 20 },
  caregiverStatIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  caregiverStatValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  caregiverStatLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  caregiverSection: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 20, padding: 20 },
  caregiverSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.white, marginBottom: 12 },
  certificationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  certificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(37, 211, 102, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  certificationText: { fontSize: 14, color: COLORS.primary, marginLeft: 6, fontWeight: '500' },
  caregiverContactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  caregiverContactText: { fontSize: 16, color: COLORS.white, marginLeft: 12 },
  contactCaregiverBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 16, marginHorizontal: 16, marginTop: 20, paddingVertical: 16 },
  contactCaregiverBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 10 },
});

// ============================================
// CARE TIMELINE DETAIL MODAL
// ============================================
const CareTimelineDetailModal = ({ visible, onClose, item }) => {
  if (!item) return null;
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={familyStyles.detailModalOverlay}>
        <SafeAreaView style={familyStyles.detailModalContent}>
          <ScrollView>
            {/* Header with caregiver info and close button */}
            <View style={familyStyles.detailModalHeader}>
              <Image 
                source={{ uri: item.caregiver.avatar }} 
                style={familyStyles.detailModalCaregiverAvatar} 
              />
              <View style={familyStyles.detailModalHeaderInfo}>
                <Text style={familyStyles.detailModalCaregiverName}>{item.caregiver.name}</Text>
                <Text style={familyStyles.detailModalCaregiverRole}>{item.caregiver.role}</Text>
              </View>
              <TouchableOpacity style={familyStyles.detailModalCloseBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            {/* Title and completion time */}
            <View style={familyStyles.detailModalTitleSection}>
              <Text style={familyStyles.detailModalTitle}>{item.title}</Text>
              <View style={familyStyles.detailModalTimeRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
                <Text style={familyStyles.detailModalTimeText}>Completed at {item.completedAt}</Text>
              </View>
            </View>
            
            {/* Task Image */}
            <Image 
              source={{ uri: item.image }} 
              style={familyStyles.detailModalImage}
              resizeMode="cover"
            />
            
            {/* Task Description */}
            <View style={familyStyles.detailModalDescSection}>
              <Text style={familyStyles.detailModalDescLabel}>TASK DESCRIPTION</Text>
              <Text style={familyStyles.detailModalDescText}>{item.description}</Text>
            </View>
            
            {/* Divider */}
            <View style={familyStyles.detailModalDivider} />
            
            {/* Caregiver Section */}
            <View style={familyStyles.detailModalCaregiverSection}>
              <Image 
                source={{ uri: item.caregiver.avatar }} 
                style={familyStyles.detailModalCaregiverAvatarLg} 
              />
              <View style={familyStyles.detailModalCaregiverInfoLg}>
                <Text style={familyStyles.detailModalCaregiverNameLg}>{item.caregiver.name}</Text>
                <Text style={familyStyles.detailModalCaregiverRoleLg}>{item.caregiver.role}</Text>
                {item.caregiver.verified && (
                  <View style={familyStyles.detailModalVerifiedRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <Text style={familyStyles.detailModalVerifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ============================================
// CARE TIMELINE CARD
// ============================================
const CareTimelineCard = ({ item, onPress }) => (
  <TouchableOpacity style={familyStyles.timelineCard} onPress={onPress} activeOpacity={0.9}>
    {/* Image with overlay */}
    <View>
      <Image 
        source={{ uri: item.image }} 
        style={familyStyles.timelineImage}
        resizeMode="cover"
      />
      <View style={familyStyles.timelineImageOverlay}>
        <Text style={familyStyles.timelineTitle}>{item.title}</Text>
        <View style={familyStyles.timelineTimeRow}>
          <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={familyStyles.timelineTimeText}>Completed at {item.completedAt}</Text>
        </View>
      </View>
    </View>
    
    {/* Note and caregiver info */}
    <View style={familyStyles.timelineNoteSection}>
      {item.note && (
        <Text style={familyStyles.timelineNoteText}>"{item.note}"</Text>
      )}
      <View style={familyStyles.timelineCaregiverRow}>
        <Image 
          source={{ uri: item.caregiver.avatar }} 
          style={familyStyles.timelineCaregiverAvatar} 
        />
        <View style={familyStyles.timelineCaregiverInfo}>
          <Text style={familyStyles.timelineCaregiverName}>{item.caregiver.name}</Text>
          <Text style={familyStyles.timelineCaregiverRole}>Caregiver</Text>
        </View>
        <View style={familyStyles.timelineDetailBtn}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================
// FAMILY HOME SCREEN
// ============================================
// NEW REQUEST MODAL
// ============================================
const NewRequestModal = ({ visible, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState('standard');
  const [titleFocused, setTitleFocused] = useState(false);
  const [detailsFocused, setDetailsFocused] = useState(false);
  
  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        details: details.trim(),
        priority,
      });
      setTitle('');
      setDetails('');
      setPriority('standard');
      onClose();
    }
  };
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={familyStyles.newRequestModalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={familyStyles.newRequestModalContent}>
          <View style={familyStyles.newRequestModalHandle} />
          
          {/* Header */}
          <View style={familyStyles.newRequestModalHeader}>
            <Text style={familyStyles.newRequestModalTitle}>New Request</Text>
            <TouchableOpacity style={familyStyles.newRequestModalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Form */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={familyStyles.newRequestLabel}>What do you need?</Text>
            <TextInput
              style={[
                familyStyles.newRequestInput,
                titleFocused && familyStyles.newRequestInputFocused
              ]}
              placeholder="e.g., Extra blanket, Call me back"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
            
            <Text style={familyStyles.newRequestLabel}>Additional details (optional)</Text>
            <TextInput
              style={[
                familyStyles.newRequestTextArea,
                detailsFocused && familyStyles.newRequestInputFocused
              ]}
              placeholder="Any specific instructions..."
              placeholderTextColor={COLORS.textMuted}
              value={details}
              onChangeText={setDetails}
              onFocus={() => setDetailsFocused(true)}
              onBlur={() => setDetailsFocused(false)}
              multiline
              numberOfLines={4}
            />
            
            <Text style={familyStyles.newRequestLabel}>Priority</Text>
            <View style={familyStyles.newRequestPriorityRow}>
              <TouchableOpacity 
                style={[
                  familyStyles.newRequestPriorityBtn,
                  priority === 'standard' && familyStyles.newRequestPriorityBtnSelected
                ]}
                onPress={() => setPriority('standard')}
              >
                <Text style={[
                  familyStyles.newRequestPriorityBtnText,
                  priority === 'standard' && familyStyles.newRequestPriorityBtnTextSelected
                ]}>Standard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  familyStyles.newRequestPriorityBtn,
                  priority === 'high' && familyStyles.newRequestPriorityBtnHigh
                ]}
                onPress={() => setPriority('high')}
              >
                <Text style={[
                  familyStyles.newRequestPriorityBtnText,
                  priority === 'high' && familyStyles.newRequestPriorityBtnTextSelected
                ]}>High</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  familyStyles.newRequestPriorityBtn,
                  familyStyles.newRequestPriorityBtnLast,
                  priority === 'urgent' && familyStyles.newRequestPriorityBtnUrgent
                ]}
                onPress={() => setPriority('urgent')}
              >
                <Text style={[
                  familyStyles.newRequestPriorityBtnText,
                  priority === 'urgent' && familyStyles.newRequestPriorityBtnTextSelected
                ]}>Urgent</Text>
              </TouchableOpacity>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity style={familyStyles.newRequestSubmitBtn} onPress={handleSubmit}>
              <Text style={familyStyles.newRequestSubmitText}>Send Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// FAMILY HOME SCREEN
// ============================================
const FamilyHomeScreen = ({ vitals, onOpenVitals }) => {
  const sharedData = React.useContext(SharedDataContext);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  
  // Use shared requests from context
  const familyRequests = sharedData?.sharedRequests || [];
  
  // Use shared completed tasks from context
  const completedTasks = sharedData?.sharedTasks || [];
  
  // AI Copilot state
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      isAI: true,
      text: "Hello! I'm your AI Care Assistant. I'm here to help you stay informed about your loved one's care.\n\nI can answer questions about care activities, explain procedures, and help you communicate with caregivers.\n\nHow can I assist you today?",
    },
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiInputFocused, setAiInputFocused] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  
  const handleTimelineItemPress = (item) => {
    setSelectedTimelineItem(item);
    setShowDetailModal(true);
  };
  
  const handleSendAiMessage = () => {
    if (!aiInputText.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      isAI: false,
      text: aiInputText.trim(),
    };
    
    setAiMessages([...aiMessages, userMessage]);
    setAiInputText('');
    setAiTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        isAI: true,
        text: "I understand your question. Based on the care records, I can help you with information about your loved one's daily activities, medications, and any incidents that have been reported.\n\nIs there something specific you'd like to know about?",
      };
      setAiMessages(prev => [...prev, aiResponse]);
      setAiTyping(false);
    }, 1500);
  };
  
  const handleSubmitRequest = (request) => {
    // Add to shared data so Caregiver can see it
    if (sharedData) {
      sharedData.addFamilyRequest({
        title: request.title,
        details: request.details,
        priority: request.priority,
      });
    }
  };
  
  const completedTasksCount = completedTasks.length;
  const totalTasks = 12;
  const progressPercent = Math.min((completedTasksCount / totalTasks) * 100, 100);

  return (
    <SafeAreaView style={familyStyles.container}>
      <ScrollView contentContainerStyle={familyStyles.scrollContent}>
        {/* Vitals Row */}
        <View style={familyStyles.vitalsRow}>
          <TouchableOpacity style={familyStyles.vitalCard} onPress={() => onOpenVitals('bp')}>
            <View style={[familyStyles.vitalIconBg, { backgroundColor: '#6b1c3b' }]}>
              <Ionicons name="heart-outline" size={24} color="#ec4899" />
            </View>
            <Text style={familyStyles.vitalValue}>{vitals.bp.systolic}/{vitals.bp.diastolic}</Text>
            <Text style={familyStyles.vitalLabel}>BP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={familyStyles.vitalCard} onPress={() => onOpenVitals('heart')}>
            <View style={[familyStyles.vitalIconBg, { backgroundColor: '#5c3d1e' }]}>
              <Ionicons name="pulse" size={24} color="#f59e0b" />
            </View>
            <Text style={familyStyles.vitalValue}>{vitals.heart}</Text>
            <Text style={familyStyles.vitalLabel}>Heart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={familyStyles.vitalCard} onPress={() => onOpenVitals('temp')}>
            <View style={[familyStyles.vitalIconBg, { backgroundColor: '#1e3a5f' }]}>
              <Ionicons name="thermometer-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={familyStyles.vitalValue}>{vitals.temp}°</Text>
            <Text style={familyStyles.vitalLabel}>Temp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={familyStyles.vitalCard} onPress={() => onOpenVitals('pain')}>
            <View style={[familyStyles.vitalIconBg, { backgroundColor: '#4a1d6b' }]}>
              <Ionicons name="sad-outline" size={24} color="#a855f7" />
            </View>
            <Text style={familyStyles.vitalValue}>{vitals.pain}/10</Text>
            <Text style={familyStyles.vitalLabel}>Pain</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={familyStyles.progressSection}>
          <View style={familyStyles.progressHeader}>
            <Text style={familyStyles.progressTitle}>Today's Progress</Text>
            <Text style={familyStyles.progressCount}>{completedTasksCount}/{totalTasks}</Text>
          </View>
          <View style={familyStyles.progressBar}>
            <View style={[familyStyles.progressFill, { width: `${totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0}%` }]} />
          </View>
        </View>

        {/* Tabs */}
        <View style={familyStyles.tabsRow}>
          <TouchableOpacity style={familyStyles.tabBtn} onPress={() => setActiveTab('requests')}>
            <Text style={[familyStyles.tabText, activeTab === 'requests' && familyStyles.tabTextActive]}>My Requests</Text>
          </TouchableOpacity>
          <View style={familyStyles.tabDivider} />
          <TouchableOpacity style={familyStyles.tabBtn} onPress={() => setActiveTab('timeline')}>
            <Text style={[familyStyles.tabText, activeTab === 'timeline' && familyStyles.tabTextActive]}>Care Timeline</Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'requests' ? (
          <>
            {/* Add New Request Button */}
            <TouchableOpacity 
              style={familyStyles.addRequestBtn} 
              onPress={() => setShowNewRequestModal(true)}
            >
              <Ionicons name="add" size={24} color={COLORS.textSecondary} />
              <Text style={familyStyles.addRequestText}>Add New Request</Text>
            </TouchableOpacity>
            
            {familyRequests.length === 0 ? (
              /* Empty State */
              <View style={familyStyles.requestEmptyCard}>
                <View style={familyStyles.requestEmptyIconBg}>
                  <Ionicons name="sparkles" size={48} color={COLORS.textSecondary} />
                </View>
                <Text style={familyStyles.requestEmptyTitle}>No requests yet</Text>
                <Text style={familyStyles.requestEmptySubtitle}>Tap the button above to request tasks for the caregiver</Text>
              </View>
            ) : (
              /* Request Cards */
              familyRequests.map((request) => (
                <View key={request.id} style={familyStyles.requestCard}>
                  <View style={familyStyles.requestCardHeader}>
                    {/* Priority Badge */}
                    <View style={[
                      familyStyles.requestPriorityBadge,
                      request.priority === 'high' && familyStyles.requestPriorityHigh,
                      request.priority === 'urgent' && familyStyles.requestPriorityUrgent,
                      request.priority === 'standard' && familyStyles.requestPriorityStandard,
                    ]}>
                      <Text style={[
                        familyStyles.requestPriorityText,
                        request.priority === 'high' && familyStyles.requestPriorityTextHigh,
                        request.priority === 'urgent' && familyStyles.requestPriorityTextUrgent,
                        request.priority === 'standard' && familyStyles.requestPriorityTextStandard,
                      ]}>
                        {request.priority.toUpperCase()}
                      </Text>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={[
                      familyStyles.requestStatusBadge,
                      request.status === 'pending' && familyStyles.requestStatusPending,
                      request.status === 'accepted' && familyStyles.requestStatusAccepted,
                      request.status === 'declined' && familyStyles.requestStatusDeclined,
                    ]}>
                      <Text style={[
                        familyStyles.requestStatusText,
                        request.status === 'pending' && familyStyles.requestStatusTextPending,
                        request.status === 'accepted' && familyStyles.requestStatusTextAccepted,
                        request.status === 'declined' && familyStyles.requestStatusTextDeclined,
                      ]}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Text>
                    </View>
                    
                    {/* Time */}
                    <Text style={familyStyles.requestCardTime}>{request.time}</Text>
                  </View>
                  
                  <Text style={familyStyles.requestCardTitle}>{request.title}</Text>
                  {request.details && (
                    <Text style={familyStyles.requestCardDetails}>{request.details}</Text>
                  )}
                  {request.status === 'declined' && request.declineReason && (
                    <Text style={familyStyles.requestDeclineReason}>Reason: {request.declineReason}</Text>
                  )}
                </View>
              ))
            )}
          </>
        ) : (
          /* Care Timeline Feed */
          <View style={familyStyles.timelineContainer}>
            {completedTasks.length === 0 ? (
              /* Empty Timeline State */
              <View style={familyStyles.requestEmptyCard}>
                <View style={familyStyles.requestEmptyIconBg}>
                  <Ionicons name="time" size={48} color={COLORS.textSecondary} />
                </View>
                <Text style={familyStyles.requestEmptyTitle}>No care updates yet</Text>
                <Text style={familyStyles.requestEmptySubtitle}>Tasks completed by caregivers will appear here with photos and notes</Text>
              </View>
            ) : (
              completedTasks.map((item) => (
                <CareTimelineCard 
                  key={item.id} 
                  item={item} 
                  onPress={() => handleTimelineItemPress(item)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Calendar FAB */}
      <TouchableOpacity style={familyStyles.calendarFab} onPress={() => setShowAICopilot(true)}>
        <Ionicons name="hardware-chip-outline" size={26} color={COLORS.white} />
      </TouchableOpacity>
      
      {/* AI Copilot Modal */}
      <Modal visible={showAICopilot} animationType="slide" transparent>
        <View style={aiStyles.modalOverlay}>
          <KeyboardAvoidingView 
            style={aiStyles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={aiStyles.header}>
              <View style={aiStyles.headerIconBg}>
                <Ionicons name="hardware-chip-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={aiStyles.headerInfo}>
                <Text style={aiStyles.headerTitle}>Care Assistant</Text>
                <Text style={aiStyles.headerSubtitle}>Powered by AI</Text>
              </View>
              <TouchableOpacity 
                style={aiStyles.closeBtn}
                onPress={() => setShowAICopilot(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView 
              style={aiStyles.messagesContainer}
              contentContainerStyle={aiStyles.messagesContent}
            >
              {aiMessages.map((message) => (
                <View 
                  key={message.id} 
                  style={[
                    aiStyles.messageRow,
                    message.isAI ? aiStyles.messageRowAI : aiStyles.messageRowUser,
                  ]}
                >
                  {message.isAI && (
                    <View style={[aiStyles.avatarBg, aiStyles.avatarBgAI]}>
                      <Ionicons name="hardware-chip-outline" size={18} color={COLORS.primary} />
                    </View>
                  )}
                  <View style={[
                    aiStyles.messageBubble,
                    message.isAI ? aiStyles.aiBubble : aiStyles.userBubble,
                  ]}>
                    <Text style={aiStyles.messageText}>{message.text}</Text>
                  </View>
                  {!message.isAI && (
                    <View style={[aiStyles.avatarBg, aiStyles.avatarBgUser]}>
                      <Ionicons name="person" size={18} color={COLORS.white} />
                    </View>
                  )}
                </View>
              ))}
              
              {aiTyping && (
                <View style={aiStyles.typingRow}>
                  <View style={[aiStyles.avatarBg, aiStyles.avatarBgAI]}>
                    <Ionicons name="hardware-chip-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View style={aiStyles.typingBubble}>
                    <View style={aiStyles.typingDot} />
                    <View style={aiStyles.typingDot} />
                    <View style={aiStyles.typingDot} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={aiStyles.inputContainer}>
              <View style={aiStyles.inputRow}>
                <TextInput
                  style={[
                    aiStyles.textInput,
                    aiInputFocused && aiStyles.textInputActive,
                  ]}
                  placeholder="Ask me anything..."
                  placeholderTextColor={COLORS.textMuted}
                  value={aiInputText}
                  onChangeText={setAiInputText}
                  onFocus={() => setAiInputFocused(true)}
                  onBlur={() => setAiInputFocused(false)}
                  multiline
                />
                <TouchableOpacity 
                  style={[
                    aiStyles.sendBtn,
                    aiInputText.trim() && aiStyles.sendBtnActive,
                  ]}
                  onPress={handleSendAiMessage}
                  disabled={!aiInputText.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={aiInputText.trim() ? COLORS.white : COLORS.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      
      {/* Timeline Detail Modal */}
      <CareTimelineDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedTimelineItem}
      />
      
      {/* New Request Modal */}
      <NewRequestModal
        visible={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        onSubmit={handleSubmitRequest}
      />
    </SafeAreaView>
  );
};

// ============================================
// FAMILY VITALS MODAL (View Only)
// ============================================
const FamilyVitalsModal = ({ visible, onClose, vitalType, vitals }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const getVitalConfig = () => {
    switch (vitalType) {
      case 'bp':
        return {
          title: 'Blood Pressure',
          value: `${vitals.bp.systolic}/${vitals.bp.diastolic}`,
          icon: 'heart-outline',
          color: '#ec4899',
          bgColor: '#6b1c3b',
          chartColor: '#ec4899',
          chartColor2: '#f59e0b',
          unit: '',
          history: [
            { day: 'Sun', time: '10:30 AM', value: '120/76' },
            { day: 'Sat', time: '10:35 AM', value: '121/78' },
            { day: 'Fri', time: '10:20 AM', value: '119/75' },
            { day: 'Thu', time: '10:30 AM', value: '120/77' },
            { day: 'Wed', time: '10:45 AM', value: '125/80' },
          ],
        };
      case 'heart':
        return {
          title: 'Heart Rate',
          value: `${vitals.heart} bpm`,
          icon: 'pulse',
          color: '#f59e0b',
          bgColor: '#5c3d1e',
          chartColor: '#f59e0b',
          unit: '',
          history: [
            { day: 'Sun', time: '10:30 AM', value: '72' },
            { day: 'Sat', time: '10:35 AM', value: '69' },
            { day: 'Fri', time: '10:20 AM', value: '71' },
            { day: 'Thu', time: '10:30 AM', value: '70' },
            { day: 'Wed', time: '10:45 AM', value: '75' },
          ],
        };
      case 'temp':
        return {
          title: 'Temperature',
          value: `${vitals.temp}°F`,
          icon: 'thermometer-outline',
          color: '#3b82f6',
          bgColor: '#1e3a5f',
          chartColor: '#3b82f6',
          unit: '°F',
          history: [
            { day: 'Sun', time: '10:30 AM', value: '98.6°F' },
            { day: 'Sat', time: '10:35 AM', value: '98.4°F' },
            { day: 'Fri', time: '10:20 AM', value: '98.7°F' },
            { day: 'Thu', time: '10:30 AM', value: '98.5°F' },
            { day: 'Wed', time: '10:45 AM', value: '98.2°F' },
          ],
        };
      case 'pain':
        return {
          title: 'Pain Level',
          value: `${vitals.pain}/10`,
          icon: 'sad-outline',
          color: '#a855f7',
          bgColor: '#4a1d6b',
          chartColor: '#a855f7',
          unit: '/10',
          history: [
            { day: 'Sun', time: '10:30 AM', value: '1/10' },
            { day: 'Sat', time: '10:35 AM', value: '2/10' },
            { day: 'Fri', time: '10:20 AM', value: '2/10' },
            { day: 'Thu', time: '10:30 AM', value: '1/10' },
            { day: 'Wed', time: '10:45 AM', value: '2/10' },
          ],
        };
      default:
        return null;
    }
  };

  const config = getVitalConfig();
  if (!config) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.white }}>Vital Signs</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* Current Reading Card */}
          <View style={{ backgroundColor: config.bgColor, borderRadius: 24, marginHorizontal: 20, padding: 30, alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: `${config.color}30`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name={config.icon} size={32} color={config.color} />
            </View>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 }}>{config.value}</Text>
            <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>Current Reading</Text>
          </View>

          {/* Chart Placeholder */}
          <View style={{ backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, padding: 20, marginBottom: 16 }}>
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <TouchableOpacity key={day} onPress={() => setSelectedDay(selectedDay === day ? null : day)}>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: config.chartColor, marginBottom: 60 }} />
                      {vitalType === 'bp' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: config.chartColor2, marginBottom: -48 }} />}
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <Text style={{ textAlign: 'center', fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 }}>Weekly trend</Text>

          {/* Recent History */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginLeft: 20, marginBottom: 12 }}>RECENT HISTORY</Text>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, overflow: 'hidden' }}>
            {config.history.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18, borderBottomWidth: index < config.history.length - 1 ? 1 : 0, borderBottomColor: COLORS.cardBorder }}>
                <Text style={{ fontSize: 16, color: COLORS.white }}>{item.day} at {item.time}</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.white }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================
// FAMILY MESSAGES SCREEN
// ============================================
const FamilyMessagesScreen = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Can someone cover Sunday?', time: '10:30 AM', sent: false, isAI: false },
    { id: 2, text: "I can cover from 2-6 PM!", time: '10:32 AM', sent: true, isAI: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sent: true,
      }]);
      setInputText('');
    }
  };

  if (selectedConversation) {
    return (
      <SafeAreaView style={msgStyles.container}>
        <View style={msgStyles.chatHeader}>
          <TouchableOpacity style={msgStyles.backBtn} onPress={() => setSelectedConversation(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          {selectedConversation.isGroup ? (
            <View style={[msgStyles.groupAvatar, { width: 48, height: 48, marginRight: 12, backgroundColor: '#7c3aed' }]}>
              <Ionicons name="people" size={24} color={COLORS.white} />
            </View>
          ) : (
            <Image source={{ uri: selectedConversation.avatar }} style={msgStyles.chatAvatar} />
          )}
          <View style={msgStyles.chatHeaderInfo}>
            <Text style={msgStyles.chatHeaderName}>{selectedConversation.name}{selectedConversation.role ? ` (${selectedConversation.role})` : ''}</Text>
            {selectedConversation.online && <Text style={msgStyles.chatHeaderStatus}>Online</Text>}
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={msgStyles.messagesContainer} contentContainerStyle={msgStyles.messagesContent}>
            {messages.map((message) => (
              <View key={message.id} style={[msgStyles.messageBubble, message.sent ? msgStyles.sentBubble : msgStyles.receivedBubble]}>
                <Text style={msgStyles.messageText}>{message.text}</Text>
                {message.sent ? (
                  <View style={msgStyles.sentMessageTime}>
                    <Text style={msgStyles.sentTimeText}>{message.time}</Text>
                    <Ionicons name="checkmark-done" size={16} color="rgba(255,255,255,0.7)" />
                  </View>
                ) : (
                  <Text style={msgStyles.messageTime}>{message.time}</Text>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={msgStyles.inputContainer}>
            <TextInput
              style={[msgStyles.textInput, inputFocused && msgStyles.textInputActive]}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <TouchableOpacity style={[msgStyles.sendBtn, inputText.trim() && msgStyles.sendBtnActive]} onPress={handleSendMessage}>
              <Ionicons name="send" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={msgStyles.container}>
      <View style={msgStyles.header}>
        <TouchableOpacity style={msgStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={msgStyles.headerTitle}>Messages</Text>
      </View>

      <View style={msgStyles.searchContainer}>
        <View style={msgStyles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <Text style={msgStyles.searchPlaceholder}>Search conversations...</Text>
        </View>
      </View>

      <ScrollView style={msgStyles.conversationList}>
        {FAMILY_CONVERSATIONS.map((conv) => (
          <TouchableOpacity key={conv.id} style={msgStyles.conversationItem} onPress={() => setSelectedConversation(conv)}>
            <View style={msgStyles.avatarContainer}>
              {conv.isGroup ? (
                <View style={[msgStyles.groupAvatar, { backgroundColor: '#7c3aed' }]}>
                  <Ionicons name="people" size={28} color={COLORS.white} />
                </View>
              ) : (
                <Image source={{ uri: conv.avatar }} style={msgStyles.avatar} />
              )}
            </View>
            <View style={msgStyles.conversationInfo}>
              <Text style={msgStyles.conversationName}>{conv.name}{conv.role ? ` (${conv.role})` : ''}</Text>
              <Text style={msgStyles.conversationPreview} numberOfLines={1}>{conv.lastMessage}</Text>
            </View>
            <View style={msgStyles.conversationMeta}>
              <Text style={msgStyles.conversationTime}>{conv.time}</Text>
              {conv.unread > 0 && (
                <View style={msgStyles.unreadBadge}>
                  <Text style={msgStyles.unreadText}>{conv.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// FAMILY ALERTS SCREEN
// ============================================
const FamilyAlertsScreen = () => {
  return (
    <SafeAreaView style={familyStyles.container}>
      <View style={familyStyles.header}>
        <View style={familyStyles.headerRow}>
          <TouchableOpacity style={familyStyles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={familyStyles.headerTitle}>Notifications</Text>
        </View>
      </View>

      <ScrollView>
        {/* Upcoming Schedule */}
        <View style={familyStyles.sectionLabel}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={familyStyles.sectionIcon} />
          <Text style={familyStyles.sectionText}>UPCOMING SCHEDULE</Text>
        </View>

        {FAMILY_ALERTS.upcoming.map((item) => (
          <View key={item.id} style={familyStyles.alertCard}>
            <View style={[familyStyles.alertIconBg, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={26} color="#3b82f6" />
            </View>
            <View style={familyStyles.alertInfo}>
              <Text style={familyStyles.alertTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={[familyStyles.alertTime, { marginLeft: 4 }]}>{item.time}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Recent Alerts */}
        <View style={familyStyles.sectionLabel}>
          <Ionicons name="notifications-outline" size={18} color={COLORS.textSecondary} style={familyStyles.sectionIcon} />
          <Text style={familyStyles.sectionText}>RECENT ALERTS</Text>
        </View>

        {FAMILY_ALERTS.recent.map((item) => (
          <View key={item.id} style={[familyStyles.recentAlertCard, item.highlight && familyStyles.recentAlertHighlight]}>
            <Text style={familyStyles.recentAlertTitle}>{item.title}</Text>
            <Text style={familyStyles.recentAlertSubtitle}>{item.subtitle}</Text>
            <Text style={familyStyles.recentAlertTime}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// FAMILY MENU SCREEN
// ============================================
const FamilyMenuScreen = ({ onSignOut }) => {
  const sharedData = React.useContext(SharedDataContext);
  const [currentView, setCurrentView] = useState('menu');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showCarePlan, setShowCarePlan] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showCurrentCaregiver, setShowCurrentCaregiver] = useState(false);

  // Get daily summary data for caregiver profile
  const completedTasksCount = sharedData?.sharedTasks?.length || 0;
  const totalTasks = 12;

  // Current Caregiver Profile View
  if (showCurrentCaregiver) {
    return (
      <SafeAreaView style={familyStyles.container}>
        {/* Header */}
        <View style={familyStyles.header}>
          <View style={familyStyles.headerRow}>
            <TouchableOpacity style={familyStyles.backBtn} onPress={() => setShowCurrentCaregiver(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={familyStyles.headerTitle}>Current Caregiver</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Caregiver Profile Header */}
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 16 }}>
            <Image source={{ uri: CAREGIVER_PROFILE.avatar }} style={familyStyles.caregiverProfileAvatar} />
            <Text style={familyStyles.caregiverProfileName}>{CAREGIVER_PROFILE.name}</Text>
            <Text style={familyStyles.caregiverProfileRole}>{CAREGIVER_PROFILE.role}</Text>
            
            {/* Stats Row */}
            <View style={familyStyles.caregiverStatsRow}>
              <View style={familyStyles.caregiverStatItem}>
                <View style={familyStyles.caregiverStatIconBg}>
                  <Ionicons name="star" size={18} color="#f59e0b" />
                </View>
                <Text style={familyStyles.caregiverStatValue}>{CAREGIVER_PROFILE.rating}</Text>
                <Text style={familyStyles.caregiverStatLabel}>Rating</Text>
              </View>
              <View style={familyStyles.caregiverStatItem}>
                <View style={familyStyles.caregiverStatIconBg}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={familyStyles.caregiverStatValue}>{CAREGIVER_PROFILE.years}</Text>
                <Text style={familyStyles.caregiverStatLabel}>Years</Text>
              </View>
              <View style={familyStyles.caregiverStatItem}>
                <View style={familyStyles.caregiverStatIconBg}>
                  <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
                </View>
                <Text style={familyStyles.caregiverStatValue}>{CAREGIVER_PROFILE.shifts}</Text>
                <Text style={familyStyles.caregiverStatLabel}>Shifts</Text>
              </View>
            </View>
          </View>

          {/* Certifications */}
          <View style={familyStyles.caregiverSection}>
            <Text style={familyStyles.caregiverSectionTitle}>Certifications</Text>
            <View style={familyStyles.certificationsRow}>
              {CAREGIVER_PROFILE.certifications.map((cert, idx) => (
                <View key={idx} style={familyStyles.certificationBadge}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                  <Text style={familyStyles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={familyStyles.caregiverSection}>
            <Text style={familyStyles.caregiverSectionTitle}>Contact Information</Text>
            <View style={familyStyles.caregiverContactRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <Text style={familyStyles.caregiverContactText}>{CAREGIVER_PROFILE.email}</Text>
            </View>
            <View style={familyStyles.caregiverContactRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <Text style={familyStyles.caregiverContactText}>{CAREGIVER_PROFILE.phone}</Text>
            </View>
          </View>

          {/* Performance Card */}
          <View style={[newFeatureStyles.perfCard, { marginTop: 16 }]}>
            <View style={newFeatureStyles.perfHeader}>
              <Text style={newFeatureStyles.perfTitle}>Caregiver Performance</Text>
              <View style={newFeatureStyles.perfScoreBadge}>
                <Ionicons name="star" size={18} color={COLORS.primary} />
                <Text style={newFeatureStyles.perfScoreText}>{sharedData?.performanceMetrics?.monthlyScore || 96}%</Text>
              </View>
            </View>
            <View style={newFeatureStyles.perfMetricsRow}>
              <View style={newFeatureStyles.perfMetric}>
                <Text style={newFeatureStyles.perfMetricValue}>{sharedData?.performanceMetrics?.taskCompletionRate || 94}%</Text>
                <Text style={newFeatureStyles.perfMetricLabel}>Tasks{'\n'}Completed</Text>
              </View>
              <View style={newFeatureStyles.perfDivider} />
              <View style={newFeatureStyles.perfMetric}>
                <Text style={newFeatureStyles.perfMetricValue}>{sharedData?.performanceMetrics?.onTimeRate || 98}%</Text>
                <Text style={newFeatureStyles.perfMetricLabel}>On-Time{'\n'}Rate</Text>
              </View>
              <View style={newFeatureStyles.perfDivider} />
              <View style={newFeatureStyles.perfMetric}>
                <Text style={newFeatureStyles.perfMetricValue}>{sharedData?.performanceMetrics?.familyRating || 4.8}</Text>
                <Text style={newFeatureStyles.perfMetricLabel}>Family{'\n'}Rating</Text>
              </View>
            </View>
          </View>

          {/* Today's Summary Card */}
          <View style={[newFeatureStyles.summaryCard, { marginTop: 16 }]}>
            <View style={newFeatureStyles.summaryHeader}>
              <Text style={newFeatureStyles.summaryTitle}>Today's Summary</Text>
              <Text style={newFeatureStyles.summaryDate}>{sharedData?.dailySummary?.date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={newFeatureStyles.summaryGrid}>
              <View style={newFeatureStyles.summaryGridItem}>
                <View style={newFeatureStyles.summaryGridCard}>
                  <Text style={newFeatureStyles.summaryGridValue}>{sharedData?.dailySummary?.tasksCompleted || completedTasksCount}/{sharedData?.dailySummary?.totalTasks || totalTasks}</Text>
                  <Text style={newFeatureStyles.summaryGridLabel}>Tasks Done</Text>
                </View>
              </View>
              <View style={newFeatureStyles.summaryGridItem}>
                <View style={newFeatureStyles.summaryGridCard}>
                  <Text style={newFeatureStyles.summaryGridValue}>{sharedData?.dailySummary?.medicationsGiven || 0}/{sharedData?.dailySummary?.totalMedications || 4}</Text>
                  <Text style={newFeatureStyles.summaryGridLabel}>Meds Given</Text>
                </View>
              </View>
              <View style={newFeatureStyles.summaryGridItem}>
                <View style={newFeatureStyles.summaryGridCard}>
                  <Text style={newFeatureStyles.summaryGridValue}>{sharedData?.dailySummary?.caregiverArrival || '--:--'}</Text>
                  <Text style={newFeatureStyles.summaryGridLabel}>Arrived At</Text>
                </View>
              </View>
              <View style={newFeatureStyles.summaryGridItem}>
                <View style={newFeatureStyles.summaryGridCard}>
                  <Text style={newFeatureStyles.summaryGridValue}>{sharedData?.dailySummary?.incidentsReported || 0}</Text>
                  <Text style={newFeatureStyles.summaryGridLabel}>Incidents</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Caregiver Button */}
          <TouchableOpacity style={familyStyles.contactCaregiverBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
            <Text style={familyStyles.contactCaregiverBtnText}>Message Caregiver</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Care Plan View
  if (showCarePlan) {
    return <FamilyCarePlanScreen onBack={() => setShowCarePlan(false)} />;
  }
  
  // Weekly Report View
  if (showWeeklyReport) {
    return <FamilyWeeklyReportScreen onBack={() => setShowWeeklyReport(false)} />;
  }

  // Profile View
  if (currentView === 'profile') {
    return (
      <SafeAreaView style={familyStyles.container}>
        <View style={familyStyles.header}>
          <View style={familyStyles.headerRow}>
            <TouchableOpacity style={familyStyles.backBtn} onPress={() => setCurrentView('menu')}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={familyStyles.headerTitle}>Profile</Text>
          </View>
        </View>

        <ScrollView>
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: FAMILY_MEMBER.avatar }} style={familyStyles.profileAvatar} />
              <TouchableOpacity style={familyStyles.profileCameraBtn}>
                <Ionicons name="camera" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={familyStyles.profileName}>{FAMILY_MEMBER.name}</Text>
          <Text style={familyStyles.profileRole}>{FAMILY_MEMBER.role}</Text>

          <View style={familyStyles.contactCard}>
            <Text style={familyStyles.contactTitle}>Contact Information</Text>
            <Text style={familyStyles.contactLabel}>EMAIL</Text>
            <Text style={familyStyles.contactValue}>{FAMILY_MEMBER.email}</Text>
            <Text style={familyStyles.contactLabel}>PHONE</Text>
            <Text style={[familyStyles.contactValue, { marginBottom: 0 }]}>{FAMILY_MEMBER.phone}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={familyStyles.container}>
      <ScrollView contentContainerStyle={familyStyles.menuScrollContent}>
        {/* Family Member Profile Card */}
        <TouchableOpacity style={familyStyles.menuCard} onPress={() => setCurrentView('profile')}>
          <Image source={{ uri: FAMILY_MEMBER.avatar }} style={familyStyles.menuAvatar} />
          <View style={familyStyles.menuInfo}>
            <Text style={familyStyles.menuName}>{FAMILY_MEMBER.name}</Text>
            <Text style={familyStyles.menuRole}>{FAMILY_MEMBER.role}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Patient Profile Card */}
        <TouchableOpacity style={familyStyles.menuCard} onPress={() => setShowPatientProfile(true)}>
          <Image source={{ uri: PATIENT.photo }} style={familyStyles.menuAvatar} />
          <View style={familyStyles.menuInfo}>
            <Text style={familyStyles.menuName}>{PATIENT.name}</Text>
            <Text style={familyStyles.menuRole}>View Medical Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <TouchableOpacity style={familyStyles.menuCard} onPress={() => setShowCarePlan(true)}>
          <View style={[familyStyles.menuIconBg, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="clipboard-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Care Plan</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={familyStyles.menuCard} onPress={() => setShowWeeklyReport(true)}>
          <View style={[familyStyles.menuIconBg, { backgroundColor: '#f59e0b' }]}>
            <Ionicons name="bar-chart-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Weekly Report</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={familyStyles.menuCard} onPress={() => setShowCurrentCaregiver(true)}>
          <View style={familyStyles.menuIconBg}>
            <Ionicons name="heart-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Current Caregiver</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={familyStyles.menuCard}>
          <View style={familyStyles.menuIconBg}>
            <Ionicons name="trending-up" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Billing</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={familyStyles.menuCard}>
          <View style={familyStyles.menuIconBg}>
            <Ionicons name="settings-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={familyStyles.menuCard}>
          <View style={familyStyles.menuIconBg}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={familyStyles.menuText}>Support</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={familyStyles.signOutCard} onPress={onSignOut}>
          <View style={familyStyles.signOutIconBg}>
            <Ionicons name="person-outline" size={24} color="#ef4444" />
          </View>
          <Text style={familyStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Patient Profile Modal */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)}
        onOpenCareHistory={() => {}}
      />
    </SafeAreaView>
  );
};

// ============================================
// FAMILY INCIDENT PHOTO VIEWER MODAL
// ============================================
const FamilyPhotoViewerModal = ({ visible, onClose, photos, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  
  const goNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  if (!photos || photos.length === 0) return null;
  
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={familyStyles.photoViewerOverlay}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header with counter and close */}
          <View style={familyStyles.photoViewerHeader}>
            <Text style={familyStyles.photoViewerCounter}>{currentIndex + 1} / {photos.length}</Text>
            <TouchableOpacity style={familyStyles.photoViewerCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {/* Photo */}
          <View style={familyStyles.photoViewerContent}>
            {currentIndex > 0 && (
              <TouchableOpacity 
                style={[familyStyles.photoViewerNavBtn, familyStyles.photoViewerNavLeft]} 
                onPress={goPrev}
              >
                <Ionicons name="chevron-back" size={28} color={COLORS.white} />
              </TouchableOpacity>
            )}
            
            <Image 
              source={{ uri: photos[currentIndex] }} 
              style={familyStyles.photoViewerImage}
              resizeMode="contain"
            />
            
            {currentIndex < photos.length - 1 && (
              <TouchableOpacity 
                style={[familyStyles.photoViewerNavBtn, familyStyles.photoViewerNavRight]} 
                onPress={goNext}
              >
                <Ionicons name="chevron-forward" size={28} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Footer */}
          <View style={familyStyles.photoViewerFooter}>
            <Text style={familyStyles.photoViewerFilename}>IMG_0{230 - currentIndex}.jpeg</Text>
            <Text style={familyStyles.photoViewerHint}>Tap outside or press X to close</Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ============================================
// FAMILY CARE PLAN SCREEN
// ============================================
const FamilyCarePlanScreen = ({ onBack }) => {
  const sharedData = React.useContext(SharedDataContext);
  const carePlan = sharedData?.carePlan || {};
  
  return (
    <SafeAreaView style={newFeatureStyles.carePlanContainer}>
      <ScrollView contentContainerStyle={newFeatureStyles.carePlanScrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={familyStyles.detailBackBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          <Text style={familyStyles.detailBackText}>Back</Text>
        </TouchableOpacity>
        
        {/* Header */}
        <View style={newFeatureStyles.carePlanHeader}>
          <Text style={newFeatureStyles.carePlanTitle}>Care Plan</Text>
          <Text style={newFeatureStyles.carePlanSubtitle}>For {carePlan.clientName || PATIENT.name}</Text>
        </View>
        
        {/* Primary Goals */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>PRIMARY GOALS</Text>
          {(carePlan.primaryGoals || []).map((goal, idx) => (
            <View key={idx} style={newFeatureStyles.carePlanGoal}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              <Text style={newFeatureStyles.carePlanGoalText}>{goal}</Text>
            </View>
          ))}
        </View>
        
        {/* Medications */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>MEDICATIONS</Text>
          {(carePlan.medications || []).map((med, idx) => (
            <View key={idx} style={newFeatureStyles.carePlanMedRow}>
              <View style={{ flex: 1 }}>
                <Text style={newFeatureStyles.carePlanMedName}>{med.name} ({med.dosage})</Text>
                <Text style={newFeatureStyles.carePlanMedDetails}>{med.frequency} - {med.purpose}</Text>
              </View>
              <Text style={newFeatureStyles.carePlanMedTime}>{med.time}</Text>
            </View>
          ))}
        </View>
        
        {/* Daily Schedule */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>DAILY SCHEDULE</Text>
          {(carePlan.adlSchedule || []).map((item, idx) => (
            <View key={idx} style={newFeatureStyles.carePlanMedRow}>
              <View style={{ flex: 1 }}>
                <Text style={newFeatureStyles.carePlanMedName}>{item.task}</Text>
                <Text style={newFeatureStyles.carePlanMedDetails}>{item.required ? 'Required' : 'Optional'} - {item.type}</Text>
              </View>
              <Text style={newFeatureStyles.carePlanMedTime}>{item.time}</Text>
            </View>
          ))}
        </View>
        
        {/* Restrictions */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>DIETARY RESTRICTIONS</Text>
          {(carePlan.restrictions || []).map((restriction, idx) => (
            <View key={idx} style={newFeatureStyles.carePlanRestriction}>
              <Ionicons name="alert-circle" size={18} color="#f87171" />
              <Text style={newFeatureStyles.carePlanRestrictionText}>{restriction}</Text>
            </View>
          ))}
        </View>
        
        {/* Emergency Protocol */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>EMERGENCY PROTOCOL</Text>
          <View style={newFeatureStyles.carePlanEmergency}>
            <Text style={newFeatureStyles.carePlanEmergencyText}>{carePlan.emergencyProtocol || 'Call 911 for emergencies.'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// FAMILY WEEKLY REPORT SCREEN
// ============================================
const FamilyWeeklyReportScreen = ({ onBack }) => {
  const sharedData = React.useContext(SharedDataContext);
  const weeklyReport = sharedData?.weeklyReport || {};
  
  return (
    <SafeAreaView style={newFeatureStyles.carePlanContainer}>
      <ScrollView contentContainerStyle={newFeatureStyles.carePlanScrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={familyStyles.detailBackBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          <Text style={familyStyles.detailBackText}>Back</Text>
        </TouchableOpacity>
        
        {/* Header */}
        <View style={newFeatureStyles.carePlanHeader}>
          <Text style={newFeatureStyles.carePlanTitle}>Weekly Report</Text>
          <Text style={newFeatureStyles.carePlanSubtitle}>{weeklyReport.weekOf || 'This Week'}</Text>
        </View>
        
        {/* Weekly Score Card */}
        <View style={newFeatureStyles.weeklyCard}>
          <View style={newFeatureStyles.weeklyHeader}>
            <Text style={newFeatureStyles.weeklyTitle}>Overall Compliance</Text>
          </View>
          <View style={newFeatureStyles.weeklyScoreRow}>
            <View style={newFeatureStyles.weeklyScoreCircle}>
              <Text style={newFeatureStyles.weeklyScoreValue}>{weeklyReport.overallCompliance || 94}%</Text>
            </View>
          </View>
          <View style={newFeatureStyles.weeklyStatsRow}>
            <View style={newFeatureStyles.weeklyStat}>
              <Text style={newFeatureStyles.weeklyStatValue}>{weeklyReport.taskCompletion?.completed || 78}/{weeklyReport.taskCompletion?.total || 84}</Text>
              <Text style={newFeatureStyles.weeklyStatLabel}>Tasks</Text>
            </View>
            <View style={newFeatureStyles.weeklyStat}>
              <Text style={newFeatureStyles.weeklyStatValue}>{weeklyReport.medicationAdherence?.onTime || 26}/{weeklyReport.medicationAdherence?.total || 28}</Text>
              <Text style={newFeatureStyles.weeklyStatLabel}>Meds On Time</Text>
            </View>
            <View style={newFeatureStyles.weeklyStat}>
              <Text style={newFeatureStyles.weeklyStatValue}>{weeklyReport.incidents || 1}</Text>
              <Text style={newFeatureStyles.weeklyStatLabel}>Incidents</Text>
            </View>
          </View>
          
          {/* Missed Tasks */}
          {weeklyReport.missedTasks && weeklyReport.missedTasks.length > 0 && (
            <View style={newFeatureStyles.weeklyMissedSection}>
              <Text style={newFeatureStyles.weeklyMissedTitle}>Missed Tasks This Week</Text>
              {weeklyReport.missedTasks.map((task, idx) => (
                <Text key={idx} style={newFeatureStyles.weeklyMissedItem}>• {task}</Text>
              ))}
            </View>
          )}
        </View>
        
        {/* Caregiver Notes */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>CAREGIVER NOTES</Text>
          <Text style={[newFeatureStyles.carePlanGoalText, { marginLeft: 0 }]}>{weeklyReport.caregiverNotes || 'No notes this week.'}</Text>
        </View>
        
        {/* Performance Trend */}
        <View style={newFeatureStyles.carePlanSection}>
          <Text style={newFeatureStyles.carePlanSectionTitle}>PERFORMANCE TREND</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={weeklyReport.performanceTrend === 'improving' ? 'trending-up' : weeklyReport.performanceTrend === 'declining' ? 'trending-down' : 'remove'} 
              size={24} 
              color={weeklyReport.performanceTrend === 'improving' ? COLORS.primary : weeklyReport.performanceTrend === 'declining' ? '#ef4444' : COLORS.textSecondary} 
            />
            <Text style={[newFeatureStyles.carePlanGoalText, { marginLeft: 8, textTransform: 'capitalize' }]}>{weeklyReport.performanceTrend || 'Stable'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// FAMILY INCIDENT DETAIL SCREEN
// ============================================
const FamilyIncidentDetailScreen = ({ incident, onBack }) => {
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const getIncidentIcon = () => {
    if (incident.type === 'behavioral') {
      return { icon: 'fitness', bg: 'rgba(236, 72, 153, 0.25)', color: '#ec4899' };
    } else if (incident.type === 'fall') {
      return { icon: 'warning', bg: 'rgba(234, 179, 8, 0.25)', color: '#eab308' };
    }
    return { icon: 'alert-circle', bg: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' };
  };
  
  const iconConfig = getIncidentIcon();
  const isCritical = incident.severity === 'critical';
  
  const openPhoto = (index) => {
    setSelectedPhotoIndex(index);
    setShowPhotoViewer(true);
  };
  
  return (
    <SafeAreaView style={familyStyles.incidentContainer}>
      <ScrollView contentContainerStyle={familyStyles.incidentScrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={familyStyles.detailBackBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          <Text style={familyStyles.detailBackText}>Back to Incidents</Text>
        </TouchableOpacity>
        
        {/* Header with Icon and Title */}
        <View style={familyStyles.detailHeaderRow}>
          <View style={[familyStyles.detailIconBg, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.icon} size={32} color={iconConfig.color} />
          </View>
          <View style={familyStyles.detailTitleSection}>
            <Text style={familyStyles.detailTitle}>{incident.title}</Text>
            <Text style={familyStyles.detailDateTime}>{incident.dateTime}</Text>
          </View>
        </View>
        
        {/* Severity and Status Badges */}
        <View style={familyStyles.badgesRow}>
          <View style={[
            familyStyles.statusBadge, 
            isCritical ? familyStyles.statusBadgeCritical : familyStyles.statusBadgeHigh
          ]}>
            <Text style={[
              familyStyles.statusBadgeText,
              isCritical ? familyStyles.statusTextCritical : familyStyles.statusTextHigh
            ]}>
              {isCritical ? 'Critical Severity' : 'High Severity'}
            </Text>
          </View>
          <View style={familyStyles.statusBadgeOpen}>
            <Text style={[familyStyles.statusBadgeText, familyStyles.statusTextOpen]}>Open</Text>
          </View>
        </View>
        
        {/* What Happened */}
        <View style={familyStyles.detailCard}>
          <Text style={familyStyles.detailCardLabel}>WHAT HAPPENED</Text>
          <Text style={familyStyles.detailCardText}>{incident.description}</Text>
        </View>
        
        {/* Actions Taken */}
        <View style={familyStyles.detailCard}>
          <Text style={familyStyles.detailCardLabel}>ACTIONS TAKEN</Text>
          <Text style={familyStyles.detailCardText}>{incident.actionsTaken}</Text>
        </View>
        
        {/* Evidence Photos */}
        <View style={familyStyles.evidenceCard}>
          <View style={familyStyles.evidenceHeader}>
            <Text style={familyStyles.evidenceTitle}>EVIDENCE PHOTOS ({incident.photos.length})</Text>
            <TouchableOpacity style={familyStyles.evidenceTapView} onPress={() => openPhoto(0)}>
              <Ionicons name="expand-outline" size={16} color={COLORS.primary} style={familyStyles.evidenceTapIcon} />
              <Text style={familyStyles.evidenceTapText}>Tap to view</Text>
            </TouchableOpacity>
          </View>
          <View style={familyStyles.evidenceGrid}>
            {incident.photos.map((photo, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => openPhoto(index)}
                style={familyStyles.evidencePhotoWrapper}
              >
                <Image source={{ uri: photo }} style={familyStyles.evidencePhotoImage} resizeMode="cover" />
                <View style={familyStyles.evidencePhotoZoom}>
                  <Ionicons name="expand-outline" size={16} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Reported By */}
        <View style={familyStyles.reportedByCard}>
          <Text style={familyStyles.reportedByLabel}>REPORTED BY</Text>
          <View style={familyStyles.reportedByRow}>
            <Image source={{ uri: incident.reporter.avatar }} style={familyStyles.reportedByAvatar} />
            <View style={familyStyles.reportedByInfo}>
              <Text style={familyStyles.reportedByName}>{incident.reporter.name}</Text>
              {incident.reporter.verified && (
                <View style={familyStyles.reportedByVerified}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  <Text style={familyStyles.reportedByVerifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Notification Banner */}
        <View style={familyStyles.notificationBanner}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} style={familyStyles.notificationIcon} />
          <Text style={familyStyles.notificationText}>You were notified about this incident when it was reported.</Text>
        </View>
      </ScrollView>
      
      {/* Photo Viewer Modal */}
      <FamilyPhotoViewerModal
        visible={showPhotoViewer}
        onClose={() => setShowPhotoViewer(false)}
        photos={incident.photos}
        initialIndex={selectedPhotoIndex}
      />
    </SafeAreaView>
  );
};

// ============================================
// FAMILY INCIDENT LIST SCREEN
// ============================================
const FamilyIncidentListScreen = ({ onSelectIncident }) => {
  const sharedData = React.useContext(SharedDataContext);
  
  // Use shared incidents from context
  const incidents = sharedData?.sharedIncidents || [];
  
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  
  const getIncidentIcon = (type) => {
    if (type === 'behavioral') {
      return { icon: 'fitness', bg: 'rgba(236, 72, 153, 0.25)', color: '#ec4899' };
    } else if (type === 'fall') {
      return { icon: 'warning', bg: 'rgba(234, 179, 8, 0.25)', color: '#eab308' };
    }
    return { icon: 'alert-circle', bg: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' };
  };
  
  return (
    <SafeAreaView style={familyStyles.incidentContainer}>
      <ScrollView contentContainerStyle={familyStyles.incidentScrollContent}>
        {/* Header */}
        <View style={familyStyles.incidentHeader}>
          <Text style={familyStyles.incidentTitle}>Incident Reports</Text>
          <Text style={familyStyles.incidentSubtitle}>Care incidents reported for {PATIENT.name}</Text>
        </View>
        
        {/* Summary Card */}
        <View style={familyStyles.summaryCard}>
          <View style={familyStyles.summaryHeader}>
            <Text style={familyStyles.summaryTitle}>Summary</Text>
            <Text style={familyStyles.summaryPeriod}>Last 30 days</Text>
          </View>
          <View style={familyStyles.summaryStats}>
            <View style={familyStyles.summaryStat}>
              <Text style={familyStyles.summaryStatValue}>{totalIncidents}</Text>
              <Text style={familyStyles.summaryStatLabel}>Total</Text>
            </View>
            <View style={familyStyles.summaryStat}>
              <Text style={familyStyles.summaryStatValueRed}>{resolvedIncidents}</Text>
              <Text style={familyStyles.summaryStatLabel}>Resolved</Text>
            </View>
            <View style={familyStyles.summaryStat}>
              <Text style={familyStyles.summaryStatValueGreen}>{openIncidents}</Text>
              <Text style={familyStyles.summaryStatLabel}>Open</Text>
            </View>
          </View>
        </View>
        
        {incidents.length === 0 ? (
          /* Empty Incidents State */
          <View style={[familyStyles.requestEmptyCard, { marginTop: 30 }]}>
            <View style={familyStyles.requestEmptyIconBg}>
              <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
            </View>
            <Text style={familyStyles.requestEmptyTitle}>No incidents reported</Text>
            <Text style={familyStyles.requestEmptySubtitle}>When caregivers report incidents, they will appear here with photos and details</Text>
          </View>
        ) : (
          <>
            {/* Recent Incidents Header */}
            <View style={familyStyles.recentHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.white} style={familyStyles.recentIcon} />
              <Text style={familyStyles.recentTitle}>Recent Incidents</Text>
            </View>
        
            {/* Incident Cards */}
            {incidents.map((incident) => {
              const iconConfig = getIncidentIcon(incident.type);
              const isCritical = incident.severity === 'critical';
              
              return (
                <TouchableOpacity 
                  key={incident.id} 
                  style={familyStyles.incidentCard}
                  onPress={() => onSelectIncident(incident)}
                >
                  <View style={[familyStyles.incidentIconBg, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon} size={28} color={iconConfig.color} />
                  </View>
                  <View style={familyStyles.incidentInfo}>
                    <View style={familyStyles.incidentCardTitleRow}>
                      <Text style={familyStyles.incidentCardTitle}>{incident.title}</Text>
                      <View style={[
                        familyStyles.severityBadge,
                        isCritical ? familyStyles.severityBadgeCritical : familyStyles.severityBadgeHigh
                      ]}>
                        <Text style={[
                          familyStyles.severityBadgeText,
                          isCritical ? familyStyles.severityTextCritical : familyStyles.severityTextHigh
                        ]}>
                          {isCritical ? 'CRITICAL' : 'HIGH'}
                        </Text>
                      </View>
                    </View>
                    <Text style={familyStyles.incidentCardDesc}>{incident.description}</Text>
                    <Text style={familyStyles.incidentCardTime}>{incident.dateTime}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// FAMILY INCIDENT SCREEN (Main Container)
// ============================================
const FamilyIncidentScreen = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  if (selectedIncident) {
    return (
      <FamilyIncidentDetailScreen 
        incident={selectedIncident} 
        onBack={() => setSelectedIncident(null)} 
      />
    );
  }
  
  return <FamilyIncidentListScreen onSelectIncident={setSelectedIncident} />;
};

// ============================================
// FAMILY INCIDENT TAB ICON WITH BADGE
// ============================================
const FamilyIncidentTabIcon = ({ focused, color }) => {
  const sharedData = React.useContext(SharedDataContext);
  const incidentCount = sharedData?.getOpenIncidentsCount() || 0;
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={focused ? "warning" : "warning-outline"} size={24} color={color} />
      {incidentCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -6,
          right: -10,
          backgroundColor: '#ef4444',
          borderRadius: 10,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{incidentCount}</Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// FAMILY DASHBOARD (Complete)
// ============================================
const FamilyDashboard = ({ onSignOut }) => {
  const [vitals] = useState({ bp: { systolic: 120, diastolic: 76 }, heart: 72, temp: 98.6, pain: 1 });
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState(null);

  const FamilyTab = createBottomTabNavigator();

  const openVitals = (type) => {
    setSelectedVitalType(type);
    setShowVitalsModal(true);
  };

  const HomeWrapper = () => <FamilyHomeScreen vitals={vitals} onOpenVitals={openVitals} />;
  const MenuWrapper = () => <FamilyMenuScreen onSignOut={onSignOut} />;

  return (
    <>
      <FamilyTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <FamilyTab.Screen name="Home" component={HomeWrapper}
          options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} /> }} />
        <FamilyTab.Screen name="Incident" component={FamilyIncidentScreen}
          options={{ tabBarIcon: ({ focused, color }) => <FamilyIncidentTabIcon focused={focused} color={color} /> }} />
        <FamilyTab.Screen name="Message" component={FamilyMessagesScreen}
          options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} /> }} />
        <FamilyTab.Screen name="Alerts" component={FamilyAlertsScreen}
          options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "notifications" : "notifications-outline"} size={24} color={color} /> }} />
        <FamilyTab.Screen name="Menu" component={MenuWrapper}
          options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} /> }} />
      </FamilyTab.Navigator>

      <FamilyVitalsModal
        visible={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        vitalType={selectedVitalType}
        vitals={vitals}
      />
    </>
  );
};

// ============================================
// AGENCY DASHBOARD (Placeholder)
// ============================================
const AgencyDashboard = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ backgroundColor: '#e0e7ff', width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <Ionicons name="briefcase" size={50} color="#6366f1" />
    </View>
    <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 }}>Agency Dashboard</Text>
    <Text style={{ fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>Coming Soon - Manage staff, compliance & care operations</Text>
  </SafeAreaView>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('selectType');
  const [selectedAccountType, setSelectedAccountType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedAccountType(type);
    setAuthScreen('signUp');
  };

  const handleSignUp = () => {
    setAuthScreen('selectType');
  };

  const handleSignIn = () => {
    setAuthScreen('signIn');
  };

  const handleCreateAccount = (accountType) => {
    setUser({ role: accountType, name: 'User' });
  };

  const handleLogin = (accountType) => {
    setUser({ role: accountType || 'caregiver', name: 'Sarah Johnson' });
  };

  // Show auth screens if not logged in
  if (!user) {
    if (authScreen === 'selectType') {
      return (
        <AccountTypeScreen 
          onSelectType={handleSelectType}
          onSignIn={handleSignIn}
        />
      );
    } else if (authScreen === 'signUp') {
      return (
        <SignUpScreen 
          accountType={selectedAccountType}
          onBack={handleSignUp}
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
        />
      );
    } else if (authScreen === 'signIn') {
      return (
        <SignInScreen 
          onBack={handleSignUp}
          onSignUp={handleSignUp}
          onSignIn={handleLogin}
        />
      );
    }
  }

  const handleSignOut = () => {
    setUser(null);
    setAuthScreen('selectType');
    setSelectedAccountType(null);
  };

  // Show role-specific dashboard
  if (user.role === 'family') {
    return (
      <SharedDataProvider>
        <NavigationContainer>
          <FamilyDashboard onSignOut={handleSignOut} />
        </NavigationContainer>
      </SharedDataProvider>
    );
  }
  
  if (user.role === 'agency') {
    return <AgencyDashboard />;
  }
  
  // Default to Caregiver dashboard
  return (
    <SharedDataProvider>
      <NavigationContainer>
        <CaregiverTabs onSignOut={handleSignOut} />
      </NavigationContainer>
    </SharedDataProvider>
  );
}

// ============================================
// STYLES
// ============================================
// ============================================
// NEW FEATURE STYLES (Phase A, B, C)
// ============================================
const newFeatureStyles = StyleSheet.create({
  // Clock In/Out Card
  clockCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  clockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  clockTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  clockStatus: { flexDirection: 'row', alignItems: 'center' },
  clockStatusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  clockStatusText: { fontSize: 14, color: COLORS.textSecondary },
  clockTimeRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  clockTimeItem: { alignItems: 'center' },
  clockTimeLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  clockTimeValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  clockBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  clockBtnIn: { backgroundColor: COLORS.primary },
  clockBtnOut: { backgroundColor: '#ef4444' },
  clockBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  clockGpsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  clockGpsText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 6 },
  
  // Client Selector
  clientSelector: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 16 },
  clientSelectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientSelectorTitle: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 1 },
  clientSelectorName: { fontSize: 20, fontWeight: '600', color: COLORS.white, marginTop: 4 },
  clientSelectorChevron: { padding: 8 },
  clientListModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  clientListContent: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  clientListTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 20 },
  clientCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  clientCardActive: { borderWidth: 2, borderColor: COLORS.primary },
  clientAvatar: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  clientCondition: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  clientTasksRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  clientTasksText: { fontSize: 13, color: COLORS.primary },
  clientRiskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  clientRiskLow: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  clientRiskModerate: { backgroundColor: 'rgba(234, 179, 8, 0.2)' },
  clientRiskHigh: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  clientRiskText: { fontSize: 11, fontWeight: '600' },
  
  // Medication Screen
  medContainer: { flex: 1, backgroundColor: COLORS.background },
  medScrollContent: { paddingBottom: 30 },
  medHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  medTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  medSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  medSummaryCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  medSummaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  medSummaryStat: { alignItems: 'center' },
  medSummaryValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  medSummaryValueGreen: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  medSummaryLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  medScheduleHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  medScheduleTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 10 },
  medCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16 },
  medCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medCardLeft: { flexDirection: 'row', alignItems: 'center' },
  medIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  medCardInfo: {},
  medCardName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  medCardDosage: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  medCardTime: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  medCardTimeText: { fontSize: 13, color: COLORS.textMuted, marginLeft: 4 },
  medCardStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  medStatusPending: { backgroundColor: 'rgba(234, 179, 8, 0.2)' },
  medStatusGiven: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  medStatusMissed: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  medStatusText: { fontSize: 12, fontWeight: '600' },
  medGiveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, marginTop: 12, alignItems: 'center' },
  medGiveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  
  // Performance Score Card (for Family)
  perfCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  perfTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  perfScoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  perfScoreText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginLeft: 6 },
  perfMetricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  perfMetric: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  perfMetricValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  perfMetricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  perfDivider: { width: 1, backgroundColor: COLORS.cardBorder },
  
  // Daily Summary Card (for Family)
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  summaryDate: { fontSize: 14, color: COLORS.textSecondary },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  summaryGridItem: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
  summaryGridCard: { backgroundColor: COLORS.cardBorder, borderRadius: 12, padding: 14, alignItems: 'center' },
  summaryGridValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  summaryGridLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  summaryHighlights: { marginTop: 8 },
  summaryHighlightTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 8 },
  summaryHighlightItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  summaryHighlightText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8, flex: 1 },
  
  // Weekly Report
  weeklyCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  weeklyHeader: { marginBottom: 16 },
  weeklyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  weeklyPeriod: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  weeklyScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  weeklyScoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  weeklyScoreValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  weeklyScoreLabel: { fontSize: 12, color: COLORS.textSecondary },
  weeklyStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  weeklyStat: { alignItems: 'center' },
  weeklyStatValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  weeklyStatLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  weeklyMissedSection: { backgroundColor: COLORS.cardBorder, borderRadius: 12, padding: 12, marginTop: 8 },
  weeklyMissedTitle: { fontSize: 14, fontWeight: '600', color: '#f87171', marginBottom: 8 },
  weeklyMissedItem: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  
  // Care Plan Screen (for Family)
  carePlanContainer: { flex: 1, backgroundColor: COLORS.background },
  carePlanScrollContent: { paddingBottom: 30 },
  carePlanHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  carePlanTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  carePlanSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  carePlanSection: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 20 },
  carePlanSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 12 },
  carePlanGoal: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  carePlanGoalText: { fontSize: 15, color: COLORS.white, marginLeft: 10, flex: 1 },
  carePlanMedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  carePlanMedName: { fontSize: 16, fontWeight: '500', color: COLORS.white },
  carePlanMedDetails: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  carePlanMedTime: { fontSize: 14, color: COLORS.primary },
  carePlanRestriction: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  carePlanRestrictionText: { fontSize: 14, color: '#f87171', marginLeft: 8 },
  carePlanEmergency: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 12, padding: 14 },
  carePlanEmergencyText: { fontSize: 14, color: '#f87171', lineHeight: 20 },
  
  // Emergency Alert Banner
  emergencyBanner: { backgroundColor: '#7f1d1d', borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  emergencyIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emergencyContent: { flex: 1 },
  emergencyTitle: { fontSize: 16, fontWeight: '600', color: '#fca5a5' },
  emergencyMessage: { fontSize: 14, color: '#fecaca', marginTop: 4 },
  emergencyDismiss: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ef4444', borderRadius: 8 },
  emergencyDismissText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  
  // GPS Toggle
  gpsToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  gpsToggleLabel: { fontSize: 15, color: COLORS.white },
  gpsToggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  gpsToggleBtnOn: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: COLORS.primary },
  gpsToggleBtnOff: { backgroundColor: COLORS.cardBorder, borderColor: COLORS.cardBorder },
  gpsToggleText: { fontSize: 14, marginLeft: 6 },
  
  // Video/Audio Evidence
  evidenceRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  evidenceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardBorder, borderRadius: 12, paddingVertical: 14, marginHorizontal: 6 },
  evidenceBtnText: { fontSize: 15, color: COLORS.white, marginLeft: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Patient Card
  patientCard: { marginHorizontal: 16, marginTop: 50, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.card },
  patientImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  patientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 60 },
  patientInfo: {},
  patientName: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, marginBottom: 2 },
  patientAge: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  patientChevron: { marginBottom: 8 },

  // Vitals
  vitalsContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  vitalCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' },
  vitalIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  vitalValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  vitalLabel: { fontSize: 13, color: COLORS.textSecondary },

  // History Banner
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.historyBannerBg,
    borderWidth: 1,
    borderColor: COLORS.historyBannerBorder,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
  },
  historyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.historyIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBannerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.historyText, letterSpacing: 0.5 },
  historyBannerDate: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginTop: 2 },
  backToTodayBtn: {
    backgroundColor: COLORS.historyButtonBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backToTodayText: { fontSize: 15, fontWeight: '600', color: COLORS.background },

  // Progress
  progressSection: { marginHorizontal: 16, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 18, fontWeight: '500', color: COLORS.white },
  progressCount: { fontSize: 16, color: COLORS.textSecondary },
  progressBarBg: { height: 6, backgroundColor: COLORS.card, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  // Completed Tasks Header
  completedTasksHeader: { marginHorizontal: 16, marginTop: 28, marginBottom: 16 },
  completedTasksTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },

  // Tab Container
  tabContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 28, marginBottom: 16 },
  tabItem: { position: 'relative', paddingVertical: 8, paddingHorizontal: 4 },
  tabBadge: { position: 'absolute', top: -14, right: -5, backgroundColor: COLORS.badgeRed, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  tabText: { fontSize: 18, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white, fontWeight: '600' },
  tabDivider: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16 },

  // Task List
  taskList: { paddingHorizontal: 16 },
  taskCard: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden', flexDirection: 'row' },
  taskCardExpanded: { flexDirection: 'column' },
  taskPriorityBar: { width: 5, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  taskContent: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskTime: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
  photoBadgeText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
  taskChevronContainer: { justifyContent: 'center', paddingRight: 12 },
  taskChevronCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  // Task Expanded Content
  taskExpandedContent: { marginTop: 16 },
  taskInstructionsBox: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 12 },
  taskInstructionsLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  taskInstructionsText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  taskTimeWindowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  taskTimeWindowLabel: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 8 },
  taskTimeWindowValue: { fontSize: 13, fontWeight: '600', color: COLORS.white, marginLeft: 8 },
  startTaskBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  startTaskBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.white },

  // Completed Task on Dashboard
  taskCardCompleted: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  taskContentCompleted: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitleCompleted: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textDecorationLine: 'line-through', marginBottom: 6 },
  taskNotesPreview: { fontSize: 14, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 6 },
  completedPhotoContainer: { justifyContent: 'center', paddingRight: 12, position: 'relative' },
  completedPhotoThumb: { width: 60, height: 60, borderRadius: 10 },
  completedPhotoOverlay: { position: 'absolute', bottom: 4, right: 16, width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center' },

  // Can't Complete Task on Dashboard
  taskCardCantComplete: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  taskContentCantComplete: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  taskTitleCantComplete: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  cantCompleteReasonRow: { flexDirection: 'row', alignItems: 'center' },
  cantCompleteReasonText: { fontSize: 14, color: COLORS.critical, marginLeft: 6 },
  cantCompleteCloseBtn: { justifyContent: 'center', paddingRight: 16 },

  // Task Detail Modal
  taskModalContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  taskModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  taskModalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, flex: 1 },
  taskModalClose: { padding: 4 },

  // Mode Toggle
  modeToggleContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 12 },
  modeToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, paddingVertical: 14, borderRadius: 12, gap: 8 },
  modeToggleBtnActive: { backgroundColor: COLORS.primary },
  modeToggleBtnCantComplete: { backgroundColor: COLORS.confirmBtn },
  modeToggleText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  modeToggleTextActive: { color: COLORS.white },

  // Instructions Card in Modal
  instructionsCard: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 20 },
  instructionsLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.5 },
  instructionsText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },

  // Photo Evidence Section
  photoEvidenceSection: { marginHorizontal: 16, marginBottom: 20 },
  photoEvidenceLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  photoUploadBox: { borderWidth: 2, borderColor: COLORS.cardBorder, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  photoUploadText: { fontSize: 17, color: COLORS.textSecondary, marginTop: 12 },
  photoUploadSubtext: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  photoPreviewContainer: { position: 'relative' },
  photoPreview: { width: '100%', height: 200, borderRadius: 16 },
  photoRemoveBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center' },

  // Notes Section
  notesSection: { marginHorizontal: 16, marginBottom: 20 },
  notesLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  notesInput: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, fontSize: 16, color: COLORS.white, minHeight: 100, borderWidth: 2, borderColor: 'transparent' },
  notesInputComplete: { borderColor: COLORS.primary },
  notesInputCantComplete: { borderColor: COLORS.confirmBtn },

  // Can't Complete Section
  cantCompleteSection: { marginHorizontal: 16, marginBottom: 20 },
  cantCompleteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cantCompleteLabel: { fontSize: 12, fontWeight: '600', color: COLORS.confirmBtn, marginLeft: 8, letterSpacing: 0.5 },
  cantCompleteOption: { backgroundColor: COLORS.card, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  cantCompleteOptionSelected: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: COLORS.confirmBtn },
  cantCompleteOptionText: { fontSize: 16, color: COLORS.textSecondary },
  cantCompleteOptionTextSelected: { color: COLORS.confirmBtn, fontWeight: '500' },

  // Task Modal Bottom
  taskModalBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 34, backgroundColor: COLORS.background },
  completeTaskBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 14, gap: 10 },
  completeTaskBtnDisabled: { backgroundColor: COLORS.cardBorder },
  completeTaskBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  submitReportBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.confirmBtn, paddingVertical: 18, borderRadius: 14 },
  submitReportBtnDisabled: { backgroundColor: COLORS.cardBorder },
  submitReportBtnText: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  submitReportBtnTextDisabled: { color: COLORS.textMuted },

  // Completed Task Card
  completedTaskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  completedTaskBar: { width: 5, backgroundColor: COLORS.primary, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  completedTaskContent: { flex: 1, paddingVertical: 18, paddingLeft: 16, paddingRight: 8 },
  completedTaskTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textDecorationLine: 'line-through', marginBottom: 6 },
  completedTaskMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  completedTaskTime: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  completedTaskNotes: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic' },
  completedTaskPhotoContainer: { justifyContent: 'center', paddingRight: 12, position: 'relative' },
  completedTaskPhoto: { width: 70, height: 70, borderRadius: 12 },
  galleryIconBtn: {
    position: 'absolute',
    bottom: 20,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Request Card
  requestCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  requestBorder: {
    width: 5,
    backgroundColor: COLORS.requestBorder,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  requestContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTime: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  requestRequester: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  requestDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 22,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.acceptBtn,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  declineButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Decline Reasons
  declineReasonsContainer: {
    marginTop: 4,
  },
  selectReasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  declineReasonOption: {
    backgroundColor: COLORS.declineReasonBg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  declineReasonSelected: {
    backgroundColor: COLORS.declineReasonSelected,
    borderColor: COLORS.declineReasonSelectedBorder,
  },
  declineReasonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  declineReasonTextSelected: {
    color: COLORS.declineReasonText,
    fontWeight: '500',
  },
  declineActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.confirmBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.confirmBtnDisabled,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  confirmButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 12,
  },

  // Calendar FAB
  calendarFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.fabBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Tab Bar
  tabBar: { backgroundColor: COLORS.card, borderTopWidth: 0, height: 88, paddingTop: 8, paddingBottom: 28 },
  tabBarLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  shiftsIconContainer: { position: 'relative' },
  shiftsDot: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },

  // Placeholder
  placeholderScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 18, color: COLORS.textSecondary, marginTop: 12 },

  // ===== VITAL SIGNS MODAL =====
  vitalModalContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  vitalModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  vitalModalTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  vitalModalClose: { padding: 4 },

  currentReadingCard: {
    backgroundColor: COLORS.vitalCardBg,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  currentReadingIconBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(190, 24, 93, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentReadingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  currentReadingLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Chart
  chartWrapper: {
    backgroundColor: COLORS.chartBg,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  chartContainer: {
    height: 220,
    position: 'relative',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chartGrid: {
    position: 'absolute',
    top: 20,
    left: 35,
    right: 10,
    bottom: 30,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.chartLine,
    borderStyle: 'dashed',
  },
  verticalGridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderWidth: 1,
    borderColor: COLORS.chartLine,
    borderStyle: 'dashed',
  },
  chartArea: {
    position: 'absolute',
    top: 20,
    right: 10,
    bottom: 30,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPointTouchable: {
    position: 'absolute',
    width: 30,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltip: {
    position: 'absolute',
    left: -40,
    alignItems: 'center',
  },
  tooltipVerticalLine: {
    position: 'absolute',
    width: 1,
    height: 200,
    backgroundColor: COLORS.white,
    opacity: 0.3,
    top: 60,
  },
  tooltipContent: {
    backgroundColor: 'rgba(60, 60, 60, 0.95)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tooltipDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  tooltipDiastolic: {
    fontSize: 13,
    color: COLORS.diastolicColor,
    marginBottom: 2,
  },
  tooltipSystolic: {
    fontSize: 13,
    color: COLORS.systolicColor,
  },
  xAxisContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  weeklyTrendLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  // Log New Reading
  logNewReadingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    gap: 8,
  },
  logNewReadingText: {
    fontSize: 17,
    color: COLORS.textSecondary,
  },
  logFormContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  logFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  logFormInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  logFormInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.white,
  },
  logFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logFormCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.declineBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logFormCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },
  logFormSaveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.acceptBtn,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logFormSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Recent History
  recentHistoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  recentHistoryList: {
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  historyItemTime: {
    fontSize: 16,
    color: COLORS.white,
  },
  historyItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // ===== PATIENT PROFILE MODAL =====
  profileContainer: { flex: 1, backgroundColor: COLORS.background },
  profileHero: { height: 280, position: 'relative' },
  profileHeroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeButton: { position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  cameraButton: { position: 'absolute', top: 50, right: 66, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(60, 60, 60, 0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  profileHeroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 40, zIndex: 5 },
  profileName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  profileMeta: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  profileContent: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: COLORS.background },
  careHistoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.careHistoryBg, borderRadius: 16, padding: 16, marginBottom: 16 },
  careHistoryIconBg: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(34, 197, 94, 0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  careHistoryInfo: { flex: 1 },
  careHistoryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.careHistoryLight, marginBottom: 2 },
  careHistoryDate: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  allergiesCard: { backgroundColor: COLORS.allergyBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.allergyBorder, padding: 18, marginBottom: 16 },
  allergiesTitle: { fontSize: 18, fontWeight: '600', color: COLORS.allergyText, marginLeft: 10 },
  allergyTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 },
  allergyTag: { backgroundColor: COLORS.allergyTagBg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  allergyTagText: { fontSize: 15, fontWeight: '500', color: COLORS.allergyText },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginLeft: 10 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bulletDot: { fontSize: 18, color: COLORS.textSecondary, marginRight: 10, lineHeight: 22 },
  bulletText: { fontSize: 16, color: COLORS.textSecondary, flex: 1, lineHeight: 22 },
  medicationItem: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  medicationName: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  medicationDetails: { fontSize: 16, color: COLORS.textSecondary },
  statusRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  codeStatusCard: { flex: 1, backgroundColor: COLORS.codeStatusBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.codeStatusBorder, padding: 18, alignItems: 'center' },
  codeStatusLabel: { fontSize: 12, fontWeight: '600', color: COLORS.codeStatusText, marginTop: 10, letterSpacing: 0.5 },
  codeStatusValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },
  mobilityCard: { flex: 1, backgroundColor: COLORS.mobilityBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.mobilityBorder, padding: 18, alignItems: 'center' },
  mobilityLabel: { fontSize: 12, fontWeight: '600', color: COLORS.mobilityText, marginTop: 10, letterSpacing: 0.5 },
  mobilityValue: { fontSize: 17, fontWeight: '600', color: COLORS.white, marginTop: 4, textAlign: 'center' },
  accessText: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: '600', color: COLORS.white },
  contactRelation: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  callButtonGreen: { backgroundColor: COLORS.callBtnGreen, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  callButtonBlue: { backgroundColor: COLORS.callBtnBlue, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  callButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  contactDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 16 },
  physicianLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 12, letterSpacing: 0.5 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.shareBtn, borderRadius: 14, paddingVertical: 18, gap: 10 },
  shareButtonText: { fontSize: 17, fontWeight: '600', color: COLORS.white },

  // ===== CARE HISTORY CALENDAR MODAL =====
  calendarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  calendarModal: { backgroundColor: COLORS.card, borderRadius: 24, padding: 24, width: SCREEN_WIDTH - 32, maxHeight: '85%' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calendarTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  calendarCloseBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  calendarSubtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthNavBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  monthYearText: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  calendarDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginBottom: 16 },
  weekdayRow: { flexDirection: 'row', marginBottom: 8 },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calendarDayToday: { backgroundColor: COLORS.primary, borderRadius: 12 },
  calendarDayText: { fontSize: 17, color: COLORS.white },
  calendarDayTextToday: { color: COLORS.white, fontWeight: 'bold' },
  calendarDayTextMuted: { fontSize: 17, color: COLORS.textMuted },
  calendarDayTextFuture: { color: COLORS.textMuted },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, position: 'absolute', bottom: 6 },
  calendarFooter: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 20 },
});

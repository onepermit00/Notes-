// ADLTrack - Complete Expo Snack Version
// EXACT REPLICA of Web App
// Copy this entire file to: https://snack.expo.dev

import React, { useState, createContext, useContext, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  Switch,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const colors = {
  dark: {
    background: '#0c0a09',
    card: '#1c1917',
    cardHover: '#292524',
    text: '#ffffff',
    textSecondary: '#a8a29e',
    textMuted: '#78716c',
    border: '#44403c',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#2d1f1f',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    amber: '#f59e0b',
  },
  light: {
    background: '#ffffff',
    card: '#ffffff',
    cardHover: '#f5f5f4',
    text: '#1c1917',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#fef2f2',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    amber: '#f59e0b',
  },
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? colors.dark : colors.light;
  const toggleTheme = () => setIsDark(!isDark);
  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// ============ AUTH CONTEXT ============
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ============ COMPREHENSIVE MOCK DATA ============
const PATIENT = {
  id: 'patient-1',
  name: 'David Smith',
  age: 78,
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'],
  allergies: ['Penicillin', 'Shellfish'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ],
  emergencyContact: {
    name: 'Mary Smith',
    relationship: 'Daughter',
    phone: '(555) 234-5678',
  },
  dietaryRestrictions: ['Low sodium', 'Diabetic diet'],
  mobilityStatus: 'Uses walker for ambulation',
};

const CAREGIVER = {
  id: 'caregiver-1',
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
  certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
  rating: 4.9,
  shiftsCompleted: 234,
};

// Full task list matching web app
const TASKS = [
  {
    id: '1',
    title: 'Morning Medication',
    description: 'Administer prescribed medications with breakfast',
    instructions: 'Give 2 tablets of Metformin with food. Ensure patient drinks full glass of water.',
    scheduledTime: '08:00 AM',
    timeWindow: '7:30 AM - 9:00 AM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '2',
    title: 'Breakfast Assistance',
    description: 'Help with breakfast preparation and eating',
    instructions: 'Prepare oatmeal with fruit. Assist with eating if needed. Monitor food intake.',
    scheduledTime: '08:30 AM',
    timeWindow: '8:00 AM - 9:30 AM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '3',
    title: 'Morning Walk',
    description: '15-minute assisted walk around the house',
    instructions: 'Use walker for support. Take breaks as needed. Watch for signs of fatigue.',
    scheduledTime: '10:00 AM',
    timeWindow: '9:30 AM - 11:00 AM',
    priority: 'quality',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '4',
    title: 'Blood Pressure Check',
    description: 'Take and record blood pressure reading',
    instructions: 'Patient should be seated and rested for 5 minutes before taking reading.',
    scheduledTime: '10:30 AM',
    timeWindow: '10:00 AM - 11:30 AM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '5',
    title: 'Hydration Check',
    description: 'Ensure patient drinks water',
    instructions: 'Offer 8oz glass of water. Track fluid intake.',
    scheduledTime: '11:00 AM',
    timeWindow: '10:30 AM - 12:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '6',
    title: 'Lunch Preparation',
    description: 'Prepare and serve lunch',
    instructions: 'Follow dietary restrictions. Ensure soft foods for easier eating.',
    scheduledTime: '12:00 PM',
    timeWindow: '11:30 AM - 1:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '7',
    title: 'Afternoon Medication',
    description: 'Administer afternoon medications',
    instructions: 'Give blood pressure medication with lunch. Check for any adverse reactions.',
    scheduledTime: '12:30 PM',
    timeWindow: '12:00 PM - 1:30 PM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '8',
    title: 'Rest Period',
    description: 'Assist with afternoon rest',
    instructions: 'Help patient to bed for afternoon nap. Ensure comfortable position.',
    scheduledTime: '2:00 PM',
    timeWindow: '1:30 PM - 3:00 PM',
    priority: 'quality',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '9',
    title: 'Physical Therapy Exercises',
    description: 'Guide through prescribed exercises',
    instructions: 'Follow PT protocol sheet. 10 reps of each exercise. Stop if patient reports pain.',
    scheduledTime: '3:30 PM',
    timeWindow: '3:00 PM - 4:30 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
  {
    id: '10',
    title: 'Evening Medication',
    description: 'Administer evening medications',
    instructions: 'Give heart medication and vitamins. Ensure taken with food.',
    scheduledTime: '5:00 PM',
    timeWindow: '4:30 PM - 6:00 PM',
    priority: 'critical',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '11',
    title: 'Dinner Service',
    description: 'Prepare and serve dinner',
    instructions: 'Prepare balanced meal according to dietary plan. Assist with eating as needed.',
    scheduledTime: '6:00 PM',
    timeWindow: '5:30 PM - 7:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: true,
  },
  {
    id: '12',
    title: 'Bedtime Routine',
    description: 'Assist with bedtime preparation',
    instructions: 'Help with brushing teeth, changing into pajamas. Ensure bedroom is comfortable.',
    scheduledTime: '8:00 PM',
    timeWindow: '7:30 PM - 9:00 PM',
    priority: 'standard',
    status: 'pending',
    requiresPhoto: false,
  },
];

// Proposed tasks from family
const PROPOSED_TASKS = [
  {
    id: 'p1',
    title: 'Extra Walk in Garden',
    description: 'Take a short walk in the backyard garden',
    instructions: 'Weather permitting, help David walk to see the flowers. He enjoys this.',
    scheduledTime: '4:00 PM',
    priority: 'quality',
    status: 'proposed',
    requiresPhoto: true,
    proposedBy: 'Mary Smith (Daughter)',
  },
  {
    id: 'p2',
    title: 'Video Call with Grandchildren',
    description: 'Help set up tablet for video call',
    instructions: 'The grandkids want to say hi! Help David use the tablet to video call.',
    scheduledTime: '5:30 PM',
    priority: 'quality',
    status: 'proposed',
    requiresPhoto: false,
    proposedBy: 'Tom Smith (Son)',
  },
];

const VITALS = {
  bloodPressure: [
    { date: 'Mon', systolic: 122, diastolic: 78, time: '10:30 AM' },
    { date: 'Tue', systolic: 118, diastolic: 76, time: '10:15 AM' },
    { date: 'Wed', systolic: 125, diastolic: 80, time: '10:45 AM' },
    { date: 'Thu', systolic: 120, diastolic: 77, time: '10:30 AM' },
    { date: 'Fri', systolic: 119, diastolic: 75, time: '10:20 AM' },
    { date: 'Sat', systolic: 121, diastolic: 78, time: '10:35 AM' },
    { date: 'Sun', systolic: 120, diastolic: 76, time: '10:30 AM' },
  ],
  heartRate: [
    { date: 'Mon', value: 72, time: '10:30 AM' },
    { date: 'Tue', value: 68, time: '10:15 AM' },
    { date: 'Wed', value: 75, time: '10:45 AM' },
    { date: 'Thu', value: 70, time: '10:30 AM' },
    { date: 'Fri', value: 71, time: '10:20 AM' },
    { date: 'Sat', value: 69, time: '10:35 AM' },
    { date: 'Sun', value: 72, time: '10:30 AM' },
  ],
  temperature: [
    { date: 'Mon', value: 98.4, time: '10:30 AM' },
    { date: 'Tue', value: 98.6, time: '10:15 AM' },
    { date: 'Wed', value: 98.2, time: '10:45 AM' },
    { date: 'Thu', value: 98.5, time: '10:30 AM' },
    { date: 'Fri', value: 98.7, time: '10:20 AM' },
    { date: 'Sat', value: 98.4, time: '10:35 AM' },
    { date: 'Sun', value: 98.6, time: '10:30 AM' },
  ],
  pain: [
    { date: 'Mon', value: 2, time: '10:30 AM' },
    { date: 'Tue', value: 3, time: '10:15 AM' },
    { date: 'Wed', value: 2, time: '10:45 AM' },
    { date: 'Thu', value: 1, time: '10:30 AM' },
    { date: 'Fri', value: 2, time: '10:20 AM' },
    { date: 'Sat', value: 2, time: '10:35 AM' },
    { date: 'Sun', value: 1, time: '10:30 AM' },
  ],
};

const INCIDENTS = [
  {
    id: 1,
    type: 'fall',
    severity: 'low',
    title: 'Minor Fall in Bathroom',
    description: 'Patient slipped while getting out of shower. No visible injuries.',
    actionsTaken: 'Helped patient up, checked for injuries, monitored for 30 minutes.',
    photos: [],
    status: 'resolved',
    createdAt: '2025-01-15T14:30:00Z',
    createdBy: 'Julia Martinez',
    notifyFamily: true,
  },
  {
    id: 2,
    type: 'behavioral',
    severity: 'medium',
    title: 'Increased Confusion Episode',
    description: 'Patient showed signs of confusion about time and location this afternoon.',
    actionsTaken: 'Reoriented patient, stayed calm, documented episode duration.',
    photos: [],
    status: 'open',
    createdAt: '2025-01-16T16:45:00Z',
    createdBy: 'Julia Martinez',
    notifyFamily: true,
  },
];

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: 'alert-circle', color: '#f43f5e' },
  { id: 'medication', label: 'Medication Issue', icon: 'medical', color: '#f97316' },
  { id: 'behavioral', label: 'Behavioral Change', icon: 'brain', color: '#8b5cf6' },
  { id: 'injury', label: 'Injury', icon: 'bandage', color: '#ef4444' },
  { id: 'vital', label: 'Vital Sign Concern', icon: 'thermometer', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: 'help-circle', color: '#78716c' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#f97316' },
  { id: 'critical', label: 'Critical', color: '#f43f5e' },
];

// ============ LANDING SCREEN ============
const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.landingContainer}>
      <LinearGradient colors={['#ffffff', '#f0fdf4', '#dcfce7']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.landingHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>ADLTrack</Text>
          </View>
          <TouchableOpacity style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>Simple. Secure.</Text>
          <Text style={styles.taglineAccent}>Reliable Care.</Text>
          <Text style={styles.heroDesc}>
            The caregiving coordination app that brings families, caregivers, and agencies together.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {[
            { icon: 'checkmark-circle', title: 'Task Management', desc: 'Track daily care' },
            { icon: 'heart', title: 'Vitals Monitoring', desc: 'Health data' },
            { icon: 'chatbubbles', title: 'Communication', desc: 'Stay connected' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={24} color="#25D366" />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#25D366" />
          <Text style={styles.trustText}>HIPAA Compliant & Secure</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ============ ROLE SELECTION ============
const RoleSelectionScreen = ({ navigation }) => {
  const { setIsDark } = useTheme();
  
  const roles = [
    { id: 'caregiver', title: 'Caregiver', desc: 'Professional caregivers managing patient care', icon: 'heart-circle', color: '#25D366', dark: true },
    { id: 'family', title: 'Family Member', desc: 'Family guardians monitoring loved ones', icon: 'people', color: '#3b82f6', dark: false },
    { id: 'agency', title: 'Agency', desc: 'Healthcare agencies managing staff', icon: 'business', color: '#8b5cf6', dark: false },
  ];

  const selectRole = (role) => {
    setIsDark(role.dark);
    navigation.navigate('Auth', { role: role.id });
  };

  return (
    <SafeAreaView style={styles.roleContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1c1917" />
      </TouchableOpacity>
      <Text style={styles.roleTitle}>Choose Your Role</Text>
      <Text style={styles.roleSubtitle}>Select how you'll be using ADLTrack</Text>
      
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => selectRole(role)}
          >
            <View style={[styles.roleIcon, { backgroundColor: `${role.color}15` }]}>
              <Ionicons name={role.icon} size={32} color={role.color} />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleCardTitle}>{role.title}</Text>
              <Text style={styles.roleCardDesc}>{role.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#a8a29e" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.roleFooter}>
        <Text style={styles.roleFooterText}>You can switch roles anytime from settings</Text>
      </View>
    </SafeAreaView>
  );
};

// ============ AUTH SCREEN ============
const AuthScreen = ({ navigation, route }) => {
  const { login } = useAuth();
  const { setIsDark } = useTheme();
  const role = route.params?.role || 'caregiver';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const roleConfig = {
    caregiver: { title: 'Caregiver', color: '#25D366' },
    family: { title: 'Family Member', color: '#3b82f6' },
    agency: { title: 'Agency', color: '#8b5cf6' },
  };

  const config = roleConfig[role];

  const handleLogin = () => {
    setIsDark(role === 'caregiver');
    login({ name: 'Julia Martinez', role, photo: CAREGIVER.photo });
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1c1917" />
        </TouchableOpacity>
        
        <View style={[styles.roleTag, { backgroundColor: `${config.color}15` }]}>
          <Text style={[styles.roleTagText, { color: config.color }]}>{config.title}</Text>
        </View>
        
        <Text style={styles.authTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.authSubtitle}>{isSignUp ? 'Sign up to start managing care' : 'Sign in to continue'}</Text>

        <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
          <Ionicons name="logo-google" size={20} color="#1c1917" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}>
          <Ionicons name="logo-apple" size={20} color="#1c1917" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#a8a29e"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#a8a29e"
        />

        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: config.color }]} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.toggleAuth}>
          <Text style={styles.toggleAuthText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.toggleAuthLink, { color: config.color }]}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ TASK CARD COMPONENT ============
const TaskCard = ({ task, onToggle, onStart, isExpanded, theme }) => {
  const isCompleted = task.status === 'completed';
  
  const priorityColors = {
    critical: '#f43f5e',
    standard: '#3b82f6',
    quality: '#25D366',
    low: '#78716c',
  };
  
  const stripeColor = isCompleted ? '#25D366' : (priorityColors[task.priority] || '#3b82f6');

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => !isCompleted && onToggle && onToggle(task.id)}
      activeOpacity={0.7}
    >
      {/* Priority Stripe */}
      <View style={[styles.taskStripe, { backgroundColor: stripeColor }]} />
      
      <View style={styles.taskContent}>
        <View style={styles.taskMain}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle, 
              { color: theme.text },
              isCompleted && styles.taskTitleCompleted
            ]}>
              {task.title}
            </Text>
          </View>
          
          <View style={styles.taskMeta}>
            <View style={styles.taskTimeRow}>
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.taskTime, { color: theme.textSecondary }]}>
                {task.scheduledTime}
              </Text>
            </View>
            {task.requiresPhoto && !isCompleted && (
              <View style={[styles.photoBadge, { backgroundColor: theme.cardHover }]}>
                <Ionicons name="camera" size={12} color={theme.textSecondary} />
                <Text style={[styles.photoBadgeText, { color: theme.textSecondary }]}>Photo</Text>
              </View>
            )}
          </View>
          
          {isCompleted && task.completionNote && (
            <Text style={[styles.taskNote, { color: theme.textMuted }]}>
              "{task.completionNote}"
            </Text>
          )}
        </View>
        
        <View style={styles.taskRight}>
          {task.evidenceUrl && (
            <Image source={{ uri: task.evidenceUrl }} style={styles.taskPhoto} />
          )}
          {!isCompleted && (
            <View style={[styles.taskExpandIcon, { borderColor: theme.border }]}>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={theme.textMuted} 
              />
            </View>
          )}
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && !isCompleted && (
        <View style={[styles.taskExpanded, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={styles.taskExpandedSection}>
            <Text style={[styles.taskExpandedLabel, { color: theme.textMuted }]}>INSTRUCTIONS</Text>
            <Text style={[styles.taskExpandedText, { color: theme.textSecondary }]}>
              {task.instructions || task.description}
            </Text>
          </View>
          
          <View style={styles.taskExpandedSection}>
            <Text style={[styles.taskExpandedLabel, { color: theme.textMuted }]}>TIME WINDOW</Text>
            <Text style={[styles.taskExpandedText, { color: theme.textSecondary }]}>
              {task.timeWindow}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startTaskBtn}
            onPress={() => onStart && onStart(task)}
          >
            <Text style={styles.startTaskBtnText}>Start Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============ TASK REQUEST CARD ============
const TaskRequestCard = ({ task, onAccept, onDecline, theme }) => (
  <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={[styles.requestStripe, { backgroundColor: '#25D366' }]} />
    
    <View style={styles.requestContent}>
      <View style={styles.requestHeader}>
        <View style={[styles.requestBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.requestBadgeText, { color: theme.primary }]}>REQUEST</Text>
        </View>
        <Text style={[styles.requestTime, { color: theme.textSecondary }]}>{task.scheduledTime}</Text>
      </View>
      
      <Text style={[styles.requestTitle, { color: theme.text }]}>{task.title}</Text>
      <Text style={[styles.requestDesc, { color: theme.textSecondary }]}>{task.description}</Text>
      <Text style={[styles.requestBy, { color: theme.textMuted }]}>From: {task.proposedBy}</Text>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestDeclineBtn, { borderColor: theme.border }]}
          onPress={() => onDecline && onDecline(task.id)}
        >
          <Text style={[styles.requestDeclineText, { color: theme.textSecondary }]}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestAcceptBtn}
          onPress={() => onAccept && onAccept(task.id)}
        >
          <Text style={styles.requestAcceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ============ HOME SCREEN - CAREGIVER ============
const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks] = useState(TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const latestBP = VITALS.bloodPressure[VITALS.bloodPressure.length - 1];
  const latestHR = VITALS.heartRate[VITALS.heartRate.length - 1];
  const latestTemp = VITALS.temperature[VITALS.temperature.length - 1];
  const latestPain = VITALS.pain[VITALS.pain.length - 1];

  const startShift = () => {
    setIsShiftActive(true);
    setShiftStartTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  };

  const toggleTask = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
  };

  const handleCompleteTask = (note) => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, status: 'completed', completionNote: note, completedAt: new Date().toLocaleTimeString() }
          : t
      ));
      setSelectedTask(null);
      setExpandedTaskId(null);
    }
  };

  const handleAcceptRequest = (id) => {
    const request = proposedTasks.find(t => t.id === id);
    if (request) {
      setTasks([...tasks, { ...request, status: 'pending' }]);
      setProposedTasks(proposedTasks.filter(t => t.id !== id));
    }
  };

  const handleDeclineRequest = (id) => {
    setProposedTasks(proposedTasks.filter(t => t.id !== id));
  };

  // Offline State - Start Shift Screen
  if (!isShiftActive) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.offlineContainer}>
          {/* Caregiver Header */}
          <View style={styles.offlineHeader}>
            <Image source={{ uri: CAREGIVER.photo }} style={styles.caregiverPhoto} />
            <View>
              <Text style={[styles.greeting, { color: theme.textMuted }]}>Good morning,</Text>
              <Text style={[styles.caregiverName, { color: theme.text }]}>Julia</Text>
            </View>
          </View>

          {/* Patient Card */}
          <TouchableOpacity 
            style={[styles.patientCardOffline, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowPatientProfile(true)}
          >
            <Text style={[styles.patientCardLabel, { color: theme.textMuted }]}>Ready to care for</Text>
            <View style={styles.patientCardRow}>
              <Image source={{ uri: PATIENT.photo }} style={styles.patientPhotoLarge} />
              <View style={styles.patientCardInfo}>
                <Text style={[styles.patientName, { color: theme.text }]}>{PATIENT.name}</Text>
                <Text style={[styles.patientAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Start Shift Section */}
          <View style={styles.startShiftSection}>
            <Text style={[styles.offlineText, { color: theme.textMuted }]}>You're offline</Text>
            <Text style={[styles.startShiftTitle, { color: theme.text }]}>Tap to start your shift</Text>
            
            <TouchableOpacity style={styles.goButton} onPress={startShift}>
              <View style={styles.goButtonPulse} />
              <LinearGradient
                colors={['#f43f5e', '#e11d48']}
                style={styles.goButtonInner}
              >
                <Ionicons name="play" size={48} color="#ffffff" style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={[styles.tasksScheduled, { color: theme.textMuted }]}>
              {tasks.length} tasks scheduled for today
            </Text>
          </View>
        </View>

        {/* Patient Profile Modal */}
        <PatientProfileModal 
          visible={showPatientProfile} 
          onClose={() => setShowPatientProfile(false)} 
          theme={theme}
        />
      </SafeAreaView>
    );
  }

  // Online State - Full Dashboard
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Photo Header with Vitals */}
        <View style={styles.patientHeaderContainer}>
          <Image source={{ uri: PATIENT.photo }} style={styles.patientHeaderPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(12,10,9,0.6)', 'rgba(12,10,9,0.95)']}
            style={styles.patientHeaderGradient}
          />
          
          <TouchableOpacity 
            style={styles.patientHeaderInfo}
            onPress={() => setShowPatientProfile(true)}
          >
            <View>
              <Text style={styles.patientHeaderName}>{PATIENT.name}</Text>
              <Text style={styles.patientHeaderAge}>{PATIENT.age} years old</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Vitals Grid - Overlapping */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalsGrid}>
            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(244,63,94,0.2)' }]}>
                <Ionicons name="heart" size={18} color="#f43f5e" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>
                {latestBP.systolic}/{latestBP.diastolic}
              </Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>BP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                <Ionicons name="pulse" size={18} color="#f97316" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestHR.value}</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Heart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                <Ionicons name="thermometer" size={18} color="#3b82f6" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestTemp.value}°</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Temp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowVitals(true)}
            >
              <View style={[styles.vitalIcon, { backgroundColor: 'rgba(139,92,246,0.2)' }]}>
                <Ionicons name="sad-outline" size={18} color="#8b5cf6" />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>{latestPain.value}/10</Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Pain</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: theme.text }]}>{completedCount}/{tasks.length}</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardHover }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }
              ]} 
            />
          </View>
        </View>

        {/* Task Tabs */}
        <View style={styles.taskTabs}>
          <TouchableOpacity onPress={() => setActiveTab('requests')}>
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'requests' ? theme.text : theme.textMuted }
            ]}>
              Requests
              {proposedTasks.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{proposedTasks.length}</Text>
                </View>
              )}
            </Text>
          </TouchableOpacity>
          <View style={[styles.tabDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity onPress={() => setActiveTab('tasks')}>
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'tasks' ? theme.text : theme.textMuted }
            ]}>
              Today's Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {activeTab === 'tasks' ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                theme={theme}
                isExpanded={expandedTaskId === task.id}
                onToggle={toggleTask}
                onStart={handleStartTask}
              />
            ))
          ) : (
            proposedTasks.length > 0 ? (
              proposedTasks.map((task) => (
                <TaskRequestCard
                  key={task.id}
                  task={task}
                  theme={theme}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="sparkles" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>No pending requests</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* AI Copilot FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AICopilot')}
      >
        <Ionicons name="sparkles" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={handleCompleteTask}
        theme={theme}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal 
        visible={showPatientProfile} 
        onClose={() => setShowPatientProfile(false)} 
        theme={theme}
      />

      {/* Vitals Modal */}
      <VitalsModal
        visible={showVitals}
        onClose={() => setShowVitals(false)}
        theme={theme}
      />
    </SafeAreaView>
  );
};

// ============ TASK COMPLETION MODAL ============
const TaskCompletionModal = ({ visible, task, onClose, onComplete, theme }) => {
  const [note, setNote] = useState('');

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Complete Task</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={[styles.taskSummary, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.taskSummaryTitle, { color: theme.text }]}>{task.title}</Text>
            <Text style={[styles.taskSummaryDesc, { color: theme.textSecondary }]}>{task.description}</Text>
          </View>

          {task.requiresPhoto && (
            <View style={styles.photoSection}>
              <Text style={[styles.photoLabel, { color: theme.text }]}>Photo Evidence (Required)</Text>
              <TouchableOpacity style={[styles.photoCapture, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="camera" size={40} color={theme.primary} />
                <Text style={[styles.photoCaptureText, { color: theme.text }]}>Tap to Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noteSection}>
            <Text style={[styles.noteLabel, { color: theme.text }]}>Completion Note</Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="Add notes about task completion..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchableOpacity 
            style={styles.completeBtn}
            onPress={() => onComplete(note)}
          >
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ============ PATIENT PROFILE MODAL ============
const PatientProfileModal = ({ visible, onClose, theme }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Patient Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Patient Info Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <Image source={{ uri: PATIENT.photo }} style={styles.profilePhoto} />
          <Text style={[styles.profileName, { color: theme.text }]}>{PATIENT.name}</Text>
          <Text style={[styles.profileAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text>
        </View>

        {/* Conditions */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Medical Conditions</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.conditions.map((condition, i) => (
              <View key={i} style={[styles.profileItem, i < PATIENT.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="medical" size={18} color={theme.primary} />
                <Text style={[styles.profileItemText, { color: theme.text }]}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Allergies</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.allergies.map((allergy, i) => (
              <View key={i} style={[styles.profileItem, i < PATIENT.allergies.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="warning" size={18} color={theme.danger} />
                <Text style={[styles.profileItemText, { color: theme.text }]}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Medications */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Current Medications</Text>
          <View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>
            {PATIENT.medications.map((med, i) => (
              <View key={i} style={[styles.profileItem, styles.profileItemColumn, i < PATIENT.medications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={styles.profileItemHeader}>
                  <Ionicons name="medkit" size={18} color={theme.blue} />
                  <Text style={[styles.profileItemText, { color: theme.text }]}>{med.name}</Text>
                </View>
                <Text style={[styles.profileItemSub, { color: theme.textSecondary }]}>
                  {med.dosage} - {med.frequency}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.profileSection}>
          <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Emergency Contact</Text>
          <View style={[styles.emergencyCard, { backgroundColor: `${theme.danger}15` }]}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="call" size={20} color={theme.danger} />
              <Text style={[styles.emergencyName, { color: theme.text }]}>
                {PATIENT.emergencyContact.name}
              </Text>
            </View>
            <Text style={[styles.emergencyRelation, { color: theme.textSecondary }]}>
              {PATIENT.emergencyContact.relationship}
            </Text>
            <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.danger }]}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.callButtonText}>{PATIENT.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// ============ VITALS MODAL ============
const VitalsModal = ({ visible, onClose, theme }) => {
  const [activeVital, setActiveVital] = useState('bp');

  const vitalTabs = [
    { id: 'bp', label: 'BP', icon: 'heart', color: '#f43f5e' },
    { id: 'hr', label: 'Heart', icon: 'pulse', color: '#f97316' },
    { id: 'temp', label: 'Temp', icon: 'thermometer', color: '#3b82f6' },
    { id: 'pain', label: 'Pain', icon: 'sad-outline', color: '#8b5cf6' },
  ];

  const getVitalData = () => {
    switch (activeVital) {
      case 'bp': return VITALS.bloodPressure;
      case 'hr': return VITALS.heartRate;
      case 'temp': return VITALS.temperature;
      case 'pain': return VITALS.pain;
      default: return [];
    }
  };

  const formatValue = (item) => {
    if (activeVital === 'bp') return `${item.systolic}/${item.diastolic}`;
    return item.value;
  };

  const getUnit = () => {
    switch (activeVital) {
      case 'bp': return 'mmHg';
      case 'hr': return 'bpm';
      case 'temp': return '°F';
      case 'pain': return '/10';
      default: return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Vitals History</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Vital Tabs */}
        <View style={[styles.vitalTabs, { borderBottomColor: theme.border }]}>
          {vitalTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.vitalTab,
                activeVital === tab.id && { backgroundColor: `${tab.color}20` }
              ]}
              onPress={() => setActiveVital(tab.id)}
            >
              <Ionicons name={tab.icon} size={20} color={activeVital === tab.id ? tab.color : theme.textMuted} />
              <Text style={[
                styles.vitalTabText,
                { color: activeVital === tab.id ? tab.color : theme.textMuted }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Current Value */}
          <View style={[styles.vitalCurrentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.vitalCurrentLabel, { color: theme.textSecondary }]}>Latest Reading</Text>
            <Text style={[styles.vitalCurrentValue, { color: theme.text }]}>
              {formatValue(getVitalData()[getVitalData().length - 1])}
              <Text style={[styles.vitalCurrentUnit, { color: theme.textSecondary }]}> {getUnit()}</Text>
            </Text>
            <Text style={[styles.vitalCurrentTime, { color: theme.textMuted }]}>
              {getVitalData()[getVitalData().length - 1].time}
            </Text>
          </View>

          {/* History List */}
          <Text style={[styles.vitalHistoryTitle, { color: theme.text }]}>7-Day History</Text>
          <View style={[styles.vitalHistoryCard, { backgroundColor: theme.card }]}>
            {getVitalData().map((item, i) => (
              <View key={i} style={[
                styles.vitalHistoryItem,
                i < getVitalData().length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}>
                <Text style={[styles.vitalHistoryDate, { color: theme.textSecondary }]}>{item.date}</Text>
                <Text style={[styles.vitalHistoryValue, { color: theme.text }]}>
                  {formatValue(item)} {getUnit()}
                </Text>
                <Text style={[styles.vitalHistoryTime, { color: theme.textMuted }]}>{item.time}</Text>
              </View>
            ))}
          </View>

          {/* Record New Button */}
          <TouchableOpacity style={styles.recordVitalBtn}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.recordVitalBtnText}>Record New</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Continue in next part...

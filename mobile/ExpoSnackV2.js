// ADLTrack - Expo Snack Version
import React, { useState, createContext, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, StyleSheet, SafeAreaView, Modal, Dimensions, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ThemeContext = createContext();
const AuthContext = createContext();

const colors = {
  dark: { background: '#0c0a09', card: '#1c1917', cardHover: '#292524', text: '#ffffff', textSecondary: '#a8a29e', textMuted: '#78716c', border: '#44403c', primary: '#25D366', danger: '#f43f5e', orange: '#f97316', blue: '#3b82f6', purple: '#8b5cf6' },
  light: { background: '#ffffff', card: '#ffffff', cardHover: '#f5f5f4', text: '#1c1917', textSecondary: '#78716c', textMuted: '#a8a29e', border: '#e7e5e4', primary: '#25D366', danger: '#f43f5e', orange: '#f97316', blue: '#3b82f6', purple: '#8b5cf6' }
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? colors.dark : colors.light;
  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme: () => setIsDark(!isDark), setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login: (u) => { setUser(u); setIsAuthenticated(true); }, logout: () => { setUser(null); setIsAuthenticated(false); } }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const PATIENT = { id: 'patient-1', name: 'David Smith', age: 78, photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'], allergies: ['Penicillin', 'Shellfish'], medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }, { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }], emergencyContact: { name: 'Mary Smith', relationship: 'Daughter', phone: '(555) 234-5678' } };
const CAREGIVER = { name: 'Julia Martinez', role: 'Certified Nursing Assistant', photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200' };
const TASKS = [
  { id: '1', title: 'Morning Medication', description: 'Administer medications with breakfast', scheduledTime: '08:00 AM', priority: 'critical', status: 'pending', requiresPhoto: true },
  { id: '2', title: 'Breakfast Assistance', description: 'Help with breakfast preparation', scheduledTime: '08:30 AM', priority: 'standard', status: 'pending', requiresPhoto: false },
  { id: '3', title: 'Morning Walk', description: '15-minute assisted walk', scheduledTime: '10:00 AM', priority: 'quality', status: 'pending', requiresPhoto: false },
  { id: '4', title: 'Blood Pressure Check', description: 'Take and record BP reading', scheduledTime: '10:30 AM', priority: 'critical', status: 'pending', requiresPhoto: true },
  { id: '5', title: 'Hydration Check', description: 'Ensure patient drinks water', scheduledTime: '11:00 AM', priority: 'standard', status: 'pending', requiresPhoto: false },
  { id: '6', title: 'Lunch Preparation', description: 'Prepare and serve lunch', scheduledTime: '12:00 PM', priority: 'standard', status: 'pending', requiresPhoto: true }
];
const VITALS = { bloodPressure: { systolic: 120, diastolic: 76 }, heartRate: { value: 72 }, temperature: { value: 98.6 }, pain: { value: 2 } };
const PROPOSED_TASKS = [{ id: 'p1', title: 'Garden Walk', description: 'Short walk in the backyard', scheduledTime: '4:00 PM', proposedBy: 'Mary Smith (Daughter)' }];
const INCIDENTS = [{ id: 1, type: 'fall', title: 'Minor Fall in Bathroom', description: 'Patient slipped while getting out of shower.', status: 'resolved', createdAt: '2025-01-15' }];
const INCIDENT_TYPES = [{ id: 'fall', label: 'Fall', icon: 'alert-circle', color: '#f43f5e' }, { id: 'medication', label: 'Medication', icon: 'medical', color: '#f97316' }, { id: 'behavioral', label: 'Behavioral', icon: 'body', color: '#8b5cf6' }, { id: 'injury', label: 'Injury', icon: 'bandage', color: '#ef4444' }, { id: 'vital', label: 'Vital Concern', icon: 'thermometer', color: '#3b82f6' }, { id: 'other', label: 'Other', icon: 'help-circle', color: '#78716c' }];
const SEVERITY_LEVELS = [{ id: 'low', label: 'Low', color: '#22c55e' }, { id: 'medium', label: 'Medium', color: '#f59e0b' }, { id: 'high', label: 'High', color: '#f97316' }, { id: 'critical', label: 'Critical', color: '#f43f5e' }];

const LandingScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <LinearGradient colors={['#ffffff', '#f0fdf4', '#dcfce7']} style={styles.gradient}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}><Ionicons name="pulse" size={22} color="#fff" /></View>
          <Text style={styles.logoText}>ADLTrack</Text>
        </View>
      </View>
      <View style={styles.hero}>
        <Text style={styles.tagline}>Simple. Secure.</Text>
        <Text style={styles.taglineAccent}>Reliable Care.</Text>
        <Text style={styles.heroDesc}>The caregiving app that brings families, caregivers, and agencies together.</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('RoleSelection')}>
          <Text style={styles.ctaBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.featuresRow}>
        <View style={styles.featureCard}><View style={styles.featureIcon}><Ionicons name="checkmark-circle" size={22} color="#25D366" /></View><Text style={styles.featureTitle}>Tasks</Text></View>
        <View style={styles.featureCard}><View style={styles.featureIcon}><Ionicons name="heart" size={22} color="#25D366" /></View><Text style={styles.featureTitle}>Vitals</Text></View>
        <View style={styles.featureCard}><View style={styles.featureIcon}><Ionicons name="chatbubbles" size={22} color="#25D366" /></View><Text style={styles.featureTitle}>Chat</Text></View>
      </View>
      <View style={styles.trustBadge}><Ionicons name="shield-checkmark" size={18} color="#25D366" /><Text style={styles.trustText}>HIPAA Compliant</Text></View>
    </LinearGradient>
  </SafeAreaView>
);

const RoleSelectionScreen = ({ navigation }) => {
  const { setIsDark } = useTheme();
  const roles = [{ id: 'caregiver', title: 'Caregiver', desc: 'Professional caregivers', icon: 'heart-circle', color: '#25D366', dark: true }, { id: 'family', title: 'Family', desc: 'Family guardians', icon: 'people', color: '#3b82f6', dark: false }, { id: 'agency', title: 'Agency', desc: 'Healthcare agencies', icon: 'business', color: '#8b5cf6', dark: false }];
  return (
    <SafeAreaView style={styles.roleContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#1c1917" /></TouchableOpacity>
      <Text style={styles.roleTitle}>Choose Your Role</Text>
      <Text style={styles.roleSubtitle}>Select how you'll use ADLTrack</Text>
      <View style={{ marginTop: 16 }}>
        {roles.map((role) => (
          <TouchableOpacity key={role.id} style={styles.roleCard} onPress={() => { setIsDark(role.dark); navigation.navigate('Auth', { role: role.id }); }}>
            <View style={[styles.roleIcon, { backgroundColor: role.color + '15' }]}><Ionicons name={role.icon} size={28} color={role.color} /></View>
            <View style={styles.roleTextContainer}><Text style={styles.roleCardTitle}>{role.title}</Text><Text style={styles.roleCardDesc}>{role.desc}</Text></View>
            <Ionicons name="chevron-forward" size={22} color="#a8a29e" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const AuthScreen = ({ navigation, route }) => {
  const { login } = useAuth();
  const { setIsDark } = useTheme();
  const role = route.params?.role || 'caregiver';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const config = { caregiver: { title: 'Caregiver', color: '#25D366' }, family: { title: 'Family', color: '#3b82f6' }, agency: { title: 'Agency', color: '#8b5cf6' } }[role];
  const handleLogin = () => { setIsDark(role === 'caregiver'); login({ name: 'Julia Martinez', role }); };
  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#1c1917" /></TouchableOpacity>
          <View style={[styles.roleTag, { backgroundColor: config.color + '15' }]}><Text style={[styles.roleTagText, { color: config.color }]}>{config.title}</Text></View>
          <Text style={styles.authTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.authSubtitle}>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</Text>
          <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}><Ionicons name="logo-google" size={20} color="#1c1917" /><Text style={styles.socialBtnText}>Continue with Google</Text></TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={handleLogin}><Ionicons name="logo-apple" size={20} color="#1c1917" /><Text style={styles.socialBtnText}>Continue with Apple</Text></TouchableOpacity>
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} /></View>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter email" value={email} onChangeText={setEmail} placeholderTextColor="#a8a29e" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#a8a29e" />
          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: config.color }]} onPress={handleLogin}><Text style={styles.loginBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text></TouchableOpacity>
          <View style={styles.toggleAuth}><Text style={styles.toggleAuthText}>{isSignUp ? 'Have an account?' : 'No account?'}</Text><TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}><Text style={[styles.toggleAuthLink, { color: config.color }]}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text></TouchableOpacity></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const TaskCard = ({ task, onToggle, onStart, isExpanded, theme }) => {
  const isCompleted = task.status === 'completed';
  const priorityColors = { critical: '#f43f5e', standard: '#3b82f6', quality: '#25D366' };
  const stripeColor = isCompleted ? '#25D366' : (priorityColors[task.priority] || '#3b82f6');
  return (
    <TouchableOpacity style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => !isCompleted && onToggle && onToggle(task.id)} activeOpacity={0.7}>
      <View style={[styles.taskStripe, { backgroundColor: stripeColor }]} />
      <View style={styles.taskContent}>
        <View style={styles.taskMain}>
          <Text style={[styles.taskTitle, { color: theme.text }, isCompleted && styles.taskTitleCompleted]}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.taskTime, { color: theme.textSecondary, marginLeft: 4 }]}>{task.scheduledTime}</Text>
            {task.requiresPhoto && !isCompleted && <View style={[styles.photoBadge, { backgroundColor: theme.cardHover, marginLeft: 8 }]}><Ionicons name="camera" size={12} color={theme.textSecondary} /></View>}
          </View>
        </View>
        <View style={[styles.taskExpandIcon, { borderColor: theme.border }]}><Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textMuted} /></View>
      </View>
      {isExpanded && !isCompleted && (
        <View style={[styles.taskExpanded, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <Text style={[styles.taskExpandedLabel, { color: theme.textMuted }]}>DESCRIPTION</Text>
          <Text style={[styles.taskExpandedText, { color: theme.textSecondary }]}>{task.description}</Text>
          <TouchableOpacity style={styles.startTaskBtn} onPress={() => onStart && onStart(task)}><Text style={styles.startTaskBtnText}>Start Task</Text></TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TaskRequestCard = ({ task, onAccept, onDecline, theme }) => (
  <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={[styles.requestStripe, { backgroundColor: '#25D366' }]} />
    <View style={styles.requestContent}>
      <View style={styles.requestHeader}><View style={[styles.requestBadge, { backgroundColor: theme.primary + '20' }]}><Text style={[styles.requestBadgeText, { color: theme.primary }]}>REQUEST</Text></View><Text style={[styles.requestTime, { color: theme.textSecondary }]}>{task.scheduledTime}</Text></View>
      <Text style={[styles.requestTitle, { color: theme.text }]}>{task.title}</Text>
      <Text style={[styles.requestDesc, { color: theme.textSecondary }]}>{task.description}</Text>
      <Text style={[styles.requestBy, { color: theme.textMuted }]}>From: {task.proposedBy}</Text>
      <View style={styles.requestActions}>
        <TouchableOpacity style={[styles.requestDeclineBtn, { borderColor: theme.border }]} onPress={() => onDecline && onDecline(task.id)}><Text style={[styles.requestDeclineText, { color: theme.textSecondary }]}>Decline</Text></TouchableOpacity>
        <TouchableOpacity style={styles.requestAcceptBtn} onPress={() => onAccept && onAccept(task.id)}><Text style={styles.requestAcceptText}>Accept</Text></TouchableOpacity>
      </View>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState(TASKS);
  const [proposedTasks, setProposedTasks] = useState(PROPOSED_TASKS);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const startShift = () => setIsShiftActive(true);
  const toggleTask = (id) => setExpandedTaskId(expandedTaskId === id ? null : id);
  const handleStartTask = (task) => setSelectedTask(task);
  const handleCompleteTask = (note) => { if (selectedTask) { setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'completed', completionNote: note } : t)); setSelectedTask(null); setExpandedTaskId(null); } };
  const handleAcceptRequest = (id) => { const request = proposedTasks.find(t => t.id === id); if (request) { setTasks([...tasks, { ...request, status: 'pending', priority: 'quality' }]); setProposedTasks(proposedTasks.filter(t => t.id !== id)); } };
  const handleDeclineRequest = (id) => setProposedTasks(proposedTasks.filter(t => t.id !== id));

  if (!isShiftActive) {
    return (
      <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.offlineContainer}>
          <View style={styles.offlineHeader}>
            <Image source={{ uri: CAREGIVER.photo }} style={styles.caregiverPhoto} />
            <View style={{ marginLeft: 14 }}><Text style={[styles.greeting, { color: theme.textMuted }]}>Good morning,</Text><Text style={[styles.caregiverName, { color: theme.text }]}>Julia</Text></View>
          </View>
          <TouchableOpacity style={[styles.patientCardOffline, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowPatientProfile(true)}>
            <Text style={[styles.patientCardLabel, { color: theme.textMuted }]}>Ready to care for</Text>
            <View style={styles.patientCardRow}>
              <Image source={{ uri: PATIENT.photo }} style={styles.patientPhotoLarge} />
              <View style={styles.patientCardInfo}><Text style={[styles.patientName, { color: theme.text }]}>{PATIENT.name}</Text><Text style={[styles.patientAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text></View>
              <Ionicons name="chevron-forward" size={22} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
          <View style={styles.startShiftSection}>
            <Text style={[styles.offlineText, { color: theme.textMuted }]}>You're offline</Text>
            <Text style={[styles.startShiftTitle, { color: theme.text }]}>Tap to start your shift</Text>
            <TouchableOpacity style={styles.goButton} onPress={startShift}>
              <View style={styles.goButtonPulse} />
              <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.goButtonInner}><Ionicons name="play" size={44} color="#fff" style={{ marginLeft: 4 }} /></LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.tasksScheduled, { color: theme.textMuted }]}>{tasks.length} tasks scheduled today</Text>
          </View>
        </View>
        <PatientProfileModal visible={showPatientProfile} onClose={() => setShowPatientProfile(false)} theme={theme} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.patientHeaderContainer}>
          <Image source={{ uri: PATIENT.photo }} style={styles.patientHeaderPhoto} />
          <LinearGradient colors={['transparent', 'rgba(12,10,9,0.7)', 'rgba(12,10,9,0.95)']} style={styles.patientHeaderGradient} />
          <TouchableOpacity style={styles.patientHeaderInfo} onPress={() => setShowPatientProfile(true)}>
            <View><Text style={styles.patientHeaderName}>{PATIENT.name}</Text><Text style={styles.patientHeaderAge}>{PATIENT.age} years old</Text></View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalsGrid}>
            <TouchableOpacity style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowVitals(true)}><View style={[styles.vitalIcon, { backgroundColor: 'rgba(244,63,94,0.2)' }]}><Ionicons name="heart" size={18} color="#f43f5e" /></View><Text style={[styles.vitalValue, { color: theme.text }]}>{VITALS.bloodPressure.systolic}/{VITALS.bloodPressure.diastolic}</Text><Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>BP</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowVitals(true)}><View style={[styles.vitalIcon, { backgroundColor: 'rgba(249,115,22,0.2)' }]}><Ionicons name="pulse" size={18} color="#f97316" /></View><Text style={[styles.vitalValue, { color: theme.text }]}>{VITALS.heartRate.value}</Text><Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Heart</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowVitals(true)}><View style={[styles.vitalIcon, { backgroundColor: 'rgba(59,130,246,0.2)' }]}><Ionicons name="thermometer" size={18} color="#3b82f6" /></View><Text style={[styles.vitalValue, { color: theme.text }]}>{VITALS.temperature.value}°</Text><Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Temp</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowVitals(true)}><View style={[styles.vitalIcon, { backgroundColor: 'rgba(139,92,246,0.2)' }]}><Ionicons name="sad-outline" size={18} color="#8b5cf6" /></View><Text style={[styles.vitalValue, { color: theme.text }]}>{VITALS.pain.value}/10</Text><Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>Pain</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}><Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Today's Progress</Text><Text style={[styles.progressCount, { color: theme.text }]}>{completedCount}/{tasks.length}</Text></View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardHover }]}><View style={[styles.progressBarFill, { width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }]} /></View>
        </View>
        <View style={styles.taskTabs}>
          <TouchableOpacity onPress={() => setActiveTab('requests')}><Text style={[styles.tabText, { color: activeTab === 'requests' ? theme.text : theme.textMuted }]}>Requests {proposedTasks.length > 0 ? `(${proposedTasks.length})` : ''}</Text></TouchableOpacity>
          <View style={[styles.tabDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity onPress={() => setActiveTab('tasks')}><Text style={[styles.tabText, { color: activeTab === 'tasks' ? theme.text : theme.textMuted }]}>Today's Tasks</Text></TouchableOpacity>
        </View>
        <View style={styles.taskList}>
          {activeTab === 'tasks' ? tasks.map((task) => (<TaskCard key={task.id} task={task} theme={theme} isExpanded={expandedTaskId === task.id} onToggle={toggleTask} onStart={handleStartTask} />)) : proposedTasks.length > 0 ? proposedTasks.map((task) => (<TaskRequestCard key={task.id} task={task} theme={theme} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />)) : (<View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}><Ionicons name="sparkles" size={36} color={theme.textMuted} /><Text style={[styles.emptyStateText, { color: theme.textMuted }]}>No pending requests</Text></View>)}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AICopilot')}><Ionicons name="sparkles" size={22} color="#fff" /></TouchableOpacity>
      <TaskCompletionModal visible={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleCompleteTask} theme={theme} />
      <PatientProfileModal visible={showPatientProfile} onClose={() => setShowPatientProfile(false)} theme={theme} />
      <VitalsModal visible={showVitals} onClose={() => setShowVitals(false)} theme={theme} />
    </SafeAreaView>
  );
};

const TaskCompletionModal = ({ visible, task, onClose, onComplete, theme }) => {
  const [note, setNote] = useState('');
  if (!task) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}><TouchableOpacity onPress={onClose}><Ionicons name="close" size={26} color={theme.text} /></TouchableOpacity><Text style={[styles.modalTitle, { color: theme.text }]}>Complete Task</Text><View style={{ width: 26 }} /></View>
        <ScrollView style={styles.modalContent}>
          <View style={[styles.taskSummary, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.taskSummaryTitle, { color: theme.text }]}>{task.title}</Text><Text style={[styles.taskSummaryDesc, { color: theme.textSecondary }]}>{task.description}</Text></View>
          {task.requiresPhoto && (<View style={styles.photoSection}><Text style={[styles.photoLabel, { color: theme.text }]}>Photo Evidence (Required)</Text><TouchableOpacity style={[styles.photoCapture, { backgroundColor: theme.card, borderColor: theme.border }]}><Ionicons name="camera" size={36} color={theme.primary} /><Text style={[styles.photoCaptureText, { color: theme.text }]}>Tap to Take Photo</Text></TouchableOpacity></View>)}
          <View style={styles.noteSection}><Text style={[styles.noteLabel, { color: theme.text }]}>Note</Text><TextInput style={[styles.noteInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder="Add notes..." placeholderTextColor={theme.textMuted} multiline textAlignVertical="top" value={note} onChangeText={setNote} /></View>
          <TouchableOpacity style={styles.completeBtn} onPress={() => onComplete(note)}><Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={styles.completeBtnText}>Mark as Complete</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const PatientProfileModal = ({ visible, onClose, theme }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}><TouchableOpacity onPress={onClose}><Ionicons name="close" size={26} color={theme.text} /></TouchableOpacity><Text style={[styles.modalTitle, { color: theme.text }]}>Patient Profile</Text><View style={{ width: 26 }} /></View>
      <ScrollView style={styles.modalContent}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}><Image source={{ uri: PATIENT.photo }} style={styles.profilePhoto} /><Text style={[styles.profileName, { color: theme.text }]}>{PATIENT.name}</Text><Text style={[styles.profileAge, { color: theme.textSecondary }]}>{PATIENT.age} years old</Text></View>
        <View style={styles.profileSection}><Text style={[styles.profileSectionTitle, { color: theme.text }]}>Medical Conditions</Text><View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>{PATIENT.conditions.map((c, i) => (<View key={i} style={[styles.profileItem, i < PATIENT.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}><Ionicons name="medical" size={16} color={theme.primary} /><Text style={[styles.profileItemText, { color: theme.text, marginLeft: 12 }]}>{c}</Text></View>))}</View></View>
        <View style={styles.profileSection}><Text style={[styles.profileSectionTitle, { color: theme.text }]}>Allergies</Text><View style={[styles.profileSectionCard, { backgroundColor: theme.card }]}>{PATIENT.allergies.map((a, i) => (<View key={i} style={[styles.profileItem, i < PATIENT.allergies.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}><Ionicons name="warning" size={16} color={theme.danger} /><Text style={[styles.profileItemText, { color: theme.text, marginLeft: 12 }]}>{a}</Text></View>))}</View></View>
        <View style={styles.profileSection}><Text style={[styles.profileSectionTitle, { color: theme.text }]}>Emergency Contact</Text><View style={[styles.emergencyCard, { backgroundColor: theme.danger + '15' }]}><View style={styles.emergencyHeader}><Ionicons name="call" size={18} color={theme.danger} /><Text style={[styles.emergencyName, { color: theme.text, marginLeft: 10 }]}>{PATIENT.emergencyContact.name}</Text></View><Text style={[styles.emergencyRelation, { color: theme.textSecondary }]}>{PATIENT.emergencyContact.relationship}</Text><TouchableOpacity style={[styles.callButton, { backgroundColor: theme.danger }]}><Ionicons name="call" size={16} color="#fff" /><Text style={styles.callButtonText}>{PATIENT.emergencyContact.phone}</Text></TouchableOpacity></View></View>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

const VitalsModal = ({ visible, onClose, theme }) => {
  const [activeVital, setActiveVital] = useState('bp');
  const vitalTabs = [{ id: 'bp', label: 'BP', icon: 'heart', color: '#f43f5e' }, { id: 'hr', label: 'Heart', icon: 'pulse', color: '#f97316' }, { id: 'temp', label: 'Temp', icon: 'thermometer', color: '#3b82f6' }, { id: 'pain', label: 'Pain', icon: 'sad-outline', color: '#8b5cf6' }];
  const getVitalInfo = () => { switch (activeVital) { case 'bp': return { value: `${VITALS.bloodPressure.systolic}/${VITALS.bloodPressure.diastolic}`, unit: 'mmHg' }; case 'hr': return { value: VITALS.heartRate.value, unit: 'bpm' }; case 'temp': return { value: VITALS.temperature.value, unit: '°F' }; case 'pain': return { value: VITALS.pain.value, unit: '/10' }; default: return { value: '--', unit: '' }; } };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}><TouchableOpacity onPress={onClose}><Ionicons name="close" size={26} color={theme.text} /></TouchableOpacity><Text style={[styles.modalTitle, { color: theme.text }]}>Vitals</Text><View style={{ width: 26 }} /></View>
        <View style={[styles.vitalTabs2, { borderBottomColor: theme.border }]}>{vitalTabs.map((tab) => (<TouchableOpacity key={tab.id} style={[styles.vitalTab, activeVital === tab.id && { backgroundColor: tab.color + '20' }]} onPress={() => setActiveVital(tab.id)}><Ionicons name={tab.icon} size={18} color={activeVital === tab.id ? tab.color : theme.textMuted} /><Text style={[styles.vitalTabText, { color: activeVital === tab.id ? tab.color : theme.textMuted, marginLeft: 6 }]}>{tab.label}</Text></TouchableOpacity>))}</View>
        <ScrollView style={styles.modalContent}><View style={[styles.vitalCurrentCard, { backgroundColor: theme.card }]}><Text style={[styles.vitalCurrentLabel, { color: theme.textSecondary }]}>Latest Reading</Text><Text style={[styles.vitalCurrentValue, { color: theme.text }]}>{getVitalInfo().value}<Text style={[styles.vitalCurrentUnit, { color: theme.textSecondary }]}> {getVitalInfo().unit}</Text></Text></View><TouchableOpacity style={styles.recordVitalBtn}><Ionicons name="add" size={18} color="#fff" /><Text style={styles.recordVitalBtnText}>Record New</Text></TouchableOpacity></ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const IncidentScreen = () => {
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState(INCIDENTS);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const resetForm = () => { setStep(1); setIncidentType(null); setSeverity(null); setDescription(''); setSubmitted(false); setShowNewIncident(false); };
  const handleSubmit = () => { const newIncident = { id: Date.now(), type: incidentType, severity, title: INCIDENT_TYPES.find(t => t.id === incidentType)?.label + ' Incident', description, status: 'open', createdAt: new Date().toISOString().split('T')[0] }; setIncidents([newIncident, ...incidents]); setSubmitted(true); };

  if (submitted) return (<SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}><View style={styles.successContainer}><View style={[styles.successCard, { backgroundColor: theme.card }]}><Ionicons name="checkmark-circle" size={48} color={theme.primary} /><Text style={[styles.successTitle, { color: theme.text }]}>Report Submitted</Text><Text style={[styles.successDesc, { color: theme.textSecondary }]}>Incident documented successfully.</Text><TouchableOpacity style={styles.successBtn} onPress={resetForm}><Text style={styles.successBtnText}>Done</Text></TouchableOpacity></View></View></SafeAreaView>);

  if (showNewIncident) return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.incidentFormHeader, { borderBottomColor: theme.border }]}><View style={styles.incidentFormHeaderLeft}><View style={styles.incidentFormIcon}><Ionicons name="alert-circle" size={18} color="#f43f5e" /></View><View><Text style={[styles.incidentFormTitle, { color: theme.text }]}>New Incident</Text><Text style={[styles.incidentFormStep, { color: theme.textMuted }]}>Step {step} of 3</Text></View></View><TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.cardHover }]} onPress={() => setShowNewIncident(false)}><Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text></TouchableOpacity></View>
      <View style={styles.stepProgress}>{[1, 2, 3].map((s) => (<View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? '#f43f5e' : theme.border }]} />))}</View>
      <ScrollView style={styles.incidentFormContent}>
        {step === 1 && (<><Text style={[styles.stepTitle, { color: theme.text }]}>Incident Type</Text><View style={styles.typeGrid}>{INCIDENT_TYPES.map((type) => (<TouchableOpacity key={type.id} style={[styles.typeCard, { backgroundColor: theme.card, borderColor: incidentType === type.id ? type.color : theme.border, borderWidth: incidentType === type.id ? 2 : 1 }]} onPress={() => setIncidentType(type.id)}><View style={[styles.typeIconContainer, { backgroundColor: type.color + '20' }]}><Ionicons name={type.icon} size={24} color={type.color} /></View><Text style={[styles.typeLabel, { color: theme.text }]}>{type.label}</Text></TouchableOpacity>))}</View>{incidentType && (<TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}><Text style={styles.nextBtnText}>Continue</Text></TouchableOpacity>)}</>)}
        {step === 2 && (<><Text style={[styles.stepTitle, { color: theme.text }]}>Severity</Text><View style={styles.severityList}>{SEVERITY_LEVELS.map((sev) => (<TouchableOpacity key={sev.id} style={[styles.severityCard, { backgroundColor: theme.card, borderColor: severity === sev.id ? sev.color : theme.border, borderWidth: severity === sev.id ? 2 : 1 }]} onPress={() => setSeverity(sev.id)}><View style={[styles.severityDot, { backgroundColor: sev.color }]} /><Text style={[styles.severityLabel, { color: theme.text, marginLeft: 12 }]}>{sev.label}</Text></TouchableOpacity>))}</View><View style={styles.stepNav}><TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(1)}><Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text></TouchableOpacity>{severity && (<TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}><Text style={styles.nextBtnText}>Continue</Text></TouchableOpacity>)}</View></>)}
        {step === 3 && (<><Text style={[styles.stepTitle, { color: theme.text }]}>Description</Text><TextInput style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]} placeholder="What happened?" placeholderTextColor={theme.textMuted} multiline textAlignVertical="top" value={description} onChangeText={setDescription} /><View style={styles.stepNav}><TouchableOpacity style={[styles.backStepBtn, { borderColor: theme.border }]} onPress={() => setStep(2)}><Text style={[styles.backStepBtnText, { color: theme.textSecondary }]}>Back</Text></TouchableOpacity>{description.trim() && (<TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Text style={styles.submitBtnText}>Submit</Text></TouchableOpacity>)}</View></>)}
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.incidentScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Incidents</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Report and track incidents</Text>
        <TouchableOpacity style={styles.newIncidentBtn} onPress={() => setShowNewIncident(true)}><Ionicons name="add-circle" size={24} color="#fff" /><View style={{ marginLeft: 12 }}><Text style={styles.newIncidentTitle}>New Incident Report</Text><Text style={styles.newIncidentSubtitle}>Document an incident</Text></View><Ionicons name="chevron-forward" size={22} color="#fff" style={{ marginLeft: 'auto' }} /></TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 12 }]}>Past Reports</Text>
        {incidents.map((inc) => (<View key={inc.id} style={[styles.incidentCard, { backgroundColor: theme.card, borderColor: theme.border }]}><View style={[styles.incidentStripe, { backgroundColor: inc.status === 'open' ? '#f43f5e' : '#25D366' }]} /><View style={styles.incidentContent}><Text style={[styles.incidentTitle, { color: theme.text }]}>{inc.title}</Text><Text style={[styles.incidentDesc, { color: theme.textSecondary }]}>{inc.description}</Text><Text style={[styles.incidentDate, { color: theme.textMuted }]}>{inc.createdAt}</Text></View></View>))}
      </ScrollView>
    </SafeAreaView>
  );
};

const MessageScreen = () => {
  const { theme } = useTheme();
  const conversations = [{ id: 1, name: 'Mary Smith', role: 'Daughter', lastMessage: 'Thank you for the update!', time: '2m ago', unread: 2, color: '#3b82f6' }, { id: 2, name: 'Dr. Johnson', role: 'Physician', lastMessage: 'BP looks good.', time: '1h ago', unread: 0, color: '#8b5cf6' }, { id: 3, name: 'Care Agency', role: 'Agency', lastMessage: 'Schedule confirmed.', time: '3h ago', unread: 0, color: '#f97316' }];
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.messageScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Messages</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Stay connected with the care team</Text>
        {conversations.map((conv) => (<TouchableOpacity key={conv.id} style={[styles.conversationCard, { backgroundColor: theme.card, borderColor: theme.border }]}><View style={[styles.avatar, { backgroundColor: conv.color }]}><Text style={styles.avatarText}>{conv.name.split(' ').map(n => n[0]).join('')}</Text></View><View style={styles.conversationInfo}><View style={styles.conversationHeader}><Text style={[styles.conversationName, { color: theme.text }]}>{conv.name}</Text><Text style={[styles.conversationTime, { color: theme.textMuted }]}>{conv.time}</Text></View><Text style={[styles.conversationRole, { color: theme.textSecondary }]}>{conv.role}</Text><Text style={[styles.conversationMessage, { color: theme.textSecondary }]} numberOfLines={1}>{conv.lastMessage}</Text></View>{conv.unread > 0 && (<View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}><Text style={styles.unreadText}>{conv.unread}</Text></View>)}</TouchableOpacity>))}
      </ScrollView>
    </SafeAreaView>
  );
};

const ShiftsScreen = () => {
  const { theme } = useTheme();
  const [isShiftActive, setIsShiftActive] = useState(false);
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.shiftScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Shifts</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Manage your work schedule</Text>
        <View style={[styles.shiftCard, { backgroundColor: isShiftActive ? '#25D366' : theme.card, borderColor: isShiftActive ? '#25D366' : theme.border }]}>
          <View style={styles.shiftCardHeader}><View style={styles.shiftStatus}><View style={[styles.statusDot, { backgroundColor: isShiftActive ? '#fff' : theme.textMuted }]} /><Text style={[styles.shiftStatusText, { color: isShiftActive ? '#fff' : theme.text }]}>{isShiftActive ? 'On Shift' : 'Off Duty'}</Text></View>{isShiftActive && (<View style={styles.liveBadge}><View style={styles.liveIndicator} /><Text style={styles.liveText}>LIVE</Text></View>)}</View>
          {isShiftActive && (<View style={styles.shiftDetails}><View style={styles.shiftDetailRow}><Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" /><View style={{ marginLeft: 10 }}><Text style={styles.shiftDetailLabel}>Started</Text><Text style={styles.shiftDetailValue}>8:00 AM</Text></View></View><View style={styles.shiftDetailRow}><Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.7)" /><View style={{ marginLeft: 10 }}><Text style={styles.shiftDetailLabel}>Patient</Text><Text style={styles.shiftDetailValue}>{PATIENT.name}</Text></View></View></View>)}
          <TouchableOpacity style={[styles.shiftToggleBtn, { backgroundColor: isShiftActive ? 'rgba(255,255,255,0.2)' : '#25D366' }]} onPress={() => setIsShiftActive(!isShiftActive)}><Ionicons name={isShiftActive ? 'stop' : 'play'} size={20} color="#fff" /><Text style={styles.shiftToggleBtnText}>{isShiftActive ? 'End Shift' : 'Start Shift'}</Text></TouchableOpacity>
        </View>
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}><View style={styles.earningsHeader}><Ionicons name="cash-outline" size={22} color={theme.primary} /><Text style={[styles.earningsTitle, { color: theme.text, marginLeft: 10 }]}>This Week</Text></View><Text style={[styles.earningsAmount, { color: theme.text }]}>$1,240</Text><Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>32 hours worked</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const menuItems = [{ label: 'Earnings', icon: 'wallet-outline' }, { label: 'Shift History', icon: 'time-outline' }, { label: 'Settings', icon: 'settings-outline' }, { label: 'Support', icon: 'help-circle-outline' }];
  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.menuScroll}>
        <View style={[styles.profileCardMenu, { backgroundColor: theme.card }]}><Image source={{ uri: CAREGIVER.photo }} style={styles.profilePhotoMenu} /><View style={styles.profileInfoMenu}><Text style={[styles.profileNameMenu, { color: theme.text }]}>{CAREGIVER.name}</Text><Text style={[styles.profileRoleMenu, { color: theme.textSecondary }]}>{CAREGIVER.role}</Text></View><Ionicons name="chevron-forward" size={22} color={theme.textMuted} /></View>
        <View style={[styles.themeToggle, { backgroundColor: theme.card }]}><View style={styles.themeToggleLeft}><View style={[styles.themeIcon, { backgroundColor: isDark ? '#8b5cf620' : '#f59e0b20' }]}><Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#8b5cf6' : '#f59e0b'} /></View><View style={{ marginLeft: 12 }}><Text style={[styles.themeLabel, { color: theme.text }]}>Theme</Text><Text style={[styles.themeValue, { color: theme.textSecondary }]}>{isDark ? 'Dark' : 'Light'}</Text></View></View><Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.primary + '50' }} thumbColor={isDark ? theme.primary : '#f4f3f4'} /></View>
        <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>{menuItems.map((item, idx) => (<TouchableOpacity key={idx} style={[styles.menuItem, idx < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}><View style={styles.menuItemLeft}><View style={[styles.menuIcon, { backgroundColor: theme.cardHover }]}><Ionicons name={item.icon} size={20} color={theme.textSecondary} /></View><Text style={[styles.menuLabel, { color: theme.text, marginLeft: 12 }]}>{item.label}</Text></View><Ionicons name="chevron-forward" size={20} color={theme.textMuted} /></TouchableOpacity>))}</View>
        <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: theme.danger + '15' }]} onPress={logout}><Ionicons name="log-out-outline" size={20} color={theme.danger} /><Text style={[styles.signOutText, { color: theme.danger, marginLeft: 10 }]}>Sign Out</Text></TouchableOpacity>
        <Text style={[styles.appVersion, { color: theme.textMuted }]}>ADLTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const AICopilotScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([{ id: 1, type: 'ai', text: "Hello Julia! I'm your AI care assistant. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const suggestions = ['Morning routine tips', 'Medication reminder', 'Document BP reading', 'Contact family'];
  const sendMessage = (text) => { if (!text.trim()) return; const userMsg = { id: Date.now(), type: 'user', text }; setMessages([...messages, userMsg]); setInput(''); setLoading(true); setTimeout(() => { const aiMsg = { id: Date.now() + 1, type: 'ai', text: `I can help with "${text}". For David Smith's care today, I recommend following the scheduled tasks and monitoring his vitals regularly.` }; setMessages(prev => [...prev, aiMsg]); setLoading(false); }, 1500); };
  return (
    <SafeAreaView style={[styles.copilotContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.copilotHeader, { borderBottomColor: theme.border }]}><TouchableOpacity style={[styles.copilotBackBtn, { backgroundColor: theme.cardHover }]} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color={theme.text} /></TouchableOpacity><View style={styles.copilotHeaderTitle}><View style={styles.copilotIcon}><Ionicons name="sparkles" size={20} color="#fff" /></View><View style={{ marginLeft: 10 }}><Text style={[styles.copilotTitle, { color: theme.text }]}>AI Copilot</Text><Text style={[styles.copilotSubtitle, { color: theme.textSecondary }]}>Care Assistant</Text></View></View></View>
      <ScrollView style={styles.messagesList}>{messages.map((msg) => (<View key={msg.id} style={[styles.messageBubble, msg.type === 'user' ? [styles.userBubble, { backgroundColor: theme.primary }] : [styles.aiBubble, { backgroundColor: theme.card }]]}>{msg.type === 'ai' && (<View style={styles.aiAvatarSmall}><Ionicons name="sparkles" size={12} color="#fff" /></View>)}<Text style={[styles.messageText, { color: msg.type === 'user' ? '#fff' : theme.text }]}>{msg.text}</Text></View>))}{loading && (<View style={[styles.loadingBubble, { backgroundColor: theme.card }]}><View style={styles.loadingDots}><View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} /><View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} /><View style={[styles.loadingDot, { backgroundColor: theme.textMuted }]} /></View></View>)}</ScrollView>
      <View style={styles.suggestionsContainer}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsList}>{suggestions.map((sug, idx) => (<TouchableOpacity key={idx} style={[styles.suggestionChip, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => sendMessage(sug)}><Text style={[styles.suggestionText, { color: theme.text }]}>{sug}</Text></TouchableOpacity>))}</ScrollView></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.background }]}><TextInput style={[styles.chatInput, { backgroundColor: theme.card, color: theme.text }]} placeholder="Ask anything..." placeholderTextColor={theme.textMuted} value={input} onChangeText={setInput} multiline /><TouchableOpacity style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.cardHover }]} onPress={() => sendMessage(input)} disabled={!input.trim()}><Ionicons name="send" size={18} color={input.trim() ? '#fff' : theme.textMuted} /></TouchableOpacity></View></KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CaregiverTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, borderTopWidth: 1, height: 85, paddingTop: 8, paddingBottom: 28 }, tabBarActiveTintColor: route.name === 'Incident' ? theme.danger : theme.primary, tabBarInactiveTintColor: theme.textMuted, tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 4 }, tabBarIcon: ({ focused, color }) => { const icons = { Home: focused ? 'home' : 'home-outline', Incident: focused ? 'alert-circle' : 'alert-circle-outline', Message: focused ? 'chatbubble' : 'chatbubble-outline', Shifts: focused ? 'time' : 'time-outline', Menu: focused ? 'menu' : 'menu-outline' }; return <Ionicons name={icons[route.name]} size={24} color={color} />; } })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Incident" component={IncidentScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftsScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (<><Stack.Screen name="Landing" component={LandingScreen} /><Stack.Screen name="RoleSelection" component={RoleSelectionScreen} /><Stack.Screen name="Auth" component={AuthScreen} /></>) : (<><Stack.Screen name="Main" component={CaregiverTabs} /><Stack.Screen name="AICopilot" component={AICopilotScreen} options={{ presentation: 'modal' }} /></>)}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 24 },
  homeContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { fontSize: 22, fontWeight: '700', color: '#1c1917' },
  hero: { flex: 1, justifyContent: 'center', paddingVertical: 40 },
  tagline: { fontSize: 36, fontWeight: '700', color: '#1c1917' },
  taglineAccent: { fontSize: 36, fontWeight: '700', color: '#25D366', marginBottom: 16 },
  heroDesc: { fontSize: 17, color: '#78716c', lineHeight: 26, marginBottom: 32 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  ctaBtnText: { fontSize: 17, fontWeight: '600', color: '#fff', marginRight: 10 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  featureCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#25D36615', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 13, fontWeight: '600', color: '#1c1917' },
  trustBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  trustText: { fontSize: 12, fontWeight: '600', color: '#25D366', letterSpacing: 0.5, marginLeft: 8 },
  roleContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f5f4', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  roleTitle: { fontSize: 28, fontWeight: '700', color: '#1c1917', marginTop: 32, marginBottom: 8 },
  roleSubtitle: { fontSize: 16, color: '#78716c', marginBottom: 16 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 20, padding: 20, marginBottom: 12 },
  roleIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleTextContainer: { flex: 1, marginLeft: 16 },
  roleCardTitle: { fontSize: 17, fontWeight: '600', color: '#1c1917', marginBottom: 4 },
  roleCardDesc: { fontSize: 14, color: '#78716c' },
  authContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  roleTag: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 24 },
  roleTagText: { fontSize: 13, fontWeight: '600' },
  authTitle: { fontSize: 28, fontWeight: '700', color: '#1c1917', marginTop: 24, marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: '#78716c', marginBottom: 32 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 14, paddingVertical: 14, marginBottom: 12 },
  socialBtnText: { fontSize: 16, fontWeight: '500', color: '#1c1917', marginLeft: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e7e5e4' },
  dividerText: { paddingHorizontal: 16, fontSize: 14, color: '#a8a29e' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#1c1917', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f4', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1c1917', marginBottom: 16 },
  loginBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  loginBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  toggleAuth: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  toggleAuthText: { fontSize: 15, color: '#78716c', marginRight: 6 },
  toggleAuthLink: { fontSize: 15, fontWeight: '600' },
  offlineContainer: { flex: 1, paddingHorizontal: 24 },
  offlineHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  caregiverPhoto: { width: 52, height: 52, borderRadius: 16 },
  greeting: { fontSize: 14, fontWeight: '500' },
  caregiverName: { fontSize: 20, fontWeight: '700' },
  patientCardOffline: { borderRadius: 24, padding: 20, borderWidth: 1 },
  patientCardLabel: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  patientCardRow: { flexDirection: 'row', alignItems: 'center' },
  patientPhotoLarge: { width: 60, height: 60, borderRadius: 16 },
  patientCardInfo: { flex: 1, marginLeft: 14 },
  patientName: { fontSize: 18, fontWeight: '600' },
  patientAge: { fontSize: 14, marginTop: 2 },
  startShiftSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  offlineText: { fontSize: 15, fontWeight: '500', marginBottom: 8 },
  startShiftTitle: { fontSize: 22, fontWeight: '700', marginBottom: 32, textAlign: 'center' },
  goButton: { position: 'relative', width: 130, height: 130, justifyContent: 'center', alignItems: 'center' },
  goButtonPulse: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#f43f5e', opacity: 0.2 },
  goButtonInner: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  tasksScheduled: { fontSize: 14, marginTop: 24 },
  patientHeaderContainer: { position: 'relative', height: 180 },
  patientHeaderPhoto: { position: 'absolute', width: '100%', height: '100%' },
  patientHeaderGradient: { position: 'absolute', width: '100%', height: '100%' },
  patientHeaderInfo: { position: 'absolute', bottom: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientHeaderName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  patientHeaderAge: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  vitalsContainer: { paddingHorizontal: 20, marginTop: -28 },
  vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalCard: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, alignItems: 'center', marginHorizontal: 2 },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  vitalValue: { fontSize: 15, fontWeight: '700' },
  vitalLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  progressSection: { paddingHorizontal: 20, paddingVertical: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '500' },
  progressCount: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#25D366', borderRadius: 4 },
  taskTabs: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  tabText: { fontSize: 15, fontWeight: '600', marginRight: 16 },
  tabDivider: { flex: 1, height: 1 },
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 52, height: 52, borderRadius: 16, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  taskCard: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  taskStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  taskContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  taskMain: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  taskTitleCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskTime: { fontSize: 13 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  taskExpandIcon: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  taskExpanded: { padding: 16, borderTopWidth: 1 },
  taskExpandedLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  taskExpandedText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  startTaskBtn: { backgroundColor: '#25D366', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  startTaskBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  requestCard: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  requestStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  requestContent: { padding: 16 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  requestBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  requestBadgeText: { fontSize: 11, fontWeight: '700' },
  requestTime: { fontSize: 13 },
  requestTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  requestDesc: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  requestBy: { fontSize: 13, marginBottom: 16 },
  requestActions: { flexDirection: 'row', justifyContent: 'space-between' },
  requestDeclineBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginRight: 6 },
  requestDeclineText: { fontSize: 15, fontWeight: '500' },
  requestAcceptBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#25D366', alignItems: 'center', marginLeft: 6 },
  requestAcceptText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  emptyState: { padding: 40, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyStateText: { fontSize: 15, marginTop: 12 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  taskSummary: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  taskSummaryTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  taskSummaryDesc: { fontSize: 14, lineHeight: 20 },
  photoSection: { marginBottom: 20 },
  photoLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  photoCapture: { height: 160, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  photoCaptureText: { fontSize: 15, fontWeight: '500', marginTop: 10 },
  noteSection: { marginBottom: 24 },
  noteLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  noteInput: { height: 100, borderRadius: 16, borderWidth: 1, padding: 14, fontSize: 15, textAlignVertical: 'top' },
  completeBtn: { flexDirection: 'row', backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  completeBtnText: { fontSize: 17, fontWeight: '600', color: '#fff', marginLeft: 10 },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 24 },
  profilePhoto: { width: 90, height: 90, borderRadius: 24, marginBottom: 14 },
  profileName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  profileAge: { fontSize: 15 },
  profileSection: { marginBottom: 20 },
  profileSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  profileSectionCard: { borderRadius: 16, overflow: 'hidden' },
  profileItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  profileItemText: { fontSize: 15 },
  emergencyCard: { borderRadius: 16, padding: 16 },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  emergencyName: { fontSize: 16, fontWeight: '600' },
  emergencyRelation: { fontSize: 14, marginBottom: 12, marginLeft: 28 },
  callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  callButtonText: { fontSize: 15, fontWeight: '600', color: '#fff', marginLeft: 8 },
  vitalTabs2: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  vitalTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  vitalTabText: { fontSize: 14, fontWeight: '500' },
  vitalCurrentCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  vitalCurrentLabel: { fontSize: 14, marginBottom: 8 },
  vitalCurrentValue: { fontSize: 40, fontWeight: '700' },
  vitalCurrentUnit: { fontSize: 18, fontWeight: '400' },
  recordVitalBtn: { flexDirection: 'row', backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recordVitalBtnText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  incidentScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  screenTitle: { fontSize: 28, fontWeight: '700', marginTop: 20, marginBottom: 6 },
  screenSubtitle: { fontSize: 15, marginBottom: 24 },
  newIncidentBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f43f5e', borderRadius: 16, padding: 16 },
  newIncidentTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  newIncidentSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  incidentCard: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  incidentStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  incidentContent: { padding: 16 },
  incidentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  incidentDesc: { fontSize: 14, marginBottom: 8 },
  incidentDate: { fontSize: 13 },
  incidentFormHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  incidentFormHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  incidentFormIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f43f5e15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  incidentFormTitle: { fontSize: 17, fontWeight: '600' },
  incidentFormStep: { fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  cancelBtnText: { fontSize: 15, fontWeight: '500' },
  stepProgress: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  incidentFormContent: { flex: 1, padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeCard: { width: (width - 64) / 2, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 },
  typeIconContainer: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  typeLabel: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  severityList: {},
  severityCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 12 },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  severityLabel: { fontSize: 16, fontWeight: '500' },
  textArea: { height: 120, borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 15, textAlignVertical: 'top' },
  stepNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  backStepBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginRight: 6 },
  backStepBtnText: { fontSize: 15, fontWeight: '500' },
  nextBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f43f5e', alignItems: 'center', marginLeft: 6 },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#25D366', alignItems: 'center', marginLeft: 6 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: { width: '100%', padding: 32, borderRadius: 24, alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  successDesc: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  successBtn: { backgroundColor: '#25D366', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  successBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  messageScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  conversationCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  conversationInfo: { flex: 1, marginLeft: 12 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conversationName: { fontSize: 15, fontWeight: '600' },
  conversationTime: { fontSize: 12 },
  conversationRole: { fontSize: 12, marginTop: 2 },
  conversationMessage: { fontSize: 14, marginTop: 4 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  shiftScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  shiftCard: { borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1 },
  shiftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shiftStatus: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  shiftStatusText: { fontSize: 17, fontWeight: '600' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  shiftDetails: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  shiftDetailRow: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  shiftDetailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  shiftDetailValue: { fontSize: 14, fontWeight: '600', color: '#fff' },
  shiftToggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  shiftToggleBtnText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 10 },
  earningsCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 20 },
  earningsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  earningsTitle: { fontSize: 16, fontWeight: '600' },
  earningsAmount: { fontSize: 32, fontWeight: '700' },
  earningsSubtext: { fontSize: 14, marginTop: 4 },
  menuScroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCardMenu: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, marginTop: 20 },
  profilePhotoMenu: { width: 56, height: 56, borderRadius: 16 },
  profileInfoMenu: { flex: 1, marginLeft: 14 },
  profileNameMenu: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  profileRoleMenu: { fontSize: 14 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, marginTop: 16, marginBottom: 16 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center' },
  themeIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '500' },
  themeValue: { fontSize: 13, marginTop: 2 },
  menuContainer: { borderRadius: 14, overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14 },
  signOutText: { fontSize: 15, fontWeight: '600' },
  appVersion: { textAlign: 'center', fontSize: 13, marginTop: 24 },
  copilotContainer: { flex: 1 },
  copilotHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  copilotBackBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  copilotHeaderTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  copilotIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  copilotTitle: { fontSize: 16, fontWeight: '600' },
  copilotSubtitle: { fontSize: 13 },
  messagesList: { flex: 1, padding: 14 },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, flexDirection: 'row', alignItems: 'flex-start' },
  aiAvatarSmall: { width: 22, height: 22, borderRadius: 7, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
  messageText: { fontSize: 15, lineHeight: 20, flex: 1 },
  loadingBubble: { alignSelf: 'flex-start', marginLeft: 14, marginBottom: 10, padding: 12, borderRadius: 16 },
  loadingDots: { flexDirection: 'row' },
  loadingDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  suggestionsContainer: { paddingVertical: 8 },
  suggestionsList: { paddingHorizontal: 14 },
  suggestionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, marginRight: 8 },
  suggestionText: { fontSize: 14, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, marginRight: 10 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

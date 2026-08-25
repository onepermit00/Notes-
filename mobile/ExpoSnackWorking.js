// ADLTrack - Working Expo Snack Version
// Paste this into https://snack.expo.dev

import React, { useState, createContext, useContext } from 'react';
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
  Switch,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ===== CONTEXTS =====
const ThemeContext = createContext();
const AuthContext = createContext();

const colors = {
  dark: {
    bg: '#0c0a09', card: '#1c1917', cardHover: '#292524',
    text: '#ffffff', textSec: '#a8a29e', textMuted: '#78716c',
    border: '#44403c', primary: '#25D366', danger: '#f43f5e',
  },
  light: {
    bg: '#ffffff', card: '#ffffff', cardHover: '#f5f5f4',
    text: '#1c1917', textSec: '#78716c', textMuted: '#a8a29e',
    border: '#e7e5e4', primary: '#25D366', danger: '#f43f5e',
  },
};

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? colors.dark : colors.light;
  return (
    <ThemeContext.Provider value={{ isDark, theme, setIsDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  return (
    <AuthContext.Provider value={{ 
      user, isAuth, 
      login: (u) => { setUser(u); setIsAuth(true); },
      logout: () => { setUser(null); setIsAuth(false); }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);
const useAuth = () => useContext(AuthContext);

// ===== MOCK DATA =====
const PATIENT = {
  name: 'David Smith',
  age: 78,
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&fit=crop',
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  allergies: ['Penicillin', 'Shellfish'],
  medications: [
    { name: 'Metformin', dose: '500mg twice daily' },
    { name: 'Lisinopril', dose: '10mg once daily' },
  ],
  emergency: { name: 'Mary Smith', relation: 'Daughter', phone: '(555) 234-5678' },
};

const CAREGIVER = {
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&fit=crop',
};

const TASKS = [
  { id: '1', title: 'Morning Medication', desc: 'Administer morning meds', time: '08:00 AM', priority: 'critical', status: 'pending', photo: true },
  { id: '2', title: 'Breakfast Assistance', desc: 'Help with breakfast', time: '08:30 AM', priority: 'standard', status: 'pending', photo: false },
  { id: '3', title: 'Blood Pressure Check', desc: 'Record BP reading', time: '10:30 AM', priority: 'critical', status: 'pending', photo: true },
  { id: '4', title: 'Morning Walk', desc: '15 min assisted walk', time: '11:00 AM', priority: 'quality', status: 'pending', photo: false },
  { id: '5', title: 'Lunch Preparation', desc: 'Prepare lunch', time: '12:00 PM', priority: 'standard', status: 'pending', photo: true },
  { id: '6', title: 'Afternoon Medication', desc: 'Give afternoon meds', time: '12:30 PM', priority: 'critical', status: 'pending', photo: true },
  { id: '7', title: 'Physical Therapy', desc: 'PT exercises', time: '03:00 PM', priority: 'standard', status: 'completed', photo: false, note: 'Completed all exercises' },
  { id: '8', title: 'Evening Medication', desc: 'Evening meds', time: '05:00 PM', priority: 'critical', status: 'pending', photo: true },
];

const REQUESTS = [
  { id: 'r1', title: 'Garden Walk', desc: 'Take dad to see the flowers', time: '04:00 PM', from: 'Mary Smith (Daughter)' },
  { id: 'r2', title: 'Video Call', desc: 'Help with grandkids video call', time: '05:30 PM', from: 'Tom Smith (Son)' },
];

const VITALS = {
  bp: { val: '120/76', label: 'BP' },
  hr: { val: '72', label: 'Heart' },
  temp: { val: '98.6°', label: 'Temp' },
  pain: { val: '2/10', label: 'Pain' },
};

const INCIDENTS = [
  { id: 1, type: 'Fall', status: 'resolved', desc: 'Minor slip in bathroom', date: 'Jan 15', by: 'Julia Martinez' },
  { id: 2, type: 'Confusion', status: 'open', desc: 'Confusion episode', date: 'Jan 16', by: 'Julia Martinez' },
];

// ===== LANDING SCREEN =====
function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={s.container}>
      <LinearGradient colors={['#ffffff', '#f0fdf4', '#dcfce7']} style={s.gradient}>
        <View style={s.landingHeader}>
          <View style={s.logoRow}>
            <View style={s.logoIcon}><Ionicons name="pulse" size={24} color="#fff" /></View>
            <Text style={s.logoText}>ADLTrack</Text>
          </View>
        </View>
        
        <View style={s.hero}>
          <Text style={s.tagline}>Simple. Secure.</Text>
          <Text style={s.taglineGreen}>Reliable Care.</Text>
          <Text style={s.heroDesc}>The caregiving coordination app that brings families and caregivers together.</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('RoleSelect')}>
            <Text style={s.ctaBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={s.features}>
          {[{i:'checkmark-circle',t:'Tasks'},{i:'heart',t:'Vitals'},{i:'chatbubbles',t:'Chat'}].map((f,idx) => (
            <View key={idx} style={s.featureCard}>
              <View style={s.featureIcon}><Ionicons name={f.i} size={24} color="#25D366" /></View>
              <Text style={s.featureText}>{f.t}</Text>
            </View>
          ))}
        </View>

        <View style={s.trust}>
          <Ionicons name="shield-checkmark" size={20} color="#25D366" />
          <Text style={s.trustText}>HIPAA Compliant</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ===== ROLE SELECTION =====
function RoleSelectScreen({ navigation }) {
  const { setIsDark } = useTheme();
  const roles = [
    { id: 'caregiver', title: 'Caregiver', icon: 'heart-circle', color: '#25D366', dark: true },
    { id: 'family', title: 'Family Member', icon: 'people', color: '#3b82f6', dark: false },
    { id: 'agency', title: 'Agency', icon: 'business', color: '#8b5cf6', dark: false },
  ];

  return (
    <SafeAreaView style={s.containerLight}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1c1917" />
      </TouchableOpacity>
      <Text style={s.pageTitle}>Choose Your Role</Text>
      <Text style={s.pageSubtitle}>Select how you'll use ADLTrack</Text>
      
      {roles.map(role => (
        <TouchableOpacity 
          key={role.id} 
          style={s.roleCard}
          onPress={() => { setIsDark(role.dark); navigation.navigate('Auth', { role: role.id }); }}
        >
          <View style={[s.roleIcon, { backgroundColor: role.color + '20' }]}>
            <Ionicons name={role.icon} size={32} color={role.color} />
          </View>
          <View style={s.roleInfo}>
            <Text style={s.roleTitle}>{role.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#a8a29e" />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

// ===== AUTH SCREEN =====
function AuthScreen({ navigation, route }) {
  const { login } = useAuth();
  const { setIsDark } = useTheme();
  const role = route.params?.role || 'caregiver';
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    setIsDark(role === 'caregiver');
    login({ name: CAREGIVER.name, role });
  };

  return (
    <SafeAreaView style={s.containerLight}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1c1917" />
        </TouchableOpacity>
        
        <Text style={s.pageTitle}>Welcome Back</Text>
        <Text style={s.pageSubtitle}>Sign in as {role}</Text>

        <TouchableOpacity style={s.socialBtn} onPress={handleLogin}>
          <Ionicons name="logo-google" size={20} color="#1c1917" />
          <Text style={s.socialBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
        </View>

        <TextInput 
          style={s.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail}
          placeholderTextColor="#a8a29e"
        />
        <TextInput 
          style={s.input} 
          placeholder="Password" 
          secureTextEntry
          placeholderTextColor="#a8a29e"
        />

        <TouchableOpacity style={s.primaryBtn} onPress={handleLogin}>
          <Text style={s.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== HOME SCREEN =====
function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState(TASKS);
  const [requests] = useState(REQUESTS);
  const [expanded, setExpanded] = useState(null);
  const [shiftOn, setShiftOn] = useState(false);
  const [tab, setTab] = useState('tasks');
  const [showPatient, setShowPatient] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [taskModal, setTaskModal] = useState(null);

  const done = tasks.filter(t => t.status === 'completed').length;

  const completeTask = (note) => {
    if (taskModal) {
      setTasks(tasks.map(t => t.id === taskModal.id ? { ...t, status: 'completed', note } : t));
      setTaskModal(null);
      setExpanded(null);
    }
  };

  // OFFLINE - Start Shift
  if (!shiftOn) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>  
        <View style={s.offlineWrap}>
          <View style={s.offlineHeader}>
            <Image source={{ uri: CAREGIVER.photo }} style={s.caregiverImg} />
            <View>
              <Text style={[s.greet, { color: theme.textMuted }]}>Good morning,</Text>
              <Text style={[s.caregiverName, { color: theme.text }]}>Julia</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[s.patientCardOff, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowPatient(true)}
          >
            <Text style={[s.patientLabel, { color: theme.textMuted }]}>Ready to care for</Text>
            <View style={s.patientRow}>
              <Image source={{ uri: PATIENT.photo }} style={s.patientImgLg} />
              <View style={s.patientInfo}>
                <Text style={[s.patientName, { color: theme.text }]}>{PATIENT.name}</Text>
                <Text style={[s.patientAge, { color: theme.textSec }]}>{PATIENT.age} years old</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={s.startSection}>
            <Text style={[s.offText, { color: theme.textMuted }]}>You're offline</Text>
            <Text style={[s.startTitle, { color: theme.text }]}>Tap to start your shift</Text>
            <TouchableOpacity style={s.goBtn} onPress={() => setShiftOn(true)}>
              <LinearGradient colors={['#f43f5e', '#e11d48']} style={s.goBtnInner}>
                <Ionicons name="play" size={48} color="#fff" style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[s.taskCount, { color: theme.textMuted }]}>{tasks.length} tasks scheduled</Text>
          </View>
        </View>
        <PatientModal visible={showPatient} onClose={() => setShowPatient(false)} theme={theme} />
      </SafeAreaView>
    );
  }

  // ONLINE - Dashboard
  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={s.patientHeader}>
          <Image source={{ uri: PATIENT.photo }} style={s.patientHeaderImg} />
          <LinearGradient colors={['transparent', 'rgba(12,10,9,0.8)']} style={s.patientGrad} />
          <TouchableOpacity style={s.patientHeaderInfo} onPress={() => setShowPatient(true)}>
            <View>
              <Text style={s.patientHeaderName}>{PATIENT.name}</Text>
              <Text style={s.patientHeaderAge}>{PATIENT.age} years old</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Vitals */}
        <View style={s.vitalsWrap}>
          <View style={s.vitalsGrid}>
            {Object.entries(VITALS).map(([key, v]) => (
              <TouchableOpacity 
                key={key} 
                style={[s.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setShowVitals(true)}
              >
                <View style={[s.vitalIcon, { backgroundColor: key === 'bp' ? '#f43f5e20' : key === 'hr' ? '#f9731620' : key === 'temp' ? '#3b82f620' : '#8b5cf620' }]}>
                  <Ionicons name={key === 'bp' ? 'heart' : key === 'hr' ? 'pulse' : key === 'temp' ? 'thermometer' : 'sad-outline'} size={18} color={key === 'bp' ? '#f43f5e' : key === 'hr' ? '#f97316' : key === 'temp' ? '#3b82f6' : '#8b5cf6'} />
                </View>
                <Text style={[s.vitalVal, { color: theme.text }]}>{v.val}</Text>
                <Text style={[s.vitalLabel, { color: theme.textSec }]}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={s.progressWrap}>
          <View style={s.progressRow}>
            <Text style={[s.progressLabel, { color: theme.textSec }]}>Today's Progress</Text>
            <Text style={[s.progressNum, { color: theme.text }]}>{done}/{tasks.length}</Text>
          </View>
          <View style={[s.progressBg, { backgroundColor: theme.cardHover }]}>
            <View style={[s.progressFill, { width: `${(done / tasks.length) * 100}%` }]} />
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity onPress={() => setTab('requests')}>
            <Text style={[s.tabText, { color: tab === 'requests' ? theme.text : theme.textMuted }]}>
              Requests {requests.length > 0 && `(${requests.length})`}
            </Text>
          </TouchableOpacity>
          <View style={[s.tabLine, { backgroundColor: theme.border }]} />
          <TouchableOpacity onPress={() => setTab('tasks')}>
            <Text style={[s.tabText, { color: tab === 'tasks' ? theme.text : theme.textMuted }]}>Today's Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View style={s.taskList}>
          {tab === 'tasks' ? (
            tasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[s.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => task.status !== 'completed' && setExpanded(expanded === task.id ? null : task.id)}
              >
                <View style={[s.taskStripe, { backgroundColor: task.status === 'completed' ? '#25D366' : task.priority === 'critical' ? '#f43f5e' : '#3b82f6' }]} />
                <View style={s.taskContent}>
                  <View style={s.taskMain}>
                    <Text style={[s.taskTitle, { color: theme.text }, task.status === 'completed' && s.taskDone]}>{task.title}</Text>
                    <View style={s.taskMeta}>
                      <Ionicons name="time-outline" size={14} color={theme.textSec} />
                      <Text style={[s.taskTime, { color: theme.textSec }]}>{task.time}</Text>
                      {task.photo && task.status !== 'completed' && (
                        <View style={[s.photoBadge, { backgroundColor: theme.cardHover }]}>
                          <Ionicons name="camera" size={12} color={theme.textSec} />
                        </View>
                      )}
                    </View>
                    {task.status === 'completed' && task.note && (
                      <Text style={[s.taskNote, { color: theme.textMuted }]}>"{task.note}"</Text>
                    )}
                  </View>
                  {task.status !== 'completed' && (
                    <View style={[s.expandIcon, { borderColor: theme.border }]}>
                      <Ionicons name={expanded === task.id ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textMuted} />
                    </View>
                  )}
                </View>
                {expanded === task.id && task.status !== 'completed' && (
                  <View style={[s.taskExpanded, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
                    <Text style={[s.expandLabel, { color: theme.textMuted }]}>DESCRIPTION</Text>
                    <Text style={[s.expandText, { color: theme.textSec }]}>{task.desc}</Text>
                    <TouchableOpacity style={s.startTaskBtn} onPress={() => setTaskModal(task)}>
                      <Text style={s.startTaskBtnText}>Start Task</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            requests.length > 0 ? requests.map(req => (
              <View key={req.id} style={[s.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[s.requestStripe, { backgroundColor: '#25D366' }]} />
                <View style={s.requestContent}>
                  <View style={[s.requestBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[s.requestBadgeText, { color: theme.primary }]}>REQUEST</Text>
                  </View>
                  <Text style={[s.requestTitle, { color: theme.text }]}>{req.title}</Text>
                  <Text style={[s.requestDesc, { color: theme.textSec }]}>{req.desc}</Text>
                  <Text style={[s.requestFrom, { color: theme.textMuted }]}>From: {req.from}</Text>
                  <View style={s.requestActions}>
                    <TouchableOpacity style={[s.declineBtn, { borderColor: theme.border }]}>
                      <Text style={[s.declineBtnText, { color: theme.textSec }]}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.acceptBtn}>
                      <Text style={s.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )) : (
              <View style={[s.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="sparkles" size={40} color={theme.textMuted} />
                <Text style={[s.emptyText, { color: theme.textMuted }]}>No pending requests</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AICopilot')}>
        <Ionicons name="sparkles" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <PatientModal visible={showPatient} onClose={() => setShowPatient(false)} theme={theme} />
      <VitalsModal visible={showVitals} onClose={() => setShowVitals(false)} theme={theme} />
      <TaskModal visible={!!taskModal} task={taskModal} onClose={() => setTaskModal(null)} onComplete={completeTask} theme={theme} />
    </SafeAreaView>
  );
}

// ===== PATIENT MODAL =====
function PatientModal({ visible, onClose, theme }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modal, { backgroundColor: theme.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
          <Text style={[s.modalTitle, { color: theme.text }]}>Patient Profile</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={s.modalBody}>
          <View style={[s.profileCard, { backgroundColor: theme.card }]}>
            <Image source={{ uri: PATIENT.photo }} style={s.profileImg} />
            <Text style={[s.profileName, { color: theme.text }]}>{PATIENT.name}</Text>
            <Text style={[s.profileAge, { color: theme.textSec }]}>{PATIENT.age} years old</Text>
          </View>
          
          <Text style={[s.sectionLabel, { color: theme.text }]}>Conditions</Text>
          <View style={[s.listCard, { backgroundColor: theme.card }]}>
            {PATIENT.conditions.map((c, i) => (
              <View key={i} style={[s.listItem, i < PATIENT.conditions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="medical" size={18} color={theme.primary} />
                <Text style={[s.listText, { color: theme.text }]}>{c}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: theme.text }]}>Allergies</Text>
          <View style={[s.listCard, { backgroundColor: theme.card }]}>
            {PATIENT.allergies.map((a, i) => (
              <View key={i} style={[s.listItem, i < PATIENT.allergies.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <Ionicons name="warning" size={18} color={theme.danger} />
                <Text style={[s.listText, { color: theme.text }]}>{a}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: theme.text }]}>Medications</Text>
          <View style={[s.listCard, { backgroundColor: theme.card }]}>
            {PATIENT.medications.map((m, i) => (
              <View key={i} style={[s.listItem, s.listItemCol, i < PATIENT.medications.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                <View style={s.listItemRow}>
                  <Ionicons name="medkit" size={18} color="#3b82f6" />
                  <Text style={[s.listText, { color: theme.text }]}>{m.name}</Text>
                </View>
                <Text style={[s.listSub, { color: theme.textSec }]}>{m.dose}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: theme.text }]}>Emergency Contact</Text>
          <View style={[s.emergencyCard, { backgroundColor: theme.danger + '15' }]}>
            <View style={s.emergencyRow}>
              <Ionicons name="call" size={20} color={theme.danger} />
              <Text style={[s.emergencyName, { color: theme.text }]}>{PATIENT.emergency.name}</Text>
            </View>
            <Text style={[s.emergencyRel, { color: theme.textSec }]}>{PATIENT.emergency.relation}</Text>
            <TouchableOpacity style={[s.callBtn, { backgroundColor: theme.danger }]}>
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={s.callBtnText}>{PATIENT.emergency.phone}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ===== VITALS MODAL =====
function VitalsModal({ visible, onClose, theme }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modal, { backgroundColor: theme.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
          <Text style={[s.modalTitle, { color: theme.text }]}>Vitals</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={s.modalBody}>
          <View style={[s.vitalsDetailCard, { backgroundColor: theme.card }]}>
            <Text style={[s.vitalsDetailLabel, { color: theme.textSec }]}>Blood Pressure</Text>
            <Text style={[s.vitalsDetailVal, { color: theme.text }]}>120/76 <Text style={{ color: theme.textSec, fontSize: 18 }}>mmHg</Text></Text>
          </View>
          <View style={[s.vitalsDetailCard, { backgroundColor: theme.card }]}>
            <Text style={[s.vitalsDetailLabel, { color: theme.textSec }]}>Heart Rate</Text>
            <Text style={[s.vitalsDetailVal, { color: theme.text }]}>72 <Text style={{ color: theme.textSec, fontSize: 18 }}>bpm</Text></Text>
          </View>
          <View style={[s.vitalsDetailCard, { backgroundColor: theme.card }]}>
            <Text style={[s.vitalsDetailLabel, { color: theme.textSec }]}>Temperature</Text>
            <Text style={[s.vitalsDetailVal, { color: theme.text }]}>98.6 <Text style={{ color: theme.textSec, fontSize: 18 }}>°F</Text></Text>
          </View>
          <View style={[s.vitalsDetailCard, { backgroundColor: theme.card }]}>
            <Text style={[s.vitalsDetailLabel, { color: theme.textSec }]}>Pain Level</Text>
            <Text style={[s.vitalsDetailVal, { color: theme.text }]}>2 <Text style={{ color: theme.textSec, fontSize: 18 }}>/10</Text></Text>
          </View>
          <TouchableOpacity style={s.recordBtn}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.recordBtnText}>Record New Vitals</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ===== TASK MODAL =====
function TaskModal({ visible, task, onClose, onComplete, theme }) {
  const [note, setNote] = useState('');
  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[s.modal, { backgroundColor: theme.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
          <Text style={[s.modalTitle, { color: theme.text }]}>Complete Task</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={s.modalBody}>
          <View style={[s.taskSummary, { backgroundColor: theme.card }]}>
            <Text style={[s.taskSummaryTitle, { color: theme.text }]}>{task.title}</Text>
            <Text style={[s.taskSummaryDesc, { color: theme.textSec }]}>{task.desc}</Text>
          </View>

          {task.photo && (
            <View style={s.photoSection}>
              <Text style={[s.photoLabel, { color: theme.text }]}>Photo Evidence (Required)</Text>
              <TouchableOpacity style={[s.photoCapture, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="camera" size={40} color={theme.primary} />
                <Text style={[s.photoCaptureText, { color: theme.text }]}>Tap to Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.noteSection}>
            <Text style={[s.noteLabel, { color: theme.text }]}>Completion Note</Text>
            <TextInput
              style={[s.noteInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="Add notes..."
              placeholderTextColor={theme.textMuted}
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchableOpacity style={s.completeBtn} onPress={() => { onComplete(note); setNote(''); }}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={s.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ===== INCIDENT SCREEN =====
function IncidentScreen() {
  const { theme } = useTheme();
  const [incidents] = useState(INCIDENTS);
  const open = incidents.filter(i => i.status === 'open').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.screenPad}>
        <Text style={[s.screenTitle, { color: theme.text }]}>Incidents</Text>
        <Text style={[s.screenSub, { color: theme.textSec }]}>Report and track incidents</Text>

        <TouchableOpacity style={s.newIncidentBtn}>
          <View style={s.newIncidentContent}>
            <View style={s.newIncidentIcon}><Ionicons name="add-circle" size={28} color="#fff" /></View>
            <View>
              <Text style={s.newIncidentTitle}>New Incident Report</Text>
              <Text style={s.newIncidentSub}>Document an incident</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[s.summaryNum, { color: theme.text }]}>{incidents.length}</Text>
            <Text style={[s.summaryLabel, { color: theme.textSec }]}>Total</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[s.summaryNum, { color: theme.danger }]}>{open}</Text>
            <Text style={[s.summaryLabel, { color: theme.textSec }]}>Open</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[s.summaryNum, { color: theme.primary }]}>{resolved}</Text>
            <Text style={[s.summaryLabel, { color: theme.textSec }]}>Resolved</Text>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: theme.text }]}>Past Reports</Text>
          <View style={s.countBadge}><Text style={s.countBadgeText}>{incidents.length}</Text></View>
        </View>

        {incidents.map(inc => (
          <View key={inc.id} style={[s.incidentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.incidentHeader}>
              <View style={s.incidentLeft}>
                <View style={[s.incidentIcon, { backgroundColor: theme.danger + '20' }]}>
                  <Ionicons name="alert-circle" size={20} color={theme.danger} />
                </View>
                <View style={[s.statusBadge, { backgroundColor: inc.status === 'open' ? theme.danger : theme.primary }]}>
                  <Text style={s.statusBadgeText}>{inc.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[s.incidentDate, { color: theme.textSec }]}>{inc.date}</Text>
            </View>
            <Text style={[s.incidentTitle, { color: theme.text }]}>{inc.type} Incident</Text>
            <Text style={[s.incidentDesc, { color: theme.textSec }]}>{inc.desc}</Text>
            <Text style={[s.incidentBy, { color: theme.textMuted }]}>Reported by {inc.by}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== MESSAGE SCREEN =====
function MessageScreen() {
  const { theme } = useTheme();
  const convos = [
    { id: '1', name: 'Mary Smith', role: 'Daughter', msg: 'Thank you!', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Dr. Johnson', role: 'Physician', msg: 'Monitor BP', time: 'Yesterday', unread: 0 },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={s.msgHeader}>
        <Text style={[s.screenTitle, { color: theme.text }]}>Messages</Text>
        <TouchableOpacity style={[s.newMsgBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.screenPad}>
        {convos.map(c => (
          <TouchableOpacity key={c.id} style={[s.convoCard, { backgroundColor: theme.card }]}>
            <View style={[s.avatar, { backgroundColor: theme.primary }]}>
              <Text style={s.avatarText}>{c.name.split(' ').map(n => n[0]).join('')}</Text>
            </View>
            <View style={s.convoInfo}>
              <View style={s.convoRow}>
                <Text style={[s.convoName, { color: theme.text }]}>{c.name}</Text>
                <Text style={[s.convoTime, { color: theme.textSec }]}>{c.time}</Text>
              </View>
              <Text style={[s.convoRole, { color: theme.textMuted }]}>{c.role}</Text>
              <Text style={[s.convoMsg, { color: theme.textSec }]} numberOfLines={1}>{c.msg}</Text>
            </View>
            {c.unread > 0 && (
              <View style={[s.unread, { backgroundColor: theme.primary }]}>
                <Text style={s.unreadText}>{c.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== SHIFTS SCREEN =====
function ShiftsScreen() {
  const { theme } = useTheme();
  const [active, setActive] = useState(true);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.screenPad}>
        <Text style={[s.screenTitle, { color: theme.text }]}>Shifts</Text>
        <Text style={[s.screenSub, { color: theme.textSec }]}>Manage your schedule</Text>

        <View style={[s.shiftCard, { backgroundColor: active ? theme.primary : theme.card, borderColor: active ? theme.primary : theme.border }]}>
          <View style={s.shiftHeader}>
            <View style={s.shiftStatus}>
              <View style={[s.statusDot, { backgroundColor: active ? '#fff' : theme.textMuted }]} />
              <Text style={[s.shiftStatusText, { color: active ? '#fff' : theme.text }]}>
                {active ? 'Shift Active' : 'No Active Shift'}
              </Text>
            </View>
            {active && (
              <View style={s.liveBadge}>
                <View style={s.liveIndicator} />
                <Text style={s.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {active && (
            <View style={s.shiftDetails}>
              <View style={s.shiftDetailRow}>
                <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View><Text style={s.shiftDetailLabel}>Started</Text><Text style={s.shiftDetailVal}>8:00 AM</Text></View>
              </View>
              <View style={s.shiftDetailRow}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View><Text style={s.shiftDetailLabel}>Patient</Text><Text style={s.shiftDetailVal}>{PATIENT.name}</Text></View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[s.shiftToggle, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : theme.danger }]}
            onPress={() => setActive(!active)}
          >
            <Ionicons name={active ? 'stop' : 'play'} size={20} color="#fff" />
            <Text style={s.shiftToggleText}>{active ? 'End Shift' : 'Start Shift'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.earningsCard, { backgroundColor: theme.card }]}>
          <Ionicons name="wallet" size={24} color={theme.primary} />
          <Text style={[s.earningsTitle, { color: theme.text }]}>This Week</Text>
          <Text style={[s.earningsAmt, { color: theme.primary }]}>$397.50</Text>
          <Text style={[s.earningsSub, { color: theme.textSec }]}>26.5 hours worked</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== MENU SCREEN =====
function MenuScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const items = [
    { id: 'earn', label: 'Earnings', icon: 'cash-outline', color: '#25D366' },
    { id: 'hist', label: 'Shift History', icon: 'time-outline', color: '#3b82f6' },
    { id: 'set', label: 'Settings', icon: 'settings-outline', color: '#8b5cf6' },
    { id: 'help', label: 'Support', icon: 'help-circle-outline', color: '#f59e0b' },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.screenPad}>
        <Text style={[s.screenTitle, { color: theme.text }]}>Menu</Text>

        <View style={[s.profileMenu, { backgroundColor: theme.card }]}>
          <Image source={{ uri: CAREGIVER.photo }} style={s.profileMenuImg} />
          <View style={s.profileMenuInfo}>
            <Text style={[s.profileMenuName, { color: theme.text }]}>{CAREGIVER.name}</Text>
            <Text style={[s.profileMenuRole, { color: theme.textSec }]}>{CAREGIVER.role}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSec} />
        </View>

        <View style={[s.themeRow, { backgroundColor: theme.card }]}>
          <View style={s.themeLeft}>
            <View style={[s.themeIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[s.themeLabel, { color: theme.text }]}>Appearance</Text>
              <Text style={[s.themeVal, { color: theme.textSec }]}>{isDark ? 'Dark' : 'Light'} Mode</Text>
            </View>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.primary + '50' }} thumbColor={isDark ? theme.primary : '#f4f3f4'} />
        </View>

        <View style={[s.menuList, { backgroundColor: theme.card }]}>
          {items.map((item, i) => (
            <TouchableOpacity key={item.id} style={[s.menuItem, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={s.menuItemLeft}>
                <View style={[s.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[s.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSec} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.signOutBtn, { backgroundColor: theme.danger + '15' }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={[s.signOutText, { color: theme.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: theme.textMuted }]}>ADLTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== AI COPILOT =====
function AICopilotScreen({ navigation }) {
  const { theme } = useTheme();
  const [msgs, setMsgs] = useState([{ id: '1', role: 'ai', text: "Hello! I'm your AI Care Assistant. How can I help?" }]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { id: Date.now().toString(), role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMsgs(m => [...m, { id: (Date.now() + 1).toString(), role: 'ai', text: "I understand. Based on David's care plan, I recommend checking the task details and documenting completion. How else can I help?" }]);
    }, 1000);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={[s.copilotHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={s.copilotBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={s.copilotTitleRow}>
          <View style={s.copilotIcon}><Ionicons name="sparkles" size={18} color="#fff" /></View>
          <View>
            <Text style={[s.copilotTitle, { color: theme.text }]}>AI Care Assistant</Text>
            <Text style={[s.copilotSub, { color: theme.textSec }]}>Always here to help</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={msgs}
        keyExtractor={m => m.id}
        contentContainerStyle={s.msgList}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? [s.userBubble, { backgroundColor: theme.primary }] : [s.aiBubble, { backgroundColor: theme.card }]]}>
            {item.role === 'ai' && <View style={s.aiAvatar}><Ionicons name="sparkles" size={12} color="#fff" /></View>}
            <Text style={[s.bubbleText, { color: item.role === 'user' ? '#fff' : theme.text }]}>{item.text}</Text>
          </View>
        )}
      />

      <View style={s.suggestions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Log vitals', 'Care plan', 'Report concern'].map((s, i) => (
            <TouchableOpacity key={i} style={[s.chip, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => { setInput(s); send(); }}>
              <Text style={[s.chipText, { color: theme.text }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[s.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput 
          style={[s.chatInput, { backgroundColor: theme.bg, color: theme.text }]}
          placeholder="Ask anything..."
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={[s.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.border }]} onPress={send}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ===== NAVIGATION =====
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 85, paddingTop: 8, paddingBottom: 28 },
      tabBarActiveTintColor: route.name === 'Incident' ? theme.danger : theme.primary,
      tabBarInactiveTintColor: theme.textMuted,
      tabBarIcon: ({ color }) => {
        const icons = { Home: 'home-outline', Incident: 'alert-circle-outline', Message: 'chatbubble-outline', Shifts: 'time-outline', Menu: 'menu-outline' };
        return <Ionicons name={icons[route.name]} size={24} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Incident" component={IncidentScreen} />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftsScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

function AppNav() {
  const { isAuth } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuth ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="AICopilot" component={AICopilotScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===== STYLES =====
const s = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  gradient: { flex: 1, paddingHorizontal: 24 },
  
  // Landing
  landingHeader: { paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginLeft: 12 },
  hero: { paddingTop: 48 },
  tagline: { fontSize: 36, fontWeight: '700', color: '#1c1917' },
  taglineGreen: { fontSize: 36, fontWeight: '700', color: '#25D366', marginBottom: 16 },
  heroDesc: { fontSize: 18, color: '#57534e', lineHeight: 28, marginBottom: 32 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignSelf: 'flex-start' },
  ctaBtnText: { fontSize: 18, fontWeight: '600', color: '#fff', marginRight: 8 },
  features: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 48 },
  featureCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  featureIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#25D36620', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureText: { fontSize: 13, fontWeight: '600', color: '#1c1917' },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 24 },
  trustText: { fontSize: 14, fontWeight: '600', color: '#57534e', marginLeft: 8 },

  // Role
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f5f4', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  pageTitle: { fontSize: 32, fontWeight: '700', color: '#1c1917', marginTop: 32 },
  pageSubtitle: { fontSize: 18, color: '#78716c', marginTop: 8, marginBottom: 32 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e7e5e4', marginBottom: 16 },
  roleIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleInfo: { flex: 1, marginLeft: 16 },
  roleTitle: { fontSize: 20, fontWeight: '600', color: '#1c1917' },

  // Auth
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
  socialBtnText: { fontSize: 16, fontWeight: '500', color: '#1c1917', marginLeft: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e7e5e4' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#a8a29e' },
  input: { backgroundColor: '#f5f5f4', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  primaryBtn: { backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Offline
  offlineWrap: { flex: 1, padding: 24 },
  offlineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  caregiverImg: { width: 56, height: 56, borderRadius: 16, marginRight: 16 },
  greet: { fontSize: 14, marginBottom: 2 },
  caregiverName: { fontSize: 24, fontWeight: '700' },
  patientCardOff: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 40 },
  patientLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  patientRow: { flexDirection: 'row', alignItems: 'center' },
  patientImgLg: { width: 64, height: 64, borderRadius: 18 },
  patientInfo: { flex: 1, marginLeft: 16 },
  patientName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  patientAge: { fontSize: 14 },
  startSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offText: { fontSize: 14, marginBottom: 8 },
  startTitle: { fontSize: 20, fontWeight: '600', marginBottom: 32 },
  goBtn: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  goBtnInner: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  taskCount: { fontSize: 14 },

  // Patient Header
  patientHeader: { position: 'relative', height: 180 },
  patientHeaderImg: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' },
  patientGrad: { position: 'absolute', width: '100%', height: '100%' },
  patientHeaderInfo: { position: 'absolute', bottom: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientHeaderName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  patientHeaderAge: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  // Vitals
  vitalsWrap: { paddingHorizontal: 20, marginTop: -24, zIndex: 10 },
  vitalsGrid: { flexDirection: 'row', gap: 8 },
  vitalCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  vitalVal: { fontSize: 16, fontWeight: '700' },
  vitalLabel: { fontSize: 10, marginTop: 2 },

  // Progress
  progressWrap: { paddingHorizontal: 20, paddingVertical: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '500' },
  progressNum: { fontSize: 14, fontWeight: '700' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#25D366', borderRadius: 4 },

  // Tabs
  tabs: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16, gap: 16 },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabLine: { flex: 1, height: 1 },

  // Tasks
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  taskStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  taskContent: { flexDirection: 'row', paddingLeft: 16, paddingRight: 16, paddingVertical: 16 },
  taskMain: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  taskDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskTime: { fontSize: 13, marginLeft: 4 },
  photoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  taskNote: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  expandIcon: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  taskExpanded: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16, borderTopWidth: 1 },
  expandLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  expandText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  startTaskBtn: { backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  startTaskBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Requests
  requestCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  requestStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  requestContent: { paddingLeft: 16, paddingRight: 16, paddingVertical: 16 },
  requestBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  requestBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  requestTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  requestDesc: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  requestFrom: { fontSize: 12, fontStyle: 'italic', marginBottom: 16 },
  requestActions: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  declineBtnText: { fontSize: 14, fontWeight: '600' },
  acceptBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#25D366', alignItems: 'center' },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Empty
  empty: { padding: 40, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14, marginTop: 12 },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 30, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', elevation: 8 },

  // Modal
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { flex: 1, padding: 20 },

  // Profile
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 20, marginBottom: 20 },
  profileImg: { width: 100, height: 100, borderRadius: 28, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  profileAge: { fontSize: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  listCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  listItemCol: { flexDirection: 'column', alignItems: 'flex-start' },
  listItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listText: { fontSize: 15 },
  listSub: { fontSize: 13, marginTop: 4, marginLeft: 30 },
  emergencyCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  emergencyName: { fontSize: 17, fontWeight: '600' },
  emergencyRel: { fontSize: 14, marginLeft: 30, marginBottom: 14 },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10 },
  callBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Vitals Detail
  vitalsDetailCard: { padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  vitalsDetailLabel: { fontSize: 14, marginBottom: 8 },
  vitalsDetailVal: { fontSize: 36, fontWeight: '700' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 16, marginTop: 16, gap: 8 },
  recordBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Task Modal
  taskSummary: { padding: 16, borderRadius: 16, marginBottom: 20 },
  taskSummaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  taskSummaryDesc: { fontSize: 14, lineHeight: 20 },
  photoSection: { marginBottom: 20 },
  photoLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  photoCapture: { height: 160, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 12 },
  photoCaptureText: { fontSize: 16, fontWeight: '500' },
  noteSection: { marginBottom: 20 },
  noteLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  noteInput: { height: 100, borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1, textAlignVertical: 'top' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', paddingVertical: 16, borderRadius: 16, gap: 10 },
  completeBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },

  // Incidents
  screenPad: { paddingHorizontal: 20, paddingBottom: 100 },
  screenTitle: { fontSize: 28, fontWeight: '700', marginTop: 16 },
  screenSub: { fontSize: 15, marginTop: 4, marginBottom: 20 },
  newIncidentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f43f5e', padding: 20, borderRadius: 20, marginBottom: 20 },
  newIncidentContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  newIncidentIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  newIncidentTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  newIncidentSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '700' },
  summaryLabel: { fontSize: 13, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  countBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#f43f5e' },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  incidentCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  incidentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incidentIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  incidentDate: { fontSize: 13 },
  incidentTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  incidentDesc: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  incidentBy: { fontSize: 12, fontStyle: 'italic' },

  // Messages
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  newMsgBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  convoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  convoInfo: { flex: 1, marginLeft: 14 },
  convoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convoName: { fontSize: 16, fontWeight: '600' },
  convoTime: { fontSize: 12 },
  convoRole: { fontSize: 11, marginTop: 2 },
  convoMsg: { fontSize: 14, marginTop: 6 },
  unread: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Shifts
  shiftCard: { borderRadius: 24, padding: 20, marginTop: 20, borderWidth: 1 },
  shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shiftStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  shiftStatusText: { fontSize: 17, fontWeight: '600' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  shiftDetails: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  shiftDetailRow: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  shiftDetailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  shiftDetailVal: { fontSize: 15, fontWeight: '600', color: '#fff' },
  shiftToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 10 },
  shiftToggleText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  earningsCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 24 },
  earningsTitle: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  earningsAmt: { fontSize: 36, fontWeight: '700', marginVertical: 4 },
  earningsSub: { fontSize: 14 },

  // Menu
  profileMenu: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 20, marginBottom: 16 },
  profileMenuImg: { width: 60, height: 60, borderRadius: 16 },
  profileMenuInfo: { flex: 1, marginLeft: 16 },
  profileMenuName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  profileMenuRole: { fontSize: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 16 },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  themeIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 16, fontWeight: '500' },
  themeVal: { fontSize: 13, marginTop: 2 },
  menuList: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  signOutText: { fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 13, marginTop: 24 },

  // AI Copilot
  copilotHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  copilotBack: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  copilotTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 12 },
  copilotIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  copilotTitle: { fontSize: 17, fontWeight: '600' },
  copilotSub: { fontSize: 13 },
  msgList: { padding: 16 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 18, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, flexDirection: 'row', alignItems: 'flex-start' },
  aiAvatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22, flex: 1 },
  suggestions: { paddingVertical: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 14, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, gap: 10 },
  chatInput: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 18, fontSize: 16 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

// ===== APP =====
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

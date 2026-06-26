// ADLTrack - Expo Snack Version
// Copy this entire file to: https://snack.expo.dev

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
  Alert,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ============ THEME CONTEXT ============
const ThemeContext = createContext();

const colors = {
  dark: {
    background: '#0c0a09',
    card: '#1c1917',
    text: '#ffffff',
    textSecondary: '#a8a29e',
    border: '#44403c',
    primary: '#25D366',
    danger: '#f43f5e',
  },
  light: {
    background: '#ffffff',
    card: '#ffffff',
    text: '#1c1917',
    textSecondary: '#78716c',
    border: '#e7e5e4',
    primary: '#25D366',
    danger: '#f43f5e',
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

// ============ MOCK DATA ============
const mockPatient = {
  name: 'Johnathan Doe',
  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
  age: 78,
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Dementia'],
};

const mockTasks = [
  { id: '1', title: 'Morning Medication', time: '8:00 AM', priority: 'critical', status: 'pending', requiresPhoto: true },
  { id: '2', title: 'Blood Pressure Check', time: '8:30 AM', priority: 'critical', status: 'pending', requiresPhoto: false },
  { id: '3', title: 'Breakfast Assistance', time: '9:00 AM', priority: 'standard', status: 'pending', requiresPhoto: true },
  { id: '4', title: 'Morning Hygiene', time: '10:00 AM', priority: 'standard', status: 'completed', requiresPhoto: false },
  { id: '5', title: 'Physical Therapy', time: '11:00 AM', priority: 'standard', status: 'pending', requiresPhoto: true },
];

const mockVitals = {
  bp: { value: '128/82', unit: 'mmHg' },
  hr: { value: '72', unit: 'bpm' },
  temp: { value: '98.4', unit: '°F' },
  pain: { value: '2', unit: '/10' },
};

// ============ LANDING SCREEN ============
const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.landingContainer}>
      <LinearGradient colors={['#ffffff', '#f0fdf4', '#dcfce7']} style={styles.gradient}>
        <View style={styles.landingHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>ADLTrack</Text>
          </View>
        </View>

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

        <View style={styles.featuresRow}>
          {[
            { icon: 'checkmark-circle', title: 'Tasks' },
            { icon: 'heart', title: 'Vitals' },
            { icon: 'chatbubbles', title: 'Chat' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={24} color="#25D366" />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ============ ROLE SELECTION ============
const RoleSelectionScreen = ({ navigation }) => {
  const { setIsDark } = useTheme();
  
  const roles = [
    { id: 'caregiver', title: 'Caregiver', icon: 'heart-circle', color: '#25D366', dark: true },
    { id: 'family', title: 'Family Member', icon: 'people', color: '#3b82f6', dark: false },
    { id: 'agency', title: 'Agency', icon: 'business', color: '#8b5cf6', dark: false },
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
      <Text style={styles.roleSubtitle}>Select how you'll use ADLTrack</Text>
      
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={styles.roleCard}
          onPress={() => selectRole(role)}
        >
          <View style={[styles.roleIcon, { backgroundColor: `${role.color}20` }]}>
            <Ionicons name={role.icon} size={32} color={role.color} />
          </View>
          <Text style={styles.roleCardTitle}>{role.title}</Text>
          <Ionicons name="chevron-forward" size={24} color="#a8a29e" />
        </TouchableOpacity>
      ))}
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

  const handleLogin = () => {
    setIsDark(role === 'caregiver');
    login({ name: email.split('@')[0] || 'Sarah Jenkins', role });
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1c1917" />
      </TouchableOpacity>
      
      <Text style={styles.authTitle}>Welcome Back</Text>
      <Text style={styles.authSubtitle}>Sign in as {role}</Text>

      <TouchableOpacity style={styles.socialBtn}>
        <Ionicons name="logo-google" size={20} color="#1c1917" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#a8a29e"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#a8a29e"
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ============ HOME SCREEN ============
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState(mockTasks);
  const completed = tasks.filter(t => t.status === 'completed').length;

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    ));
  };

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        {/* Patient Card */}
        <TouchableOpacity style={[styles.patientCard, { backgroundColor: theme.card }]}>
          <Image source={{ uri: mockPatient.photo }} style={styles.patientPhoto} />
          <View style={styles.patientInfo}>
            <Text style={[styles.patientName, { color: theme.text }]}>{mockPatient.name}</Text>
            <Text style={[styles.patientAge, { color: theme.textSecondary }]}>
              {mockPatient.age} years • {mockPatient.conditions[0]}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          {[
            { icon: 'heart', label: 'BP', ...mockVitals.bp },
            { icon: 'pulse', label: 'Heart Rate', ...mockVitals.hr },
            { icon: 'thermometer', label: 'Temp', ...mockVitals.temp },
            { icon: 'fitness', label: 'Pain', ...mockVitals.pain },
          ].map((v, i) => (
            <View key={i} style={[styles.vitalCard, { backgroundColor: theme.card }]}>
              <View style={[styles.vitalIcon, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name={v.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.vitalValue, { color: theme.text }]}>
                {v.value}<Text style={{ color: theme.textSecondary, fontSize: 12 }}> {v.unit}</Text>
              </Text>
              <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>{v.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Today's Progress</Text>
            <Text style={{ color: theme.textSecondary }}>{completed}/{tasks.length}</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressBarFill, { width: `${(completed/tasks.length)*100}%` }]} />
          </View>
        </View>

        {/* Tasks */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Tasks</Text>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, { backgroundColor: theme.card }]}
            onPress={() => toggleTask(task.id)}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.priorityBadge, { 
                backgroundColor: task.priority === 'critical' ? theme.danger : theme.textSecondary 
              }]}>
                <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
              </View>
              {task.requiresPhoto && (
                <Ionicons name="camera" size={14} color={theme.primary} style={{ marginLeft: 8 }} />
              )}
              <Text style={[styles.taskTime, { color: theme.textSecondary }]}>{task.time}</Text>
            </View>
            <View style={styles.taskTitleRow}>
              {task.status === 'completed' && (
                <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <Text style={[
                styles.taskTitle, 
                { color: theme.text },
                task.status === 'completed' && styles.taskCompleted
              ]}>
                {task.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* AI Copilot FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AICopilot')}
      >
        <Ionicons name="sparkles" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ============ INCIDENT SCREEN ============
const IncidentScreen = () => {
  const { theme } = useTheme();
  const [incidents] = useState([
    { id: 1, type: 'fall', title: 'Minor Fall', status: 'resolved', date: 'Jan 15' },
    { id: 2, type: 'behavior', title: 'Confusion Episode', status: 'open', date: 'Jan 16' },
  ]);

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Incidents</Text>
        
        <TouchableOpacity style={[styles.newIncidentBtn, { backgroundColor: theme.danger }]}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.newIncidentText}>New Incident Report</Text>
        </TouchableOpacity>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.text }]}>{incidents.length}</Text>
            <Text style={{ color: theme.textSecondary }}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.danger }]}>
              {incidents.filter(i => i.status === 'open').length}
            </Text>
            <Text style={{ color: theme.textSecondary }}>Open</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryNum, { color: theme.primary }]}>
              {incidents.filter(i => i.status === 'resolved').length}
            </Text>
            <Text style={{ color: theme.textSecondary }}>Resolved</Text>
          </View>
        </View>

        {incidents.map(inc => (
          <View key={inc.id} style={[styles.incidentCard, { backgroundColor: theme.card }]}>
            <View style={styles.incidentHeader}>
              <View style={[styles.incidentIcon, { backgroundColor: `${theme.danger}20` }]}>
                <Ionicons name="alert-circle" size={20} color={theme.danger} />
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: inc.status === 'open' ? theme.danger : theme.primary 
              }]}>
                <Text style={styles.statusText}>{inc.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.incidentTitle, { color: theme.text }]}>{inc.title}</Text>
            <Text style={{ color: theme.textSecondary }}>{inc.date}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MESSAGE SCREEN ============
const MessageScreen = () => {
  const { theme } = useTheme();
  const conversations = [
    { id: '1', name: 'Mary Doe', role: 'Family', message: 'Thank you for the update!', unread: 2 },
    { id: '2', name: 'Dr. Smith', role: 'Physician', message: 'Monitor BP closely', unread: 0 },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenTitle, { color: theme.text, padding: 20 }]}>Messages</Text>
      {conversations.map(c => (
        <TouchableOpacity key={c.id} style={[styles.messageCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{c.name.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.messageInfo}>
            <Text style={[styles.messageName, { color: theme.text }]}>{c.name}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{c.role}</Text>
            <Text style={{ color: theme.textSecondary }} numberOfLines={1}>{c.message}</Text>
          </View>
          {c.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadText}>{c.unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

// ============ SHIFTS SCREEN ============
const ShiftsScreen = () => {
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(false);

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Shifts</Text>
        
        <View style={[styles.shiftCard, { backgroundColor: theme.card }]}>
          <View style={styles.shiftHeader}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? theme.primary : theme.textSecondary }]} />
            <Text style={[styles.shiftStatus, { color: theme.text }]}>
              {isActive ? 'Shift Active' : 'No Active Shift'}
            </Text>
            {isActive && (
              <View style={[styles.liveBadge, { backgroundColor: `${theme.primary}20` }]}>
                <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 11 }}>LIVE</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.shiftBtn, { backgroundColor: isActive ? theme.danger : theme.primary }]}
            onPress={() => setIsActive(!isActive)}
          >
            <Ionicons name={isActive ? 'stop' : 'play'} size={20} color="#fff" />
            <Text style={styles.shiftBtnText}>{isActive ? 'End Shift' : 'Start Shift'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <Ionicons name="wallet" size={24} color={theme.primary} />
          <Text style={[styles.earningsTitle, { color: theme.text }]}>This Week</Text>
          <Text style={[styles.earningsAmount, { color: theme.primary }]}>$397.50</Text>
          <Text style={{ color: theme.textSecondary }}>26.5 hours worked</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ MENU SCREEN ============
const MenuScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'earnings', label: 'Earnings', icon: 'cash-outline', color: '#25D366' },
    { id: 'history', label: 'Shift History', icon: 'time-outline', color: '#3b82f6' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline', color: '#8b5cf6' },
    { id: 'support', label: 'Support', icon: 'help-circle-outline', color: '#f59e0b' },
  ];

  return (
    <SafeAreaView style={[styles.homeContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.homeScroll}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Menu</Text>

        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200' }} 
            style={styles.profilePhoto} 
          />
          <View>
            <Text style={[styles.profileName, { color: theme.text }]}>Sarah Jenkins</Text>
            <Text style={{ color: theme.textSecondary }}>Certified Home Health Aide</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.card }]}
          onPress={toggleTheme}
        >
          <View style={styles.themeToggleLeft}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            <Text style={[{ color: theme.text, marginLeft: 12 }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <View style={[styles.toggle, { backgroundColor: isDark ? theme.primary : theme.border }]}>
            <View style={[styles.toggleKnob, { transform: [{ translateX: isDark ? 20 : 0 }] }]} />
          </View>
        </TouchableOpacity>

        {menuItems.map(item => (
          <TouchableOpacity key={item.id} style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.signOutBtn, { backgroundColor: `${theme.danger}15` }]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={{ color: theme.danger, fontWeight: '600', marginLeft: 10 }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============ AI COPILOT SCREEN ============
const AICopilotScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: "Hello! I'm your AI Care Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I'm here to help with caregiving tasks. For medication questions, always verify with the care plan. For emergencies, call 911." 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.copilotContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.copilotHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.copilotHeaderTitle}>
          <View style={[styles.copilotIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <Text style={[styles.copilotTitle, { color: theme.text }]}>AI Care Assistant</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' 
              ? [styles.userBubble, { backgroundColor: theme.primary }]
              : [styles.aiBubble, { backgroundColor: theme.card }]
          ]}>
            <Text style={{ color: item.role === 'user' ? '#fff' : theme.text }}>
              {item.content}
            </Text>
          </View>
        )}
      />

      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Ask me anything..."
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.border }]}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============ NAVIGATION ============
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CaregiverTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: route.name === 'Incident' ? theme.danger : theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Incident: focused ? 'alert-circle' : 'alert-circle-outline',
            Message: focused ? 'chatbubble' : 'chatbubble-outline',
            Shifts: focused ? 'time' : 'time-outline',
            Menu: focused ? 'menu' : 'menu-outline',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
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
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={CaregiverTabs} />
            <Stack.Screen name="AICopilot" component={AICopilotScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  // Landing
  landingContainer: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 24 },
  landingHeader: { paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginLeft: 12 },
  heroSection: { paddingTop: 40 },
  tagline: { fontSize: 36, fontWeight: '700', color: '#1c1917' },
  taglineAccent: { fontSize: 36, fontWeight: '700', color: '#25D366', marginBottom: 16 },
  heroDesc: { fontSize: 18, color: '#57534e', lineHeight: 28, marginBottom: 32 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignSelf: 'flex-start' },
  ctaText: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginRight: 8 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  featureCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  featureIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(37,211,102,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: '#1c1917' },
  
  // Role Selection
  roleContainer: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f5f4', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  roleTitle: { fontSize: 32, fontWeight: '700', color: '#1c1917', marginTop: 32 },
  roleSubtitle: { fontSize: 18, color: '#78716c', marginTop: 8, marginBottom: 32 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e7e5e4', marginBottom: 16 },
  roleIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleCardTitle: { flex: 1, fontSize: 20, fontWeight: '600', color: '#1c1917', marginLeft: 16 },

  // Auth
  authContainer: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 24 },
  authTitle: { fontSize: 32, fontWeight: '700', color: '#1c1917', marginTop: 32 },
  authSubtitle: { fontSize: 16, color: '#78716c', marginTop: 8, marginBottom: 32, textTransform: 'capitalize' },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e7e5e4', borderRadius: 12, paddingVertical: 14 },
  socialText: { fontSize: 16, fontWeight: '500', color: '#1c1917', marginLeft: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e7e5e4' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#a8a29e' },
  input: { backgroundColor: '#f5f5f4', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  loginBtn: { backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },

  // Home
  homeContainer: { flex: 1 },
  homeScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  screenTitle: { fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 20 },
  patientCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 16 },
  patientPhoto: { width: 56, height: 56, borderRadius: 16 },
  patientInfo: { flex: 1, marginLeft: 16 },
  patientName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  patientAge: { fontSize: 14 },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, marginHorizontal: -6 },
  vitalCard: { width: '48%', padding: 16, borderRadius: 16, margin: '1%' },
  vitalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  vitalValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  vitalLabel: { fontSize: 12 },
  progressCard: { borderRadius: 16, padding: 16, marginTop: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '600' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#25D366' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  taskCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  taskTime: { marginLeft: 'auto', fontSize: 14 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
  taskCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  fab: { position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 30, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  // Incident
  newIncidentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, marginBottom: 20 },
  newIncidentText: { fontSize: 17, fontWeight: '600', color: '#ffffff', marginLeft: 10 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '700' },
  incidentCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  incidentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  incidentIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
  incidentTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },

  // Messages
  messageCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20, borderRadius: 16, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  messageInfo: { flex: 1, marginLeft: 14 },
  messageName: { fontSize: 16, fontWeight: '600' },
  unreadBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },

  // Shifts
  shiftCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  shiftStatus: { fontSize: 17, fontWeight: '600', flex: 1 },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  shiftBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  shiftBtnText: { fontSize: 17, fontWeight: '600', color: '#ffffff', marginLeft: 10 },
  earningsCard: { borderRadius: 16, padding: 20, alignItems: 'center' },
  earningsTitle: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  earningsAmount: { fontSize: 36, fontWeight: '700', marginVertical: 4 },

  // Menu
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16 },
  profilePhoto: { width: 60, height: 60, borderRadius: 16, marginRight: 16 },
  profileName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 16 },
  themeToggleLeft: { flexDirection: 'row', alignItems: 'center' },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 4 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginTop: 12 },

  // AI Copilot
  copilotContainer: { flex: 1 },
  copilotHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  copilotHeaderTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  copilotIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  copilotTitle: { fontSize: 17, fontWeight: '600' },
  messagesList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 18, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

// ============ APP ENTRY ============
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

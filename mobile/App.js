import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Auth Screens
import LandingScreen from './src/screens/LandingScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import AuthScreen from './src/screens/AuthScreen';

// Caregiver Navigator & Screens
import CaregiverTabs from './src/navigation/CaregiverTabs';
import AICopilotScreen from './src/screens/caregiver/AICopilotScreen';
import PatientProfileScreen from './src/screens/caregiver/PatientProfileScreen';
import VitalsDetailScreen from './src/screens/caregiver/VitalsDetailScreen';
import TaskDetailScreen from './src/screens/caregiver/TaskDetailScreen';

const Stack = createStackNavigator();

function AuthStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function CaregiverStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="CaregiverTabs" component={CaregiverTabs} />
      <Stack.Screen 
        name="AICopilot" 
        component={AICopilotScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen 
        name="VitalsModal" 
        component={VitalsDetailScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isDark, theme } = useTheme();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.background },
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="AuthFlow" component={AuthStack} />
          ) : (
            <>
              {(user?.role === 'caregiver' || !user?.role) && (
                <Stack.Screen name="CaregiverDashboard" component={CaregiverStack} />
              )}
              {user?.role === 'family' && (
                <Stack.Screen name="FamilyDashboard" component={CaregiverStack} />
              )}
              {user?.role === 'agency' && (
                <Stack.Screen name="AgencyDashboard" component={CaregiverStack} />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

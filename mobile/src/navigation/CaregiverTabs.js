import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

// Screens
import HomeScreen from '../screens/caregiver/HomeScreen';
import IncidentScreen from '../screens/caregiver/IncidentScreen';
import MessageScreen from '../screens/caregiver/MessageScreen';
import ShiftScreen from '../screens/caregiver/ShiftScreen';
import MenuScreen from '../screens/caregiver/MenuScreen';

const Tab = createBottomTabNavigator();

export default function CaregiverTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Incident':
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              break;
            case 'Message':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Shifts':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Menu':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Incident" 
        component={IncidentScreen}
        options={{
          tabBarActiveTintColor: theme.danger,
        }}
      />
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Shifts" component={ShiftScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <LinearGradient
        colors={['#ffffff', '#f0fdf4', '#dcfce7']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="pulse" size={24} color="#ffffff" />
            </View>
            <Text style={styles.logoText}>ADLTrack</Text>
          </View>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>Simple. Secure.</Text>
          <Text style={styles.taglineAccent}>Reliable Care.</Text>
          <Text style={styles.description}>
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

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <FeatureCard 
            icon="checkmark-circle" 
            title="Task Management" 
            description="Track daily care activities"
          />
          <FeatureCard 
            icon="heart" 
            title="Vitals Monitoring" 
            description="Record & view health data"
          />
          <FeatureCard 
            icon="chatbubbles" 
            title="Care Communication" 
            description="Stay connected with family"
          />
        </View>

        {/* Bottom Trust Badge */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#25D366" />
          <Text style={styles.trustText}>HIPAA Compliant & Secure</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const FeatureCard = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#25D366" />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1917',
    marginLeft: 12,
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#25D366',
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  tagline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1c1917',
    lineHeight: 44,
  },
  taglineAccent: {
    fontSize: 36,
    fontWeight: '700',
    color: '#25D366',
    lineHeight: 44,
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#57534e',
    lineHeight: 28,
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1917',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#78716c',
    textAlign: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
    paddingVertical: 12,
  },
  trustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534e',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

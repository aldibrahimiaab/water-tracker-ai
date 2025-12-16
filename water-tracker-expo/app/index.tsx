import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WaterIcon } from '@/components/water-icon';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <ThemedView style={styles.root}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <WaterIcon size={40} color={Colors.light.tint} />
            <ThemedText style={styles.logo}>Waterly</ThemedText>
          </View>
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <ThemedText style={styles.loginText}>Log In</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroContent}>
            <View style={styles.iconBox}>
              <WaterIcon size={80} color={Colors.light.tint} />
            </View>
            
            <ThemedText style={styles.headline}>
              Your daily hydration companion
            </ThemedText>
            
            <ThemedText style={styles.subtitle}>
              Track water intake effortlessly. Build habits that matter.
            </ThemedText>

            <TouchableOpacity onPress={handleRegister} style={styles.heroButton}>
              <ThemedText style={styles.heroButtonText}>Get Started</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>✓</ThemedText>
              </View>
              <ThemedText style={styles.featureTitle}>Simple Logging</ThemedText>
              <ThemedText style={styles.featureDescription}>
                One tap to log
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>📊</ThemedText>
              </View>
              <ThemedText style={styles.featureTitle}>Track Progress</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Visual stats
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>🎯</ThemedText>
              </View>
              <ThemedText style={styles.featureTitle}>Stay Healthy</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Build habits
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <ThemedText style={styles.featureEmoji}>⚡</ThemedText>
              </View>
              <ThemedText style={styles.featureTitle}>Smart Reminders</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Stay on track
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 32,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.tint,
    letterSpacing: 0.3,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  heroContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: Colors.light.icon,
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 24,
  },
  heroButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
  },
  featureDescription: {
    fontSize: 11,
    color: Colors.light.icon,
    textAlign: 'center',
  },
});
